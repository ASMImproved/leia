import {Injectable, EventEmitter} from "angular2/core";
import {SocketService} from "./SocketService";
import {Project} from "../../../common/Project";
import {ProgramStoppedEvent, ISourceLocation} from "../../../common/Debugger";

@Injectable()
export class RunService {
    private _stdout: string = "";
    private _gccErr: string = "";
    private _running: boolean = false;
    public runStatusChanged: EventEmitter<boolean> = new EventEmitter();
    public stopped: EventEmitter<ISourceLocation> = new EventEmitter();

    constructor(private socketService: SocketService) {
        socketService.socket.on('stdout', (buffer) => {
            this._stdout += buffer;
        });
        socketService.socket.on('gcc-error', (err) => {
            this._gccErr = err.toString();
            console.log(this._gccErr);
        });
        socketService.socket.on('exit', () => {
            this.setRunningState(false);
            console.log('exit');
        });
        socketService.socket.on('programStopped', (programStoppedEvent: ProgramStoppedEvent) => {
            console.log("programStopped");
            console.log(programStoppedEvent);
            this.stopped.emit(programStoppedEvent.location);
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
        this._stdout = "";
        this._gccErr = "";
        console.log("run %s", project);
        this.socketService.socket.emit('run', project, (error: string) => {
            if (error) {
                return console.error(error);
            }
            console.log('set running');
            this.setRunningState(true);
        });
    }

    private setRunningState(running:  boolean) {
        this._running = running;
        this.runStatusChanged.emit(this._running);
    };

    stop() {
        console.log("stop");
        this.socketService.socket.emit('stop');
    }

    step() {
        console.log("step");
        this.socketService.socket.emit('step');
    }

    continue() {
        console.log("continue");
        this.socketService.socket.emit('continue');
    }
}
