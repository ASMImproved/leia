
import {Command, AbstractCommand, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";
import {ISourceLocation} from "../../common/Debugger";

@Command({
    name: 'addBreakpoint'
})
export class AddBreakpointCommand extends AbstractCommand<ISourceLocation> {

    execute(payload:any, executionContext:ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.mipsSession.addBreakpoint(payload, (err, breakpoint) => {
            if(err) {
                return callback(err);
            }
            callback(null, breakpoint);
        });
    }

    public canUse(payload:any):payload is ISourceLocation {
        return typeof payload.filename == 'string'
            && typeof payload.line == 'number'
            && typeof payload.locationString == 'string'
    }
}
