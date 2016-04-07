import {ExecutionContext} from "./ExecutionContext";
import {SocketSession} from "../socket/SocketSession";
import {CommandRegistry} from "./CommandRegistry";


export class CommandDispatcher {
    constructor() {
    }
    
    public executeCommand(name: string, payload: any, socketService: SocketSession, callback: (err, answer?, answerContext?) => any) {
        try {
            let command = CommandRegistry.createCommand(name);
            command.execute(payload, new ExecutionContext(socketService), callback);
        } catch (error) {
            return callback(error);
        }
    }
}
