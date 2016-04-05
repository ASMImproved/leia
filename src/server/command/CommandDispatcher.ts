
import {ICommand} from "./ICommand";
import {RunCommand} from "../RunCommand";
export class CommandDispatcher {
    constructor() {
        
    }
    
    public executeCommand(name: string, payload: any, executionContext: any, callback: any) {
        let command: ICommand;
        switch (name) {
            case 'run':
                command = new RunCommand();
        }
        if(!command) {
            return callback(new Error("Command not available"));
        }
        command.execute(payload, executionContext, callback);
    }
}