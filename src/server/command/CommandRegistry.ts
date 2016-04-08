import {AbstractCommand, CommandMetaInfo} from "./Command";

interface CommandList {
    [index: string]: {new()}
}

export class CommandRegistry {
    private static _commands: CommandList = {};

    public static addCommand(metaInfo: CommandMetaInfo, constructor: {new()}) {
        if (CommandRegistry._commands.hasOwnProperty(metaInfo.name)) {
            throw new Error(`Command '${metaInfo.name}' is already registered`);
        }
        console.log(`registering command '${metaInfo.name}'`);
        CommandRegistry._commands[metaInfo.name] = constructor;
    }

    public static createCommand(name: string): AbstractCommand {
        let Command = CommandRegistry._commands[name];
        if (!Command) {
            throw new Error(`Could not find command '${name}'`)
        }
        let command = new Command();
        if (AbstractCommand.isCommand(command)) {
            return command;
        } else {
            throw new Error(`Is not a valid command: '${name}'`)
        }
    }
}

import {ChangeMemoryFrameCommand} from '../commands/ChangeMemoryFrameCommand'
import {ContinueCommand} from '../commands/ContinueCommand'
import {RunCommand} from '../commands/RunCommand'
import {AddBreapointCommand} from '../commands/AddBreapointCommand'
import {StepCommand} from "../commands/StepCommand";

ChangeMemoryFrameCommand;ContinueCommand;RunCommand;AddBreapointCommand;StepCommand
