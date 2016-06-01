import IEditSession = AceAjax.IEditSession;
import EditorChangeEvent = AceAjax.EditorChangeEvent;
import {FileNameEndingService} from "../FileNameEndingService";
import {File} from "../../../../common/File";
import {SymbolService, Symbol} from "../SymbolService";
import {Subject} from "rxjs/Subject";
import {ProjectService} from "../ProjectService";
import {Breakpoint} from "../../../../common/Debugger";

interface TokenInfo extends AceAjax.TokenInfo {
    // AceAjax.TokenInfo is incomplete
    type: string;
}

export class Session {
    public ace: IEditSession;
    private fileNameEndingService: FileNameEndingService;
    public dirty: boolean = false;

    constructor(public file: File, private symbolService: SymbolService, private projectService: ProjectService) {
        this.fileNameEndingService = new FileNameEndingService();
        switch (this.fileNameEndingService.getFileNameEnding(file.name)) {
            case 's':
                this.ace = ace.createEditSession(file.content, new (ace.require("ace/mode/mips").Mode));
                break;
            case 'c':
            case 'h':
                this.ace = ace.createEditSession(file.content, new (ace.require('ace/mode/c_cpp').Mode));
                break;
            default:
                this.ace = ace.createEditSession(file.content, new (ace.require('ace/mode/text').Mode));
        }
        this.ace.on("change", (changeEvent: EditorChangeEvent) => {
            this.dirty = true;
            this.updateSymbols();
        });
    }

    public save() {
        this.projectService.updateFileContent(this.file, this.ace.getValue());
        this.dirty = false;
    }

    public setBreakpoint(breakpoint: Breakpoint) {
        this.ace.setBreakpoint(breakpoint.location.line - 1, "breakpoint_pending" );
    }

    public setBreakpoints(breakpoints: Breakpoint[]) {
        console.log('breakpoints', breakpoints);
        for (let breakpoint of breakpoints) {
            this.setBreakpoint(breakpoint);
        }
    }

    public clearBreakpoint(breakpoint: Breakpoint) {
        this.ace.clearBreakpoint(breakpoint.location.line-1);
    }

    private updateSymbols() {
        this.symbolService.parse(this.file, this.ace.getValue());
    }

    public dispose() {

    }
}
