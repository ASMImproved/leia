import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {ISourceLocation} from "../../common/Debugger";

@Command({
    name: 'watchCell'
})
export class WatchCellCommand extends AbstractCommand<string> {

    execute(expression:string, executionContext:ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.mipsSession.addWatch(`*${expression}`, (err, watchId: string) => {
            if (err) {
                return callback(err);
            }
            callback(null, watchId);
        })
    }

    public canUse(payload:any):payload is string {
        return typeof payload == 'string';
    }
}
