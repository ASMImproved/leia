/// <reference path="../../../../../typings/globals/ace/index.d.ts" />
import {Component, Input, OnInit} from '@angular/core';
import {AceDirective} from './AceDirective'
import {File} from '../../../../common/File'
import Document = AceAjax.Document;
import IEditSession = AceAjax.IEditSession;
import {EditSessionService} from './EditSessionService';
import {Session} from "./Session";

// declare the ace library
declare var ace: AceAjax.Ace;

@Component({
    selector: 'leia-editor',
    template: require('./editor.html'),
    directives: [AceDirective]
})
export class EditorComponent implements OnInit{
    private session: Session = null;

    constructor(private editSessionService: EditSessionService) {

    }

    ngOnInit():any {
        this.editSessionService.activeSessionChanged.subscribe((session: Session) => {
            this.session = session;
        });
    }
}