import {ExecutionContext} from "./ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";
import {CommandRegistry} from "./CommandRegistry";


export interface CommandMetaInfo {
    name: string;
}

export function Command(metaInfo: CommandMetaInfo): ClassDecorator {
    return (target: {new()}) => {
        CommandRegistry.addCommand(metaInfo, target);
    }
}

export abstract class AbstractCommand {
    public abstract execute(payload: any, executionContext: ExecutionContext, callback: (err: any, answer?: any, answerContext?: Array<AnswerContext>) => any);

    public static isCommand(command: any): command is AbstractCommand {
        return command instanceof AbstractCommand
    }
}
