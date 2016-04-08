import {ExecutionContext} from "./ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";

export interface CommandMetaInfo {
    name: string;
}

export interface CommandCallback {
    (err: any, answer?: any, answerContext?: Array<AnswerContext>): any
}

export abstract class AbstractCommand {
    public abstract execute(payload: any, executionContext: ExecutionContext, callback: CommandCallback);

    public static isCommand(command: any): command is AbstractCommand {
        return command instanceof AbstractCommand
    }
}

export class CommandRegistry {
    private static _commands: { [index: string]: {new()} } = {};

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

export function Command(metaInfo: CommandMetaInfo): ClassDecorator {
    return (target: {new()}) => {
        CommandRegistry.addCommand(metaInfo, target);
    }
}
