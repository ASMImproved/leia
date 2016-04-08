
import {Command, AbstractCommand} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";

@Command({
    name: 'addBreakpoint'
})
export class AddBreapointCommand extends AbstractCommand {

    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
        executionContext.socketSession.mipsSession.addBreakpoint(payload, (err, breakpoint) => {
            if(err) {
                return callback(err);
            }
            callback(null, breakpoint);
        });
    }
}