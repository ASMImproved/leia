import {Output, EventEmitter, Injectable} from '@angular/core';
import {SocketService} from "./socket/SocketService";
import {RunService} from "./RunService";
import {Breakpoint, SourceLocation} from "../../../common/Debugger"

@Injectable()
export class BreakpointService {
    breakpointAdded: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointChanged: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointRemoved: EventEmitter<Breakpoint> = new EventEmitter();
    private breakpoints: {[index: string]: Breakpoint} = {};

    constructor(private socketService: SocketService, private runService: RunService) {
        runService.runStatusChanged.subscribe((running: boolean) => {
            if (running) {
                console.log(this.breakpoints);
                var breakpoints: Promise<Breakpoint>[] = [];
                for (var location in this.breakpoints) {
                    this.sendBreakpoint(this.breakpoints[location]);
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
            this.breakpoints[location.locationString] = {
                location: location
            };
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
                this.socketService.sendCommand("addBreakpoint", breakpoint.location, (err, breakpointSetResult:Breakpoint) => {
                    if(err) {
                        return reject(err);
                    }
                    breakpoint.pending = breakpointSetResult.pending !== undefined;
                    breakpoint.id = breakpointSetResult.id;
                    this.breakpoints[breakpoint.location.locationString] = breakpoint;
                    this.breakpointAdded.emit(breakpoint);
                    resolve(breakpoint);
                });
            }
        );
    };

    removeBreakpoint(location: SourceLocation): void {
        console.log("should remove breakpoint: " + location.locationString);
        const breakpoint: Breakpoint = this.breakpoints[location.locationString];
        if (!breakpoint) {
            return;
        }

        if (breakpoint.id && this.runService.running) {
            console.log("sending remove request for id " + breakpoint.id);
            this.socketService.sendCommand('removeBreakpoint', breakpoint.id, (err) => {
                if (err) {
                    return console.log(err)
                }
            });
        }

        console.log("removing breakpoint from client's breakpoints");
        delete this.breakpoints[location.locationString];
        this.breakpointRemoved.emit(breakpoint);
    }
}
