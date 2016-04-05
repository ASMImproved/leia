
import {ICommand} from "./ICommand";
import {RunCommand} from "../RunCommand";
import {ExecutionContext} from "./ExecutionContext";
import {SocketSession} from "../socket/SocketSession";

export class CommandDispatcher {
    constructor() {
        
    }
    
    public executeCommand(name: string, payload: any, socketService: SocketSession, callback: any) {
        let command: ICommand;
        switch (name) {
            case 'run':
                command = new RunCommand();
        }
        if(!command) {
            return callback(new Error("Command not available"));
        }
        command.execute(payload, new ExecutionContext(socketService), callback);
    }
}