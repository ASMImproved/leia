/// <reference path="../../typings/main.d.ts" />

import {AbstractCommand, Command} from "./command/Command";
import {MipsSession} from "./arch/mips/MipsSession";
import {ExecutionContext} from "./command/ExecutionContext";
import {AnswerContext} from "../common/AnswerContext";
import {basename} from "path";
import {SourceLocation, Registers} from "../common/Debugger";
import * as dbgmits from "asmimproved-dbgmits";

@Command({
    name: 'run'
})
export class RunCommand extends AbstractCommand {
    private executionContext: ExecutionContext;

    execute(payload:any, executionContext: ExecutionContext, callback:any) {
        this.executionContext = executionContext;
        if(executionContext.socketSession.mipsSession) {
            if(executionContext.socketSession.mipsSession.state != "terminated") {
                return callback(new Error("Session is already running"));
            } else {
                executionContext.socketSession.mipsSession.dispose();
                delete executionContext.socketSession.mipsSession;
            }
        }
        let mips = executionContext.socketSession.mipsSession = new MipsSession(payload.project);
        mips.run((err) => {
            if(err) {
                return callback(err);
            }
            mips.mipsProgram.debuggerStartedPromise.then(() => {
                executionContext.socketSession.mipsSession.readMemory(executionContext.socketSession.memoryFrame, (err, blocks) => {
                    if(err) {
                        return callback(err);
                    }
                    callback(null, {
                        ok: true
                    }, [new AnswerContext("memoryUpdate", blocks)]);
                });
            });
        });
        mips.on('stdout', (chunk) => {
            console.log(chunk);
            executionContext.socketSession.emit('stdout', chunk, []);
        });
        mips.on('hitBreakpoint', (stoppedEvent: dbgmits.IBreakpointHitEvent) => {
            this.sendProgramStoppedEvent(new SourceLocation(basename(stoppedEvent.frame.filename), stoppedEvent.frame.line), stoppedEvent.breakpointId);
        });
        mips.on('exit', (code: number, signal: string) => {
            executionContext.socketSession.emit('exit', {
                code: code,
                signal: signal
            }, []);
        });
    }

    sendProgramStoppedEvent(location: SourceLocation, breakpointId?: any) {
        this.executionContext.socketSession.mipsSession.getMachineState(this.executionContext.socketSession.memoryFrame, (err, memoryBlocks?: dbgmits.IMemoryBlock[], registers?: Registers) => {
            if(err) {
                console.error(err);
                return this.executionContext.socketSession.emit('programStopped', {
                    location: location,
                    breakpointId: breakpointId
                }, []);
            }
            this.executionContext.socketSession.emit('programStopped', {
                location: location,
                breakpointId: breakpointId
            }, [new AnswerContext("memoryUpdate", memoryBlocks), new AnswerContext("registerUpdate", registers)]);
        });
    }
}
