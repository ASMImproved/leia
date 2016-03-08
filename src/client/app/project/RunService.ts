import {Injectable} from "angular2/core";
import {SocketService} from "./SocketService";
import {Project} from "../../../common/Project";

@Injectable()
export class RunService {
    private _stdout: string = "";
    private _gccErr: string = "";
    private _running: boolean = false;

    constructor(private socketService: SocketService) {
        socketService.socket.on('stdout', (buffer) => {
            this._stdout += buffer;
        });
        socketService.socket.on('gcc-error', (err) => {
            this._gccErr = err.toString();
            console.log(this._gccErr);
        });
        socketService.socket.on('exit', () => {
            this._running = false;
            console.log('exit');
        });
    }

    get stdout() {
        return this._stdout;
    }

    get gccErr() {
        return this._gccErr;
    }

    get running() {
        return this._running;
    }

    run(project: Project) {
        this._running = true;
        this._stdout = "";
        this._gccErr = "";
        console.log("run %s", project);
        this.socketService.socket.emit('run', project);
    }

    stop() {
        this.socketService.socket.emit('stop');
    }

    step() {
        this.socketService.socket.emit('step');
    }
}
