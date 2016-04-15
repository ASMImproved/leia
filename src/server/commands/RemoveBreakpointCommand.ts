import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";

@Command({
    name: 'removeBreakpoint'
})
export class RemoveBreakpointCommand extends AbstractCommand<number> {

    execute(payload:any, executionContext:ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.mipsSession.removeBreakpoint(payload, (err) => {
            if(err) {
                return callback(err);
            }
            callback(null);
        });
    }

    public canUse(payload:any):payload is number {
        return typeof payload == 'number';
    }
}
