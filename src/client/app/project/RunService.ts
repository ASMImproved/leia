import {Injectable, EventEmitter} from "angular2/core";
import {SocketService} from "./socket/SocketService";
import {Project} from "../../../common/Project";
import {ProgramStoppedEvent, ISourceLocation} from "../../../common/Debugger";

@Injectable()
export class RunService {
    private _stdout: string = "";
    private _gccErr: string = "";
    private _running: boolean = false;
    public runStatusChanged: EventEmitter<boolean> = new EventEmitter();
    public stopped: EventEmitter<ISourceLocation> = new EventEmitter();
    public continued: EventEmitter<void> = new EventEmitter<void>();

    constructor(private socketService: SocketService) {
        socketService.subscribeToServerEvent('stdout', (event) => {
            this._stdout += event.payload;
        });
        socketService.subscribeToServerEvent('exit', () => {
            this.setRunningState(false);
            console.log('exit');
        });
        socketService.socket.on('gcc-error', (err) => {
            this._gccErr = err.toString();
            console.log(this._gccErr);
        });
        socketService.socket.on('programStopped', (programStoppedEvent: ProgramStoppedEvent) => {
            console.log("programStopped");
            console.log(programStoppedEvent);
            this.stopped.emit(programStoppedEvent.location);
        });
        socketService.socket.on('programContinued', () => {
            console.log("continue");
            this.continued.emit(null);
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
        this.socketService.sendCommand('run', {
            project: project
        }, (error: string) => {
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
        this.socketService.sendCommand('continue', {}, (err) => {
            if(err) {
                console.error(err);
            }
            console.log('continued');
        });
    }
}
