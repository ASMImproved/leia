import {ExecutionContext} from "./ExecutionContext";
import {SocketSession} from "../socket/SocketSession";
import {CommandRegistry, CommandCallback} from "./Command";

import {ChangeMemoryFrameCommand} from "../commands/ChangeMemoryFrameCommand";
import {RunCommand} from "../commands/RunCommand";
import {ContinueCommand} from "../commands/ContinueCommand";
import {AddBreakpointCommand} from "../commands/AddBreakpointCommand";

export class CommandDispatcher {
    /** only required to ensure loading of all commands */
    private commands = [RunCommand, ContinueCommand, ChangeMemoryFrameCommand, AddBreakpointCommand];

    constructor() {
    }
    
    public executeCommand(name: string, payload: any, socketService: SocketSession, callback:CommandCallback) {
        try {
            let command = CommandRegistry.createCommand(name);
            command.execute(payload, new ExecutionContext(socketService), callback);
        } catch (error) {
            return callback(error);
        }
    }
}
