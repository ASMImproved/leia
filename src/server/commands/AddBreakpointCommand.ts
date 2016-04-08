
import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";

@Command({
    name: 'addBreakpoint'
})
export class AddBreakpointCommand extends AbstractCommand {

    execute(payload:any, executionContext:ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.mipsSession.addBreakpoint(payload, (err, breakpoint) => {
            if(err) {
                return callback(err);
            }
            callback(null, breakpoint);
        });
    }
}