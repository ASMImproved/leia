/// <reference path="../../../../typings/index.d.ts" />

import {Project} from "../../../common/Project";
import * as request from "request";
let tar = require('tar');
let fstream = require('fstream');
var temp = require('temp');
import fs = require('fs');
import util = require('util');
import {MipsRunner} from "./MipsRunner";
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

    constructor(private project: Project) {
        super();
    }

    public run(cb) {
        this.createContainer((err, containerId) => {
            if(err) {
                return cb(err);
            }
            this.copyProjectIntoContainer(containerId, (err, files) => {
                if(err) {
                    return cb(err);
                }
                console.log('container id of successfully created container with project', containerId);

                this.compile(containerId, files, (err) => {
                    if(err) {
                        return cb(err);
                    }
                    console.log('compilation successfull');
                    cb();
                })
            });
        });
        /*
        this._state = MipsSessionState.Compiling;
        this._state = MipsSessionState.Starting;

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
        this._mipsProgram.on('stdout', (chunk) => {
            this.emit('stdout', chunk);
        });
        this._mipsProgram.on('stderr', (chunk) => {
            this.emit('stderr', chunk);
        });
        this._mipsProgram.on('exit', (code: number, signal: string) => {
            this._state = MipsSessionState.Terminated;
            this.emit('exit', code, signal);
            console.log("terminated");
        });
        */
    }

    private createContainer(cb) {
        request.post({
            url: 'http://unix:/var/run/docker.sock:/containers/create',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                "Tty": false,
                "OpenStdin": true,
                "StdinOnce": false,
                "Image": "mips",
                "Labels": {
                    "com.github.asmimproved.leia": "true"
                },
                "NetworkDisabled": true
            },
            json: true
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 201) {
                return cb(new Error(`Docker create returned error status code: ${response.statusCode} ${body}`));
            }
            if(body.Warnings) {
                console.warn('Docker create returned warnings:', body.Warnings);
            }
            let containerId = body.Id;
            request.post({
                url: `http://unix:/var/run/docker.sock:/containers/${containerId}/start`
            }, (err, response, body) => {
                if(err) {
                    return cb(err);
                }
                if(response.statusCode !== 204) {
                    return cb(new Error(`Docker start return error status code ${response.statusCode} ${body}`));
                }
                return cb(null, containerId);
            });
        });
    }

    private copyProjectIntoContainer(containerId, cb) {
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

                    let dockerRequestStream = request.put({
                        url: `http://unix:/var/run/docker.sock:/containers/${containerId}/archive?path=/import`,
                        headers: {
                            'Content-Type': 'application/x-tar'
                        }
                    }, (err, response, body) => {
                        if (err) {
                            return cbWithError(err);
                        }
                        if (response.statusCode !== 200) {
                            return cbWithError(new Error(`Failed to extract in container with status code ${response.statusCode} ${body}`));
                        }
                        let files = result.map((file) => {
                            return path.join('/import/src', file);
                        });
                        return cbWithSuccess(files);
                    });

                    let projectFileStream = fstream.Reader({path: srcDirPath, type: "Directory"})
                        .on('error', (err) => {
                            cbWithError(err);
                        })
                        .pipe(packer)
                        .pipe(dockerRequestStream)
                });
            });
        });
    }

    private compile(containerId, files, cb) {
        request.post({
            url: `http://unix:/var/run/docker.sock:/containers/${containerId}/exec`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
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
            },
            json: true
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 201) {
                return cb(new Error(`Docker create exec return error status code ${response.statusCode} ${body}`));
            }
            let execId = body.Id;
            let gccCommand = util.format("mips-linux-gnu-gcc -g -static -mips32r5 -o %s %s", '/out/proj.out', files.join(' '));
            console.log('run gcc "%s"', gccCommand);
            let execRequestBody = JSON.stringify({
                
            });
            request.post({
                url: `http://unix:/var/run/docker.sock:/exec/${execId}/start`,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': execRequestBody.length
                },
                body: execRequestBody
            }, (err, response, body) => {
                if(err) {
                    return cb(err);
                }
                if(response.statusCode !== 200) {
                    return cb(new Error(`Docker start exec return an error status code ${response.statusCode} ${body}`));
                }
                let stdout = body, stderr = '';
                request.get({
                    url: `http://unix:/var/run/docker.sock:/exec/${execId}/json`,
                    json: true
                }, (err, response, body) => {
                    if(err) {
                        return cb(err);
                    }
                    if(response.statusCode !== 200) {
                        return cb(new Error(`Docker exec inspect return error status code ${response.statusCode} ${body}`));
                    }
                    if(body.ExitCode != 0) {
                        console.log(body);
                        return cb(new Error(`Gcc return non-zero exit code ${body.ExitCode} ${stdout}`));
                    } else {
                        return cb(null, stdout, stderr);
                    }
                });
            });
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
        this._mipsProgram.dispose();
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
