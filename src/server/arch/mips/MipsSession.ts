/// <reference path="../../../../typings/main.d.ts" />

import {Project} from "../../../common/Project";
import {Gcc} from "../../gcc/Gcc";
import {MipsRunner} from "./MipsRunner";
import path = require('path');
import events = require('events');
import {MemoryFrame} from "../../../common/MemoryFrame";
import * as dbgmits from "asmimproved-dbgmits";
import {Registers, ISourceLocation} from "../../../common/Debugger";
import {RegisterValueFormatSpec} from "asmimproved-dbgmits/lib/index";
import async = require('async');

export class MipsSession extends events.EventEmitter{
    private _mipsProgram: MipsRunner;
    private _state: string;

    constructor(private project: Project) {
        super();
        this._state = "init";
    }

    public run(cb) {
        this._state = "compiling";
        let gcc: Gcc = new Gcc(this.project);
        gcc.compile((err, stdout, stderr, dirPath) => {
            if(err) {
                this._state = "error";
                return cb(err);
            }

            this._state = "starting";
            this._mipsProgram = new MipsRunner(path.join(dirPath, "proj.out"));
            this._mipsProgram.run();
            this._mipsProgram.on('debuggerPortReady', () => {
                this._mipsProgram
                    .connectDebugger()
                    .then(() => {
                        this._state = "broken";
                        console.log("connected debugger");
                        cb();
                    })
                    .catch((error) => {
                        this._state = "error";
                        console.error('debugger failed', error);
                        cb(error);
                    });
                this._mipsProgram.debuggerStartedPromise.then(()=> {
                    let debug = this._mipsProgram.debug;
                    debug.on(dbgmits.EVENT_BREAKPOINT_HIT, (stoppedEvent: dbgmits.IBreakpointHitEvent) => {
                        this._state = "broken";
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
                this._state = "terminated";
                this.emit('exit', code, signal);
                console.log("terminated");
            });
        });
    }

    public continue(cb) {
        if(!(this._state == "broken")) {
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
        if(!(this._state == "broken")) {
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

    public get state(): string {
        return this._state;
    }

    public readMemory(frame: MemoryFrame, cb: (err:any, blocks?: dbgmits.IMemoryBlock[])=>any) : void {
        if(this._state != "broken" && this._state != "terminated") {
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
        if(this._state != "broken" && this._state != "terminated") {
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
