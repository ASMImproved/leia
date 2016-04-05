
import {SocketSession} from "../socket/SocketSession";

export class ExecutionContext {

    constructor(private _socketSession: SocketSession) {

    }

    public get socketSession() {
        return this._socketSession;
    }
}