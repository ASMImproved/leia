import {Output, EventEmitter} from 'angular2/core';

export class Breakpoint {
    constructor(public file: string, public line: number, public pending?: boolean) {

    }
}

export class BreakpointService {
    breakpointAdded: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointChanged: EventEmitter<Breakpoint> = new EventEmitter();
    breakpointRemoved: EventEmitter<Breakpoint> = new EventEmitter();

    addBreakpoint(file: string, line: number): void {
        this.breakpointAdded.emit(new Breakpoint(file, line, true));
    }

    removeBreakpoint(file: string, line: number): void {
        this.breakpointRemoved.emit(new Breakpoint(file, line));
    }
}