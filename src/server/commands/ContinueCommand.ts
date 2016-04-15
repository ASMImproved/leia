
import {AbstractCommand, Command, CommandCallback} from "./../command/Command";
import {ExecutionContext} from "./../command/ExecutionContext";

@Command({
    name: 'continue'
})
export class ContinueCommand extends AbstractCommand<Object> {
    execute(payload:any, executionContext: ExecutionContext, callback: CommandCallback) {
        executionContext.socketSession.mipsSession.continue((err) => {
            callback(err, {}, []);
        });
    }

    public canUse(payload:any):payload is Object {
        return true;
    }
}
