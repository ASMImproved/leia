
import {AbstractCommand, Command} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";

@Command({
    name: 'continue'
})
export class ContinueCommand extends AbstractCommand {
    execute(payload:any, executionContext: ExecutionContext, callback: (err, answer?, answerContext?) => any) {
        executionContext.socketSession.mipsSession.continue((err) => {
            callback(err, {}, []);
        });
    }
}
