/// <reference path="../../../typings/main.d.ts" />

import {CommandDispatcher} from "../command/CommandDispatcher";
import {MipsSession} from "../arch/mips/MipsSession";
import {MemoryFrame} from "../../common/MemoryFrame";

export class SocketSession {
    public mipsSession: MipsSession;
    public memoryFrame: MemoryFrame;

    constructor(private socket: SocketIO.Socket, private commandExecuter: CommandDispatcher, private removeCallback: (socket: SocketSession) => any) {
        socket.on('disconnect', this.handleConnectionClose.bind(this));
        socket.on('event', (data, ack) => {
            this.processEvent(data, ack);
        });
    }

    public closeSession() {
        this.socket.disconnect(true);
        this.dispose();
    }

    public emit(name: string, payload: any, answerContext: any) {
        this.socket.emit('event', {
            name: name,
            payload: payload,
            context: answerContext
        });
    }
    
    private processEvent(data, ack) {
        // check data

        this.commandExecuter.executeCommand(data.command, data.payload, this, (err, answer, answerContext) => {
            this.sendResponse(err, answer, answerContext, data.command, ack);
        });
    }

    private sendResponse(err, answer, context, command, ack) {
        if(err) {
            return ack({
                err: err.toString()
            });
        }
        return ack({
            answer: answer,
            context: context || []
        });
    }

    private handleConnectionClose() {
        this.dispose();
    }

    private dispose() {
        console.log('dispose session');
        this.mipsSession.dispose();
        this.removeCallback(this);
        this.socket.removeAllListeners();
    }
}