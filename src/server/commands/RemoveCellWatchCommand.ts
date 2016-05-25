import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {ISourceLocation} from "../../common/Debugger";

@Command({
    name: 'removeCellWatch'
})
export class RemoveCellWatchCommand extends AbstractCommand<string> {

    execute(breakpointId:string, executionContext:ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.mipsSession.removeWatch(breakpointId, (err) => {
            callback(err);
        })
    }

    public canUse(payload:any):payload is string {
        return typeof payload == 'string';
    }
}
