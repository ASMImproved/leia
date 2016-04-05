
import {ExecutionContext} from "./ExecutionContext";

export interface ICommand {
    execute(payload: any, executionContext: ExecutionContext, callback: any);
}