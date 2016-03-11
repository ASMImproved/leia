
declare var io: any;

export class SocketService {
    public socket: any;
    private _connected;

    constructor() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log("socket connected");
            this._connected = true;
        });
        this.socket.on('disconnect', () => {
            console.log("socket disconnected");
            this._connected = false;
        });
    }

    get connected(): boolean {
        return this._connected;
    }
}
