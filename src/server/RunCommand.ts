
import {ICommand} from "./command/ICommand";
import {MipsSession} from "./arch/mips/MipsSession";
import {ExecutionContext} from "./command/ExecutionContext";

export class RunCommand implements ICommand {

    execute(payload:any, executionContext: ExecutionContext, callback:any) {
        if(executionContext.mipsSession) {
            if(executionContext.mipsSession.state != "terminated") {
                return callback(new Error("Session is already running"));
            } else {
                executionContext.mipsSession.dispose();
                delete executionContext.mipsSession;
            }
        }
        let mips = executionContext.mipsSession = new MipsSession(payload.project);
        executionContext.mipsSession.run((err) => {
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
            executionContext.socketSocket.emit('stdout', chunk);
        });
        mips.mipsProgram.execution.on('exit', (code: number, signal: string) => {
            executionContext.socketSocket.emit('exit', {
                code: code,
                signal: signal
            });
        });
        // handle session dispose
    }
}