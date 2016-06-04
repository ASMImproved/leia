/// <reference path="../../../../../typings/globals/ace/index.d.ts" />

import {Injectable, EventEmitter} from '@angular/core';
import IEditSession = AceAjax.IEditSession;
import {File} from '../../../../common/File'
import {FileNameEndingService} from "./../FileNameEndingService";
import {Session} from "./Session";
import {BreakpointService} from "../BreakpointService";
import {Breakpoint} from "../../../../common/Debugger";
import {ProjectService} from "../ProjectService";
import {RunService} from "../RunService";
import {ISourceLocation} from "../../../../common/Debugger";
import {SymbolService} from "../SymbolService";
import {Subject} from "rxjs/Subject";
import {Subscription} from "rxjs/Subscription";
import {NotificationService, NotificationLevel} from "../notification/NotificationService";

// declare the ace library
declare var ace: AceAjax.Ace;

@Injectable()
export class EditSessionService {
    private set: Array<{key; value}> = [];
    public setChanged: EventEmitter<Array<{key: File; value: Session}>>;
    public activeSessionChanged: EventEmitter<Session>;
    private activeSession: Session;
    private breakLocationMarker: {marker: number, session: Session, location: ISourceLocation};

    constructor(
        private fileNameEndingService: FileNameEndingService,
        private breakpointService: BreakpointService,
        private projectService: ProjectService,
        private runService: RunService,
        private symbolService: SymbolService,
        private notificationService: NotificationService
    ) {
        this.setChanged = new EventEmitter<Array<{key: File; value: Session}>>();
        this.activeSessionChanged = new EventEmitter<Session>();

        this.breakpointService.breakpointAdded.subscribe((breakpoint: Breakpoint) => {
            let session: Session = this.findInSet(this.projectService.getFileByName(breakpoint.location.filename));
            if(session) {
                session.setBreakpoint(breakpoint);
            }
        });

        this.breakpointService.breakpointChanged.subscribe((breakpoint: Breakpoint) => {
            let session: Session = this.findInSet(this.projectService.getFileByName(breakpoint.location.filename));
            if(session) {
                session.setBreakpoint(breakpoint);
            }
        });

        this.breakpointService.breakpointRemoved.subscribe((breakpoint: Breakpoint) => {
            let session: Session = this.findInSet(this.projectService.getFileByName(breakpoint.location.filename));
            if(session) {
                session.clearBreakpoint(breakpoint);
            }
        });

        this.runService.stopped.subscribe((location: ISourceLocation) => {
            if(!location) {
                this.notificationService.notify("Debugger stopped but no location information is available. Check for missing jr or faulty jumps.", NotificationLevel.Warn);
                return;
            }
            let file: File = this.projectService.getFileByName(location.filename);
            if(!file) {
                this.notificationService.notify("Debugger stopped in ${location.filename} with no source file available", NotificationLevel.Warn);
                return;
            }
            this.showBreakLocationMarker(this.getOrCreateSession(file), location);
            this.selectFile(file);
        });
        this.runService.continued.subscribe(() => {
            this.hideBreakLocationMarker();
        });
        this.runService.runStatusChanged.subscribe((running) => {
            if(!running) {
                this.hideBreakLocationMarker();
            }
        });

        this.projectService.fileDeleted$.subscribe((file: File) => {
            let session = this.findInSet(file);
            if(session) {
                this.closeSession(session);
            }
        });
    }

    public hideBreakLocationMarker() {
        if (this.breakLocationMarker) {
            this.breakLocationMarker.session.ace.removeMarker(this.breakLocationMarker.marker);
            this.breakLocationMarker = null;
        }
    }

    public getOrCreateSession(file: File): Session {
        let session = this.findInSet(file);
        if(session) {
            return session;
        } else {
            return this.createSession(file);
        }
    }

    private showBreakLocationMarker(session:Session, location:ISourceLocation) {
        let marker = session.setBreakLocation(location);
        this.breakLocationMarker = {
            marker,
            session,
            location
        };
    }

    private findInSet(file: File) : Session {
        for(let i in this.set) {
            if(this.set[i].key == file) {
                return this.set[i].value;
            }
        }
        return null;
    }

    private createSession(file:File): Session {
        let session: Session = new Session(file, this.symbolService, this.projectService);
        this.set.push({
            key: file,
            value: session
        });
        session.setBreakpoints(this.breakpointService.breakpointsOf(file.name));
        if (this.breakLocationMarker) {
            this.showBreakLocationMarker(session, this.breakLocationMarker.location);
        }
        this.setChanged.emit(this.set);
        return session;
    }

    public closeSession(session: Session) {
        this.activeSession = null;
        this.activeSessionChanged.emit(null);
        for(let i:number = 0; i < this.set.length; i++) {
            if(!(i in this.set)) continue;

            if(this.set[i].value == session) {
                this.set.splice(i, 1);
                this.setChanged.emit(this.set);
            }
        }
        session.dispose();
    }

    public selectFile(file: File) {
        this.activeSession = this.getOrCreateSession(file);
        this.activeSessionChanged.emit(this.activeSession);
    }

    public goto(file: File, line: number) {
        this.selectFile(file);
        this.activeSession.ace.selection.moveCursorToPosition({row: line-1, column: 0});
    }

    public get projectDirty() {
        let dirty = false;
        this.set.forEach((session: {key; value}) => {
            if(session.value.dirty)
                dirty = true;
        });
        return dirty;
    }

    public saveAll() {
        this.set.forEach((session: {key; value}) => {
            session.value.save();
        });
    }
}
