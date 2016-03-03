/// <reference path="../../typings/main.d.ts" />
import {Session} from './Session'

export class SessionManager {
	sessions: any = {};

	constructor(private io: SocketIO.Server) {

	}

	public startListening() {
		this.io.on('connection', (socket: SocketIO.Socket) => {
			//console.log(socket.request);
			var userId = 'default';
			if(!this.sessions[userId]) {
				this.sessions[userId] = new Session();
			}
			this.sessions[userId].hookSocket(socket);
		})
	}
}
