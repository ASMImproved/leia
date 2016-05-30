import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {ISourceLocation} from "../../common/Debugger";

@Command({
    name: 'removeCellWatch'
})
export class RemoveCellWatchCommand extends AbstractCommand<number> {

    execute(breakpointId:number, executionContext:ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.mipsSession.removeWatchExpression(breakpointId, (err) => {
            callback(err);
        })
    }

    public canUse(payload:any):payload is number {
        return typeof payload == 'number';
    }
}
