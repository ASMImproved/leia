/**
 * Taken from asmimproved-dbgmits
 */

export interface IFrameInfoBase {
    /** Name of the function corresponding to the frame. */
    func?: string;
    /** Code address of the frame. */
    address: string;
    /** Name of the source file corresponding to the frame's code address. */
    filename?: string;
    /** Full path of the source file corresponding to the frame's code address. */
    fullname?: string;
    /** Source line corresponding to the frame's code address. */
    line?: number;
}
/** Frame-specific information returned by breakpoint and stepping MI commands. */
export interface IFrameInfo extends IFrameInfoBase {
    /** Arguments of the function corresponding to the frame. */
    args?: any;
}

export interface ProgramStoppedEvent {
    breakpointId?: number;
    frame: IFrameInfo;
}

export class Breakpoint {
    constructor(public file: string, public line: number, public pending?: boolean) {
    }

    get location() {
        return this.file + ':' + this.line;
    }
}
