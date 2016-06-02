import {Injectable, EventEmitter} from "@angular/core";
import {SocketService} from "./socket/SocketService";
import {Project} from "../../../common/Project";
import {HitBreakpointEvent, ISourceLocation, HitWatchpointEvent} from "../../../common/Debugger";
import {NotificationService, NotificationLevel} from "./notification/NotificationService";

@Injectable()
export class RunService {
    private _stdout: string = "";
    private _running: boolean = false;
    public runStatusChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
    public stopped: EventEmitter<ISourceLocation> = new EventEmitter<ISourceLocation>();
    public continued: EventEmitter<void> = new EventEmitter<void>();

    constructor(private socketService: SocketService, private notificationService: NotificationService) {
        socketService.subscribeToServerEvent('stdout', (event) => {
            this._stdout += event.payload;
        });
        socketService.subscribeToServerEvent('exit', () => {
            this.setRunningState(false);
            console.log('exit');
        });
        socketService.subscribeToServerEvent('hitBreakpoint', (event) => {
            let programStoppedEvent: HitBreakpointEvent = event.payload;
            this.stopped.emit(programStoppedEvent.location);
        });
        socketService.subscribeToServerEvent('hitWatchpoint', (event) => {
            let programStoppedEvent: HitWatchpointEvent = event.payload;
            this.stopped.emit(programStoppedEvent.location);
        });
        socketService.subscribeToServerEvent('programContinued', () => {
            this.continued.emit(null);
        });
        socketService.subscribeToServerEvent('receivedSignal', (event) => {
            this.notificationService.notify(`Program received signal ${event.payload.signalName} (${event.payload.signalMeaning})`, NotificationLevel.Error);
            console.log('received signal', event.payload);
            this.stopped.emit(event.payload.location);
        });
    }

    get stdout() {
        return this._stdout;
    }

    get running() {
        return this._running;
    }

    run(project: Project) {
        this._stdout = "";
        console.log("run %s", project);
        this.socketService.sendCommand('run', {
            project: project
        }, (error: string) => {
            if (error) {
                return this.notificationService.notify(error, NotificationLevel.Error);
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
        this.socketService.sendCommand('stop', {}, () => {
            this.setRunningState(false);
        });
    }

    step() {
        console.log("step");
        this.socketService.sendCommand('step', {}, (err, answerPayload: HitBreakpointEvent) => {
            this.stopped.emit(answerPayload.location);
        });
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
