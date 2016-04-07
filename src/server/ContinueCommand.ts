
import {ICommand} from "./command/ICommand";
import {ExecutionContext} from "./command/ExecutionContext";

export class ContinueCommand implements ICommand {
    execute(payload:any, executionContext: ExecutionContext, callback: (err, answer?, answerContext?) => any) {
        executionContext.socketSession.mipsSession.continue((err) => {
            callback(err, {}, []);
        });
    }
}