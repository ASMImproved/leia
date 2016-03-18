/// <reference path="../../../../typings/main/ambient/ace/index.d.ts" />

import {Component, Directive, EventEmitter, ElementRef, Input} from 'angular2/core';
import {File} from '../../../common/File';
import {BreakpointService} from "./BreakpointService";
import {RunService} from "./RunService";
import {Breakpoint, SourceLocation} from '../../../common/Debugger';
import {ISourceLocation} from "../../../common/Debugger";

// declare the ace library
declare var ace: AceAjax.Ace;

var Range = ace.require('ace/range').Range;

declare interface AceEvent extends Event {
    getDocumentPosition() : AceAjax.Position;
    editor: AceAjax.Editor;
}

/**
 * A directive to use the Ace editor for editing XML. 
 * See https://github.com/hardbyte/angular2-bt-components/blob/master/app/components/markdown/aceEditor.ts
 */
@Directive({
    selector: 'ace-editor',
    outputs: [
        "textChanged"
    ],
    bindings: [BreakpointService]
})
export class AceDirective { 
    private editor: AceAjax.Editor;
    public textChanged: EventEmitter<string>;
    private _file: File;
    private breakpointLineMarker: number;

    constructor(elementRef: ElementRef, private breakpointService: BreakpointService, private runService: RunService) {
        this.textChanged = new EventEmitter<string>();

        let el = elementRef.nativeElement;
        this.editor = ace.edit(el);
        this.editor.setTheme("ace/theme/github");

        var mips_mode = ace.require("ace/mode/mips").Mode;
        this.editor.getSession().setMode(new mips_mode());

        this.editor.addEventListener("change", (e) => {
            // discard the delta (e), and provide whole document
            this.textChanged.next(this.editor.getValue());
            this._file.content = this.editor.getValue();
        });

        this.editor.addEventListener("guttermousedown", (event: AceEvent) => {
            console.log("guttermousedown");
            var line: number = event.getDocumentPosition().row+1;
            if (event.getDocumentPosition().row in event.editor.session.getBreakpoints()) {
                console.log("ace: removing breakpoint");
                breakpointService.removeBreakpoint(new SourceLocation(this._file.name, line));
            } else {
                console.log("ace: adding breakpoint");
                breakpointService.addBreakpoint(new SourceLocation(this._file.name, line));
            }
        });

        this.breakpointService.breakpointAdded.subscribe((breakpoint: Breakpoint) => {
            if (breakpoint.location.filename === this._file.name) {
                this.editor.session.setBreakpoint(breakpoint.location.line-1, (breakpoint.pending)?"breakpoint_pending":"breakpoint_set");
            }
        });

        this.breakpointService.breakpointChanged.subscribe((breakpoint: Breakpoint) => {
            if (breakpoint.location.filename === this._file.name) {
                this.editor.session.setBreakpoint(breakpoint.location.line-1, (breakpoint.pending)?"breakpoint_pending":"breakpoint_set");
            }
        });

        this.breakpointService.breakpointRemoved.subscribe((breakpoint: Breakpoint) => {
            if (breakpoint.location.filename === this._file.name) {
                this.editor.session.clearBreakpoint(breakpoint.location.line-1);
            }
        });

        this.runService.stopped.subscribe((location: ISourceLocation) => {
            const row = location.line - 1;
            console.log(row);
            this.breakpointLineMarker = this.editor.session.addMarker(new Range(row, 0, row, 1), "breakpoint_line", "fullLine", false);
        });
        this.runService.continued.subscribe(() => {
            if (this.breakpointLineMarker) {
                this.editor.session.removeMarker(this.breakpointLineMarker);
                this.breakpointLineMarker = null;
            }
        });
    }

    /**
     * Sets the editor's text.
     */
    @Input()
    set file(file: File) {
        this._file = file;
        this.editor.setValue(file.content);
        this.editor.clearSelection();
        this.editor.focus();
    }
}
