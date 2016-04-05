
import {ICommand} from "./command/ICommand";
import {MipsSession} from "./arch/mips/MipsSession";
import {ExecutionContext} from "./command/ExecutionContext";

export class RunCommand implements ICommand {

    execute(payload:any, executionContext: ExecutionContext, callback:any) {
        if(executionContext.socketSession.mipsSession) {
            if(executionContext.socketSession.mipsSession.state != "terminated") {
                return callback(new Error("Session is already running"));
            } else {
                executionContext.socketSession.mipsSession.dispose();
                delete executionContext.socketSession.mipsSession;
            }
        }
        let mips = executionContext.socketSession.mipsSession = new MipsSession(payload.project);
        mips.run((err) => {
            if(err) {
                return callback(err);
            }
            mips.mipsProgram.debuggerStartedPromise.then(() => {
                
            });
            callback(null, {
                ok: true
            }, []);
        });
        mips.mipsProgram.execution.stdout.on('data', (chunk) => {
            executionContext.socketSession.emit('stdout', chunk);
        });
        mips.mipsProgram.execution.on('exit', (code: number, signal: string) => {
            executionContext.socketSession.emit('exit', {
                code: code,
                signal: signal
            });
        });
    }
}