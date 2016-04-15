/// <reference path="../../../typings/main.d.ts" />

import {SocketSession} from "./SocketSession";
import {CommandDispatcher} from "../command/CommandDispatcher";
export class SocketSessionManager {
    private sessions: Array<SocketSession> = [];
    private commandExecuter: CommandDispatcher;

    constructor(private server: SocketIO.Server) {
        this.commandExecuter = new CommandDispatcher();
    }
    
    public startListening() {
        this.server.on('connection', (socket: SocketIO.Socket) => {
            this.sessions.push(new SocketSession(socket, this.commandExecuter, (session: SocketSession) => {
                this.removeSession(session);
            }));
        });
    }

    private removeSession(session: SocketSession) {
        let i = this.sessions.indexOf(session);
        if(i != -1) {
            this.sessions.slice(i, 1);
        }
    }
}