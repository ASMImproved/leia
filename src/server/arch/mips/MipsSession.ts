/// <reference path="../../../../typings/index.d.ts" />

import {Project} from "../../../common/Project";
let tar = require('tar');
let fstream = require('fstream');
var temp = require('temp');
import fs = require('fs');
import util = require('util');
import {MipsRunner} from "./MipsRunner";
import {DockerClient} from "../../docker/DockerClient"
import path = require('path');
import events = require('events');
import {MemoryFrame} from "../../../common/MemoryFrame";
import * as dbgmits from "asmimproved-dbgmits";
import {Registers, ISourceLocation} from "../../../common/Debugger";
import {RegisterValueFormatSpec} from "asmimproved-dbgmits/lib/index";
import async = require('async');

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
    private _mipsProgram: MipsRunner;
    private _state: MipsSessionState = MipsSessionState.Init;
    private docker: DockerClient;

    constructor(private project: Project) {
        super();
        this.docker = new DockerClient({
            unixSocketPath: '/var/run/docker.sock'
        });
    }

    public run(cb) {
        this._state = MipsSessionState.Compiling;
        this.createContainer((err, containerId) => {
            if(err) {
                return cb(err);
            }
            this.copyProjectIntoContainer(containerId, (err, files) => {
                if(err) {
                    return cb(err);
                }
                this.compile(containerId, files, (err) => {
                    if(err) {
                        return cb(err);
                    }
                    this._state = MipsSessionState.Starting;
                    this.startQemu(containerId, (err, socket, execId) => {
                        if(err) {
                            return cb(err);
                        }
                        socket.on('close', () => {
                            this._state = MipsSessionState.Terminated;
                            this.getQemuExitCode(execId, (err, exitCode) => {
                                if(err) {
                                    return this.emit('exit', null, null);
                                }
                                this.emit('exit', exitCode);
                                this.docker.removeContainer(containerId, (err) => {
                                    if(err) {
                                        console.error(`Failed to delete container ${containerId}`, err);
                                    }
                                });
                            });
                        });
                        socket.setEncoding('ascii');
                        socket.on('data', (chunk) => {
                            this.emit('stdout', chunk);
                        });
                        /*
                        this._mipsProgram.on('stderr', (chunk) => {
                            this.emit('stderr', chunk);
                        });
                        */
                        cb();
                    });
                })
            });
        });
        /*
        this._mipsProgram.on('debuggerPortReady', () => {
            this._mipsProgram
                .connectDebugger()
                .then(() => {
                    this._state = MipsSessionState.Broken;
                    console.log("connected debugger");
                    cb();
                })
                .catch((error) => {
                    this._state = MipsSessionState.Error;
                    console.error('debugger failed', error);
                    cb(error);
                });
            this._mipsProgram.debuggerStartedPromise.then(()=> {
                let debug = this._mipsProgram.debug;
                debug.on(dbgmits.EVENT_BREAKPOINT_HIT, (stoppedEvent: dbgmits.IBreakpointHitEvent) => {
                    this._state = MipsSessionState.Broken;
                    this.emit("hitBreakpoint", stoppedEvent);

                });
            });
        });
        */
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
            "NetworkDisabled": true
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
                "/out/proj.out"
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
                /*"-g",
                 String(567),*/
                "/out/proj.out"
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

    public continue(cb) {
        if(!(this._state == MipsSessionState.Broken)) {
            return cb(new Error("Nothing to continue"));
        }
        this._mipsProgram.debug.resumeInferior()
            .then(() => {
                console.log('resumed');
                cb();
            })
            .catch((err) => {
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
        this.mipsProgram.debug.once(dbgmits.EVENT_STEP_FINISHED, stepFinishedCb);
        this._mipsProgram.debug.stepIntoInstruction()
            .catch((err) => {
                this.mipsProgram.debug.removeListener(dbgmits.EVENT_STEP_FINISHED, stepFinishedCb);
                cb(err);
            });
    }

    public dispose() {
        this.removeAllListeners();
        // todo: remove container
    }

    public get mipsProgram() {
        return this._mipsProgram;
    }

    public get state(): MipsSessionState {
        return this._state;
    }

    public readMemory(frame: MemoryFrame, cb: (err:any, blocks?: dbgmits.IMemoryBlock[])=>any) : void {
        if(this._state != MipsSessionState.Broken && this._state != MipsSessionState.Terminated) {
            return cb(new Error("Not in state to read memory"));
        }
        this._mipsProgram.debug.readMemory("0x" + frame.start.toString(16), frame.length)
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
            this.mipsProgram.debug
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
            this.mipsProgram.debug
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
            console.log(registers);
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
        this.mipsProgram.debug.addBreakpoint(location.locationString)
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

    removeBreakpoint(breakpointId:number, cb:(err)=> any) {
        this.mipsProgram.debug.removeBreakpoint(breakpointId)
            .then(() => {
                cb(null);
            })
            .catch((err) => {
                cb(err);
            })
    }
}
