/// <reference path="../../../../typings/main.d.ts" />

import {Project} from "../../../common/Project";
import {Gcc} from "../../gcc/Gcc";
import {MipsRunner} from "./MipsRunner";
import path = require('path');
import events = require('events');

export class MipsSession extends events.EventEmitter{
    private _mipsProgram: MipsRunner;


    constructor(private project: Project) {
        super();
    }

    public run(cb) {
        let gcc: Gcc = new Gcc(this.project);
        gcc.compile((err, stdout, stderr, dirPath) => {
            if(err) {
                return cb(err);
            }

            this._mipsProgram = new MipsRunner(path.join(dirPath, "proj.out"));
            this._mipsProgram.on('debuggerPortReady', () => {
                this._mipsProgram
                    .connectDebugger()
                    .then(() => {
                        console.log("connected debugger");
                        cb();
                    })
                    .catch((error) => {
                        console.error('debugger failed', error);
                        cb(error);
                    });
            });
        });
    }

    public dispose() {

    }

    public get mipsProgram {
        return this._mipsProgram;
    }
}