import {ExecutionContext} from "./ExecutionContext";
import {SocketSession} from "../socket/SocketSession";
import {CommandRegistry, CommandCallback} from "./Command";

import {ChangeMemoryFrameCommand} from "../commands/ChangeMemoryFrameCommand";
import {RunCommand} from "../commands/RunCommand";
import {ContinueCommand} from "../commands/ContinueCommand";
import {AddBreakpointCommand} from "../commands/AddBreakpointCommand";
import {RemoveBreakpointCommand} from "../commands/RemoveBreakpointCommand";
import {WatchCellCommand} from "../commands/WatchCellCommand";
import {RemoveCellWatchCommand} from "../commands/RemoveCellWatchCommand";
import {StepCommand} from "../commands/StepCommand";
import {StopCommand} from "../commands/StopCommand";

export class CommandDispatcher {
    /** only required to ensure loading of all commands */
    private commands = [
        RunCommand,
        ContinueCommand,
        ChangeMemoryFrameCommand,
        AddBreakpointCommand,
        RemoveBreakpointCommand,
        WatchCellCommand,
        RemoveCellWatchCommand,
        StepCommand,
        StopCommand
    ];

    constructor() {
    }
    
    public executeCommand(name: string, payload: any, socketService: SocketSession, callback:CommandCallback) {
        try {
            let command = CommandRegistry.createCommand(name);
            if (command.canUse(payload)) {
                command.execute(payload, new ExecutionContext(socketService), callback);
            } else {
                throw new Error(`Incorrect payload for command: ${name}`);
            }
        } catch (error) {
            return callback(error);
        }
    }
}
