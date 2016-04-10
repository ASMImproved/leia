
import {AbstractCommand, Command} from "./../command/Command";
import {ExecutionContext} from "../command/ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";

@Command({
    name: 'stop'
})
export class StopCommand extends AbstractCommand<void> {


    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
        executionContext.socketSession.stopMipsSession(() => {
            callback(null, {}, []);
        });

    }

    canUse(payload:any): payload is void {
        return true;
    }
}