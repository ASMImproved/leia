/// <reference path="../../../../typings/main.d.ts" />

import {Project} from "../../../common/Project";
import {Gcc} from "../../gcc/Gcc";
import {MipsRunner} from "./MipsRunner";
import path = require('path');
import events = require('events');
import {MemoryFrame} from "../../../common/MemoryFrame";
import * as dbgmits from "asmimproved-dbgmits";

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

    public readMemory(frame: MemoryFrame, cb: (err:any, blocks?: dbgmits.IMemoryBlock[])=>any) {
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
}