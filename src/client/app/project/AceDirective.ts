/// <reference path="../../../../typings/main/ambient/ace/index.d.ts" />

import {Component, Directive, EventEmitter, ElementRef, Input} from 'angular2/core';
import {File} from '../../../common/File';
import {BreakpointService} from "./BreakpointService";
import {Breakpoint, SourceLocation} from '../../../common/Debugger';

// declare the ace library
declare var ace: AceAjax.Ace;

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

    constructor(elementRef: ElementRef, private breakpointService: BreakpointService) {
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
            var row: number = event.getDocumentPosition().row;
            if (row in event.editor.session.getBreakpoints()) {
                breakpointService.removeBreakpoint(new SourceLocation(this._file.name, row));
            } else {
                console.log("ace: adding breakpoint");
                breakpointService.addBreakpoint(new SourceLocation(this._file.name, row));
            }
        });

        this.breakpointService.breakpointAdded.subscribe((breakpoint: Breakpoint) => {
            if (breakpoint.location.filename === this._file.name) {
                this.editor.session.setBreakpoint(breakpoint.location.line, (breakpoint.pending)?"breakpoint_pending":"breakpoint_set");
            }
        });

        this.breakpointService.breakpointChanged.subscribe((breakpoint: Breakpoint) => {
            if (breakpoint.location.filename === this._file.name) {
                this.editor.session.setBreakpoint(breakpoint.location.line, (breakpoint.pending)?"breakpoint_pending":"breakpoint_set");
            }
        });

        this.breakpointService.breakpointRemoved.subscribe((breakpoint: Breakpoint) => {
            if (breakpoint.location.filename === this._file.name) {
                this.editor.session.clearBreakpoint(breakpoint.location.line);
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
