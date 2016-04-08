
import {Command, AbstractCommand} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";
import {SourceLocation} from "../../common/Debugger";
import {basename} from "path";
import * as dbgmits from "asmimproved-dbgmits";

@Command({
    name: 'step'
})
export class StepCommand extends AbstractCommand {

    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
        if(!executionContext.socketSession.mipsSession) {
            return callback(new Error("No active session"));
        }
        executionContext.socketSession.mipsSession.step((err, stoppedEvent: dbgmits.IStepFinishedEvent) => {
            executionContext.socketSession.mipsSession.getMachineState(executionContext.socketSession.memoryFrame, (err, memoryBlocks, registers) => {
                if(err) {
                    return callback(null, {
                        location: new SourceLocation(basename(stoppedEvent.frame.filename), stoppedEvent.frame.line)
                    }, []);
                }
                callback(null, {
                    location: new SourceLocation(basename(stoppedEvent.frame.filename), stoppedEvent.frame.line)
                }, [new AnswerContext("memoryUpdate", memoryBlocks), new AnswerContext("registerUpdate", registers)]);
            })
        });
    }

}