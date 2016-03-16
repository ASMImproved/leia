import {Output, EventEmitter, Injectable} from 'angular2/core';
import {SocketService} from "./SocketService";
import {RunService} from "./RunService";
import {Breakpoint, SourceLocation} from "../../../common/Debugger"

@Injectable()
export class BreakpointService {
    breakpointAdded: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointChanged: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointRemoved: EventEmitter<Breakpoint> = new EventEmitter();
    private breakpoints: Breakpoint[] = [];

    constructor(private socketService: SocketService, private runService: RunService) {
        runService.runStatusChanged.subscribe((running: boolean) => {
            if (running) {
                console.log(this.breakpoints);
                var breakpoints: Promise<Breakpoint>[] = [];
                for (var breakpoint of this.breakpoints) {
                    this.sendBreakpoint(breakpoint);
                }
                // the program was halted on GDB connect
                // after the breakpoints are set it can be continued
                // no matter, whether they were set successfully
                Promise.all(breakpoints)
                    .then(() => {
                        runService.continue();
                    })
                    .catch(() => {
                        runService.continue();
                    });
            }
        });
    }

    addBreakpoint(location: SourceLocation): void {
        console.log("add breakpoint " + location.locationString);
        if (this.runService.running) {
            console.log("sending");
            this.sendBreakpoint({
                location: location
            });
        } else {
            console.log("saving");
            this.breakpoints.push({
                location: location
            });
        }
        this.breakpointAdded.emit({
            location: location,
            pending: true
        });
    }

    private sendBreakpoint(breakpoint: Breakpoint): Promise<Breakpoint> {
        return new Promise<Breakpoint>(
            (resolve:(breakpoint:Breakpoint)=>void, reject:(error:any)=>void) => {
                console.log("sending breakpoint " + breakpoint.location.locationString);
                this.socketService.socket
                    .emit('addBreakpoint', breakpoint.location, (breakpointSetResult:Breakpoint, error:any) => {
                        if (error) {
                            reject(error);
                            return console.log(error);
                        }
                        breakpoint.pending = breakpointSetResult.pending !== undefined;
                        breakpoint.id = breakpointSetResult.id;
                        this.breakpointAdded.emit(breakpoint);
                        resolve(breakpoint);
                    });
            }
        );
    };

    removeBreakpoint(location: SourceLocation): void {
        // TODO send to server
        var breakpoints: Breakpoint[] = this.breakpoints.filter((breakpoint: Breakpoint) => {
            return breakpoint.location.locationString === location.locationString;
        });
        for (var breakpoint of breakpoints) {
            this.breakpoints.slice(this.breakpoints.indexOf(breakpoint), 1);
        }
        this.breakpointRemoved.emit({
            location: location
        });
    }
}
