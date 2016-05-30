import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {ISourceLocation} from "../../common/Debugger";

@Command({
    name: 'watchCell'
})
export class WatchCellCommand extends AbstractCommand<number> {

    execute(address:number, executionContext:ExecutionContext, callback:CommandCallback) {
        const watchExpression = `*${address}`;
        console.log('watching', watchExpression);
        executionContext.socketSession.mipsSession.addWatchExpression(watchExpression, (err, watchId: number) => {
            if (err) {
                return callback(err);
            }
            callback(null, watchId);
        })
    }

    public canUse(payload:any):payload is number {
        return typeof payload == 'number';
    }
}
