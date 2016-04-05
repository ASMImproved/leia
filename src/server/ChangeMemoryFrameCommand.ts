
import {ICommand} from "./command/ICommand";
import {MemoryFrame} from "../common/MemoryFrame";
import {ExecutionContext} from "./command/ExecutionContext";

export class ChangeMemoryFrameCommand implements ICommand{



    execute(payload: MemoryFrame, executionContext: ExecutionContext, callback:any) {
        executionContext.memoryFrame = payload;
        if(executionContext.mipsSession) {
            let mips = executionContext.mipsSession;
            if(mips.mipsProgram.debuggerStarted) {

            }
        } else {
            callback(null, {}, []);
        }
    }
}