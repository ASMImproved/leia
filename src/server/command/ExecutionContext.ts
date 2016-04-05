
import {SocketSession} from "../socket/SocketSession";
import {MemoryFrame} from "../../common/MemoryFrame";
import {MipsSession} from "../arch/mips/MipsSession";

export class ExecutionContext {
    public memoryFrame: MemoryFrame;
    public mipsSession: MipsSession;

    constructor(private _socketSession: SocketSession) {

    }

    public get socketSocket() {
        return this._socketSession;
    }
}