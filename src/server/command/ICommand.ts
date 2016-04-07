
import {ExecutionContext} from "./ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";

export interface ICommand {
    execute(payload: any, executionContext: ExecutionContext, callback: (err: any, answer?: any, answerContext?: Array<AnswerContext>) => any);
}