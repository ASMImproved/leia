/// <reference path="../../../typings/main.d.ts" />

import {CommandDispatcher} from "../command/CommandDispatcher";
import {ExecutionContext} from "../command/ExecutionContext";

export class SocketSession {
    private executionContext: ExecutionContext = new ExecutionContext(this);

    constructor(private socket: SocketIO.Socket, private commandExecuter: CommandDispatcher, private removeCallback: (socket: SocketSession) => any) {
        socket.on('close', this.handleConnectionClose);
        socket.on('event', (data, ack) => {
            this.processEvent(data, ack);
        });
    }

    public closeSession() {
        this.socket.disconnect(true);
        this.dispose();
    }

    public emit(name: string, payload: any) {
        this.socket.emit('event', {
            name: name,
            payload: payload
        });
    }
    
    private processEvent(data, ack) {
        // check data

        this.commandExecuter.executeCommand(data.command, data.payload, this.executionContext, (err, answer, answerContext) => {
            this.sendResponse(err, answer, answerContext, data.command, ack);
        });
    }

    private sendResponse(err, answer, context, command, ack) {
        if(err) {
            return ack({
                err: err
            });
        }
        return ack({
            answer: answer,
            context: context
        });
    }

    private handleConnectionClose() {
        this.dispose();
    }

    private dispose() {
        this.removeCallback(this);
        this.socket.removeAllListeners();
    }
}