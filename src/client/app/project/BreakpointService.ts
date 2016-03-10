import {Output, EventEmitter, Injectable} from 'angular2/core';
import {SocketService} from "./SocketService";
import {RunService} from "./RunService";
import {Breakpoint} from "../../../common/Debugger"

@Injectable()
export class BreakpointService {
    breakpointAdded: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointChanged: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointRemoved: EventEmitter<Breakpoint> = new EventEmitter();
    private pendingBreakpoints: Breakpoint[] = [];

    constructor(private socketService: SocketService, private runService: RunService) {
        runService.runStatusChanged.subscribe((running: boolean) => {
            if (running) {
                for (var breakpoint of this.pendingBreakpoints) {
                    this.sendBreakpoint(breakpoint);
                }
            }
        });
    }

    addBreakpoint(file: string, line: number): void {
        if (this.runService.running) {
            this.sendBreakpoint(new Breakpoint(file, line));
        } else {
            this.pendingBreakpoints.push(new Breakpoint(file, line));
        }
        this.breakpointAdded.emit(new Breakpoint(file, line, true));
    }

    private sendBreakpoint(breakpoint: Breakpoint) {
        this.socketService.socket
            .emit('addBreakpoint', breakpoint.location, (breakpointSetResult:Breakpoint, error: any) => {
                if (error) {
                    return console.log(error);
                }
                breakpoint.pending = breakpointSetResult.pending !== undefined;
                this.breakpointAdded.emit(breakpoint);
            });
    };

    removeBreakpoint(file: string, line: number): void {
        // TODO send to server
        this.breakpointRemoved.emit(new Breakpoint(file, line));
    }
}
