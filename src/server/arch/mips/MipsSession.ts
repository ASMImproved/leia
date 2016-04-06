/// <reference path="../../../../typings/main.d.ts" />

import {Project} from "../../../common/Project";
import {Gcc} from "../../gcc/Gcc";
import {MipsRunner} from "./MipsRunner";
import path = require('path');
import events = require('events');

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
            this._mipsProgram.on('debuggerPortReady', () => {
                this._mipsProgram
                    .connectDebugger()
                    .then(() => {
                        console.log("connected debugger");
                        cb();
                    })
                    .catch((error) => {
                        this._state = "error";
                        console.error('debugger failed', error);
                        cb(error);
                    });
            });
            this._mipsProgram.execution.on('exit', (code: number, signal: string) => {
                console.log("terminated");
            });
        });
    }

    public dispose() {
        this._mipsProgram.dispose();
    }

    public get mipsProgram() {
        return this._mipsProgram;
    }

    public get state(): string {
        return this._state;
    }
}