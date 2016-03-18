export interface ProgramStoppedEvent {
    location: SourceLocation;
    breakpointId?: number;
}

export interface Breakpoint {
    location: ISourceLocation;
    pending?: boolean;
    id?: number;
}

export interface ISourceLocation {
    filename:string;
    line:number;
    locationString:string;
}

export class SourceLocation implements ISourceLocation {
    public locationString: string;

    constructor(public filename: string, public line: number) {
        this.locationString = this.filename + ':' + this.line;
    }
}
