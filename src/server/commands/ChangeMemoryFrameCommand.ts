import {AbstractCommand, Command, CommandCallback} from "./../command/Command";
import {MemoryFrame} from "../../common/MemoryFrame";
import {ExecutionContext} from "./../command/ExecutionContext";
import {AnswerContext} from "./../../common/AnswerContext";

@Command({
    name: 'changeMemoryFrame'
})
export class ChangeMemoryFrameCommand extends AbstractCommand<MemoryFrame> {

    execute(payload: MemoryFrame, executionContext: ExecutionContext, callback:CommandCallback) {
        executionContext.socketSession.memoryFrame = payload;
        if(executionContext.socketSession.mipsSession) {
            executionContext.socketSession.mipsSession.readMemory(executionContext.socketSession.memoryFrame, (err, blocks) => {
                if(err) {
                    return callback(null, {
                        memoryReadFailed: true,
                        err: err.toString()
                    }, []);
                }
                callback(null, {}, [new AnswerContext("memoryUpdate", blocks)]);
            });
        } else {
            callback(null, {}, []);
        }
    }

    public canUse(payload:any):payload is MemoryFrame {
        return typeof payload.start == 'number'
            && typeof payload.length == 'number';
    }
}
