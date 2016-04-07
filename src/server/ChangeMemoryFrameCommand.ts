
import * as dbgmits from "asmimproved-dbgmits";
import {ICommand} from "./command/ICommand";
import {MemoryFrame} from "../common/MemoryFrame";
import {ExecutionContext} from "./command/ExecutionContext";
import {AnswerContext} from "./../common/AnswerContext";

export class ChangeMemoryFrameCommand implements ICommand{

    execute(payload: MemoryFrame, executionContext: ExecutionContext, callback:any) {
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
}