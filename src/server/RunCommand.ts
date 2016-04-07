
import {AbstractCommand, Command} from "./command/Command";
import {MipsSession} from "./arch/mips/MipsSession";
import {ExecutionContext} from "./command/ExecutionContext";
import {AnswerContext} from "../common/AnswerContext";

@Command({
    name: 'run'
})
export class RunCommand extends AbstractCommand {

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
                executionContext.socketSession.mipsSession.readMemory(executionContext.socketSession.memoryFrame, (err, blocks) => {
                    if(err) {
                        return callback(err);
                    }
                    callback(null, {
                        ok: true
                    }, [new AnswerContext("memoryUpdate", blocks)]);
                });
            });
        });
        mips.on('stdout', (chunk) => {
            console.log(chunk);
            executionContext.socketSession.emit('stdout', chunk, []);
        });
        mips.on('exit', (code: number, signal: string) => {
            executionContext.socketSession.emit('exit', {
                code: code,
                signal: signal
            }, []);
        });
    }
}
