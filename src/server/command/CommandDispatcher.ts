
import {ICommand} from "./ICommand";
import {RunCommand} from "../RunCommand";
import {ExecutionContext} from "./ExecutionContext";
import {SocketSession} from "../socket/SocketSession";
import {ContinueCommand} from "../ContinueCommand";

export class CommandDispatcher {
    constructor() {
        
    }
    
    public executeCommand(name: string, payload: any, socketService: SocketSession, callback: (err, answer?, answerContext?) => any) {
        let command: ICommand;
        switch (name) {
            case 'run':
                command = new RunCommand();
                break;
            case 'continue':
                command = new ContinueCommand();
                break;
        }
        if(!command) {
            return callback(new Error("Command not available"));
        }
        command.execute(payload, new ExecutionContext(socketService), callback);
    }
}