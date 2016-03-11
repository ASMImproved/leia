/// <reference path="../../../../typings/main/ambient/ace/index.d.ts" />

import {Component, Directive, EventEmitter, ElementRef, Input} from 'angular2/core';
import {File} from '../../../common/File';

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
    private editor;
    public textChanged: EventEmitter<string>;
    private _file: File;

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
    
    constructor(elementRef: ElementRef) {
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
    }
}
