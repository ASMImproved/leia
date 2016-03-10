
declare var io: any;

export class SocketService {
    public socket: any;
    private _connected;

    constructor() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log("socket connected");
            this.connected = true;
        });
        this.socket.on('disconnect', () => {
            console.log("socket disconnected");
            this.connected = false;
        });
    }

    private set connected(connected: boolean) {
        this._connected = connected;
    }

    get connected(): boolean {
        return this._connected;
    }
}
