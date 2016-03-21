import {Injectable, EventEmitter} from 'angular2/core';
import IEditSession = AceAjax.IEditSession;
import {File} from '../../../../common/File'
import {FileNameEndingService} from "./../FileNameEndingService";
import {Session} from "./Session";

// declare the ace library
declare var ace: AceAjax.Ace;

@Injectable()
export class EditSessionService {
    private set: Array<{key; value}> = [];
    public setChanged: EventEmitter<Array<{key: File; value: Session}>>;
    public activeSessionChanged: EventEmitter<Session>;
    private activeSession: Session;

    constructor(private fileNameEndingService: FileNameEndingService) {
        this.setChanged = new EventEmitter();
        this.activeSessionChanged = new EventEmitter();
    }

    public getOrCreateSession(file: File): Session {
        let session = this.findInSet(file);
        if(session) {
            return session;
        } else {
            return this.createSession(file);
        }
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
        let session: Session = new Session(file);
        this.set.push({
            key: file,
            value: session
        });
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
    }

    public selectFile(file: File) {
        let session = this.getOrCreateSession(file);
        this.activeSession = session;
        this.activeSessionChanged.emit(this.activeSession);
    }
}