/// <reference path="../../../../../typings/main/ambient/ace/index.d.ts" />

import {Component, Directive, EventEmitter, ElementRef, Input} from 'angular2/core';
import {BreakpointService} from "./../BreakpointService";
import {RunService} from "./../RunService";
import {Breakpoint, SourceLocation} from '../../../../common/Debugger';
import {ISourceLocation} from "../../../../common/Debugger";
import IEditSession = AceAjax.IEditSession;
import {Session} from "./Session";

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
    ]
})
export class AceDirective { 
    private editor: AceAjax.Editor;
    public textChanged: EventEmitter<string>;
    private _session: Session;


    constructor(elementRef: ElementRef, private breakpointService: BreakpointService, private runService: RunService) {
        this.textChanged = new EventEmitter<string>();

        let el = elementRef.nativeElement;
        this.editor = ace.edit(el);
        this.editor.setTheme("ace/theme/github");

        this.editor.addEventListener("change", (e) => {
            // discard the delta (e), and provide whole document
            this.textChanged.emit(this.editor.getValue());
        });

        this.editor.addEventListener("guttermousedown", (event: AceEvent) => {
            console.log("guttermousedown");
            var line: number = event.getDocumentPosition().row+1;
            if (event.getDocumentPosition().row in event.editor.session.getBreakpoints()) {
                console.log("ace: removing breakpoint");
                breakpointService.removeBreakpoint(new SourceLocation(this._session.file.name, line));
            } else {
                console.log("ace: adding breakpoint");
                breakpointService.addBreakpoint(new SourceLocation(this._session.file.name, line));
            }
        });
    }

    /**
     * Sets the editor's text.
     */
    @Input()
    set session(session: Session) {

        console.log('set session');
        console.log(session);
        this._session = session;
        this.editor.setSession(session.ace);
        // focus return an error: https://github.com/angular/angular/issues/6005
        // this.editor.focus();
    }
}
