import {Injectable} from "angular2/core";
import {SocketService} from "./SocketService";
import {Project} from "../../../common/Project";

@Injectable()
export class RunService {
    public stdout: string = "";
    public gccErr: string = "";
    public _running: boolean = false;

    constructor(private socketService: SocketService) {
        socketService.socket.on('stdout', (buffer) => {
            this.stdout += buffer;
        });
        socketService.socket.on('gcc-error', (err) => {
            this.gccErr = err.toString();
            console.log(this.gccErr);
        });
        socketService.socket.on('exit', () => {
            this.running = false;
            console.log('exit');
        });
    }

    private set running(running: boolean) {
        this._running = running;
    }

    get running() {
        return this._running;
    }

    run(project: Project) {
        this.running = true;
        this.stdout = "";
        this.gccErr = "";
        console.log("run %s", project);
        this.socketService.socket.emit('run', project);
    }

    stop() {
        this.socketService.socket.emit('stop');
    }
}
