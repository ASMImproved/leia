/// <reference path="../../typings/main.d.ts" />
import {Session} from './Session'
import * as randomstring from 'randomstring'

export class SessionManager {
	sessions: any = {};

	constructor(private io: SocketIO.Server) {

	}

	public startListening() {
		this.io.on('connection', (socket: SocketIO.Socket) => {
			//console.log(socket.request);
			if (!socket.handshake.session.user) {
				socket.handshake.session.user = randomstring.generate(8);
				socket.handshake.session.save();
			}
			var userId: string = socket.handshake.session.user;
			if(!this.sessions[userId]) {
				this.sessions[userId] = new Session();
			}
			this.sessions[userId].hookSocket(socket);
		})
	}
}
