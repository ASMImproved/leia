/// <reference path="../../../../typings/index.d.ts" />

import {Project} from "../../../common/Project";
let tar = require('tar');
let fstream = require('fstream');
var temp = require('temp');
import fs = require('fs');
import util = require('util');
import {DockerClient} from "../../docker/DockerClient"
import path = require('path');
import events = require('events');
import {MemoryFrame} from "../../../common/MemoryFrame";
import * as dbgmits from "asmimproved-dbgmits";
import {Registers, ISourceLocation} from "../../../common/Debugger";
import {RegisterValueFormatSpec} from "asmimproved-dbgmits/lib/index";
import async = require('async');
import {Subject} from "rxjs/Rx";
import {DockerExecInstance} from "../../docker/DockerExecInstance";

export enum MipsSessionState {
    Init,
    Compiling,
    Starting,
    Broken,
    Running,
    Terminated,
    DebuggerClosed,
    Error
}

export class MipsSession extends events.EventEmitter{
    private _state: MipsSessionState = MipsSessionState.Init;
    private _debugger: dbgmits.DebugSession;
    private docker: DockerClient;
    private containerId: string;
    private containerRemovalRequested = false;
    private static ELF_FILE_LOCATION = "/out/proj.out";
    private static GDB_PORT = 5678;
    public debuggerStartedPromise: Promise<void>;

    constructor(private project: Project) {
        super();
        this.docker = new DockerClient({
            unixSocketPath: '/var/run/docker.sock'
        });
    }

    public run(cb) {
        let cbWithError = (err) => {
            this._state = MipsSessionState.Error;
            cb(err);
        }
        this._state = MipsSessionState.Compiling;
        this.createContainer((err, containerId) => {
            if(err) {
                return cbWithError(err);
            }
            this.containerId = containerId;
            this.copyProjectIntoContainer(containerId, (err, files) => {
                if(err) {
                    return cbWithError(err);
                }
                this.compile(containerId, files, (err) => {
                    if(err) {
                        return cbWithError(err);
                    }
                    this._state = MipsSessionState.Starting;
                    this.startQemu(containerId, (err, qemu: DockerExecInstance, execId) => {
                        if(err) {
                            return cbWithError(err);
                        }
                        qemu.on('close', () => {
                            this._state = MipsSessionState.Terminated;
                            this.getQemuExitCode(execId, (err, exitCode) => {
                                if(err) {
                                    return this.emit('exit', null, null);
                                }
                                this.emit('exit', exitCode);
                                //this.removeContainer();
                            });
                        });
                        qemu.stdout.on('data', (chunk) => {
                            this.emit('stdout', chunk.toString());
                        });
                        qemu.stderr.on('data', (chunk) => {
                            this.emit('stderr', chunk.toString());
                        });
                        this.connectDebugger((err, debuggerStartedPromise) => {
                            if(err) {
                                return cbWithError(err);
                            }
                            this.debuggerStartedPromise = debuggerStartedPromise;
                            debuggerStartedPromise.then(() => {
                                this._state = MipsSessionState.Broken;
                                console.log("connected debugger");
                                this._debugger.on(dbgmits.EVENT_BREAKPOINT_HIT, (stoppedEvent: dbgmits.IBreakpointHitEvent) => {
                                    this._state = MipsSessionState.Broken;
                                    this.emit("hitBreakpoint", stoppedEvent);
                                });
                                this._debugger.on(dbgmits.EVENT_TARGET_RUNNING, (threadId: string) => {
                                    this.emit("programContinued");
                                });
                                this._debugger.on(dbgmits.EVENT_SIGNAL_RECEIVED, (signal: dbgmits.ISignalReceivedEvent) => {
                                    this._state = MipsSessionState.Broken;
                                    console.log('received signal', signal);
                                    this.emit("receivedSignal", signal);
                                });
                                cb();
                            }, (error) => {
                                this._state = MipsSessionState.Error;
                                console.error('debugger failed', error);
                                cbWithError(error);
                            });
                        });
                    });
                })
            });
        });
    }

    private removeContainer() {
        if(this.containerId) {
            if(!this.containerRemovalRequested) {
                this.containerRemovalRequested = true;
                this.docker.removeContainer(this.containerId, (err) => {
                    if(err) {
                        console.error(`Failed to delete container ${this.containerId}`, err);
                    }
                });
            }
        }
    }

    private createContainer(cb) {
        this.docker.createContainer({
            "Tty": false,
            "OpenStdin": true,
            "StdinOnce": false,
            "Image": "mips",
            "Labels": {
                "com.github.asmimproved.leia": "true"
            },
            "NetworkDisabled": true,
            "HostConfig": {
                "Capdrop": [],
                "PidsLimit": 1000,
                "BlkioWeight": 10,
                "Memory": 100000000,
                "MemorySwap": 100000000,
                "CpuShares": 200
            }
        }, (err, containerId) => {
            if(err) {
                return cb(err);
            }
            this.docker.startContainer(containerId, (err) => {
                if(err) {
                    return cb(err);
                }
                return cb(null, containerId);
            });
        });
    }

    private copyProjectIntoContainer(containerId, cb) {
        // multiple error might be fired, however the callback function should only be called once
        let lastErr;
        function cbWithError(err) {
            if(!lastErr) {
                lastErr = err;
                return cb(err);
            }
        }
        function cbWithSuccess(files) {
            // while docker might return success, there might have been something wrong on the way
            if(lastErr) {
                console.warn('Docker archive returned success while the following error has happened before: ', lastErr);
            }
            cb(null, files);
        }

        temp.mkdir('', (err, tempDirPath) => {
            if(err) {
                cbWithError(err);
            }
            let srcDirPath: string = path.join(tempDirPath, 'src');
            fs.mkdir(srcDirPath, (err) => {
                if(err) {
                    return cbWithError(err);
                }
                async.parallel(this.project.files.map((file) => {
                    return function (cb) {
                        var filepath:string = path.join(srcDirPath, file.name);
                        fs.writeFile(filepath, file.content, (err:NodeJS.ErrnoException) => {
                            cb(err, file.name);
                        });
                    }
                }), (err, result:Array<string>) => {
                    if (err) {
                        return cbWithError(err);
                    }

                    let packer = tar.Pack({noProprietary: true});
                    packer.on('error', (err) => {
                        cbWithError(err);
                    });

                    let tarProjectFileStream = fstream.Reader({path: srcDirPath, type: "Directory"})
                        .on('error', (err) => {
                            cbWithError(err);
                        })
                        .pipe(packer);

                    this.docker.copyFilesFromStreamIntoContainer(containerId, '/import/', tarProjectFileStream, (err) => {
                        if(err) {
                            return cbWithError(err);
                        }
                        let files = result.map((file) => {
                            return path.join('/import/src', file);
                        });
                        cbWithSuccess(files);
                    });
                });
            });
        });
    }

    private compile(containerId, files, cb) {
        this.docker.execAsync(containerId, {
            "AttachStdin": false,
            "AttachStdout": true,
            "AttachStderr": true,
            "Tty": false,
            "Cmd": [
                "mips-linux-gnu-gcc",
                "-g",
                "-static",
                "-mips32r5",
                "-o",
                MipsSession.ELF_FILE_LOCATION
            ].concat(files)
        }, (err, inspect, stdout, stderr) => {
            if(inspect.ExitCode != 0) {
                return cb(new Error(`Gcc returned non-zero exit code ${inspect.ExitCode} ${stdout}`));
            } else {
                return cb(null, stdout, stderr);
            }
        });
    }

    private startQemu(containerId, cb) {
        this.docker.execAsStream(containerId, {
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": true,
            "Tty": false,
            "Cmd": [
                "qemu-mips",
                "-g",
                String(MipsSession.GDB_PORT),
                MipsSession.ELF_FILE_LOCATION
            ]
        }, null, cb);
    }

    private getQemuExitCode(execId, cb) {
        this.docker.inspectExec(execId, (err, inspect) => {
            if(err) {
                return cb(err);
            }
            return cb(null, inspect.ExitCode);
        });
    }

    private connectDebugger(cb) {
        this.docker.execAsStream(this.containerId, {
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": false,
            "Tty": false,
            "Cmd": [
                "gdb-multiarch",
                "--interpreter",
                "mi"
            ]
        }, {
            stdin: true,
            stdout: true,
            stderr: false
        }, (err, gdbProcess: DockerExecInstance) => {
            if(err) {
                return cb(err);
            }
            let debuggerSocketClosed: Promise<void> = new Promise<void>((resolve, reject) => {
                gdbProcess.on('close', () => {
                    console.log('debugger socket closed');
                    resolve();
                });
            });
            this._debugger = dbgmits.startGDBDebugSessionFromExistingProcess(gdbProcess.stdout, gdbProcess.socket, debuggerSocketClosed);
            let debuggerStartedPromise = this._debugger
                .setExecutableFile(MipsSession.ELF_FILE_LOCATION)
                .then(() => {
                    return this._debugger.connectToRemoteTarget("127.0.0.1", MipsSession.GDB_PORT);
                });
            return cb(null, debuggerStartedPromise);
        });
    }

    public continue(cb) {
        if(!(this._state == MipsSessionState.Broken)) {
            return cb(new Error("Nothing to continue"));
        }
        this._debugger.resumeInferior()
            .then(() => {
                this._state = MipsSessionState.Running;
                console.log('resumed');
                cb();
            })
            .catch((err) => {
                this._state = MipsSessionState.Error;
                console.error('failed to resume', err);
                cb(err);
            });
    }

    public step(cb) {
        if(!(this._state == MipsSessionState.Broken)) {
            return cb(new Error("Nothing to continue"));
        }
        let stepFinishedCb = (stoppedEvent: dbgmits.IStepFinishedEvent) => {
            cb(null, stoppedEvent);
        };
        this._debugger.once(dbgmits.EVENT_STEP_FINISHED, stepFinishedCb);
        this._debugger.stepIntoInstruction()
            .catch((err) => {
                this._debugger.removeListener(dbgmits.EVENT_STEP_FINISHED, stepFinishedCb);
                cb(err);
            });
    }

    public dispose() {
        this.removeContainer();
        this.removeAllListeners();
    }

    public get state(): MipsSessionState {
        return this._state;
    }

    public readMemory(frame: MemoryFrame, cb: (err:any, blocks?: dbgmits.IMemoryBlock[])=>any) : void {
        if(this._state != MipsSessionState.Broken && this._state != MipsSessionState.Terminated) {
            return cb(new Error("Not in state to read memory"));
        }
        this._debugger.readMemory("0x" + frame.start.toString(16), frame.length)
            .then((blocks: dbgmits.IMemoryBlock[]) => {
                return cb(null, blocks);
            }, (err) => {
                cb(err);
            });
    }

    public readRegisters(cb: (err: any, registers?: Registers) => any) : void {
        if(this._state != MipsSessionState.Broken && this._state != MipsSessionState.Terminated) {
            return cb(new Error("Not in state to read registers"));
        }
        let registers: Registers = [];
        let registerNames: Promise<void> =
            this._debugger
                .getRegisterNames()
                .then((names: string[]) => {
                    for (let i = 0; i < names.length; ++i) {
                        if (registers[i] === undefined) {
                            registers[i] = {
                                name: null,
                                value: 0
                            }
                        }
                        registers[i].name = names[i];
                    }
                });
        let registerValues: Promise<void> =
            this._debugger
                .getRegisterValues(RegisterValueFormatSpec.Binary)
                .then((values: Map<number, string>) => {
                    values.forEach((registerValue:string, registerNumber:number) => {
                        if (registers[registerNumber] === undefined) {
                            registers[registerNumber] = {
                                name: null,
                                value: 0
                            }
                        }
                        registers[registerNumber].value = Number.parseInt(registerValue, 2);
                    });
                });
        Promise.all([registerValues, registerNames]).then(() => {
            cb(null, registers);
        }, (err) => {
            cb(err);
        });
    }

    public getMachineState(frame: MemoryFrame, cb: (err, memoryBlocks?: dbgmits.IMemoryBlock[], registers?: Registers) => any) : void {
        async.parallel({
            memory: (cb) => {
                this.readMemory(frame, cb);
            },
            registers: (cb) => {
                this.readRegisters(cb);
            }
        }, function(err, results) {
            if(err) {
                return cb(err);
            }
            let memory: any = results["memory"];
            let registers: any = results["registers"];
            cb(err, memory, registers);
        });
    }

    public addBreakpoint(location: ISourceLocation, cb: (err, breakpoint?) => any) {
        this._debugger.addBreakpoint(location.locationString)
            .then((breakpoint: dbgmits.IBreakpointInfo) => {
                cb(null, {
                    location: location,
                    pending: breakpoint.pending !== undefined,
                    id: breakpoint.id
                });
            })
            .catch((err: any) => {
                cb(err);
            });
    }

    public getStackFrame(cb) {
        this._debugger.getStackFrame()
            .then((stackFrame: dbgmits.IStackFrameInfo)=> {
                cb(null, stackFrame);
            })
            .catch((err) => {
                cb(err);
            });
    }

    removeBreakpoint(breakpointId:number, cb:(err)=> any) {
        this._debugger.removeBreakpoint(breakpointId)
            .then(() => {
                cb(null);
            })
            .catch((err) => {
                cb(err);
            })
    }
}
