import {Project} from "../../../common/Project";
import {File} from "../../../common/File";
import {BehaviorSubject} from 'rxjs/Rx'
import {PersistenceService} from "./persistence/PersistenceService";
import {Injectable} from "angular2/core";
import {EditSessionService} from "./editor/EditSessionService";
import {Subject} from "rxjs/Subject";

@Injectable()
export class ProjectService {
    private _projectSource = new BehaviorSubject<Project>(new Project("Empty"));
    public projectChanged$ = this._projectSource.asObservable();
    private _persistenceState = new BehaviorSubject<Boolean>(true);
    public persistenceStateChanged$ = this._persistenceState.asObservable();
    private _fileDeleted = new Subject<File>();
    public fileDeleted$ = this._fileDeleted.asObservable();

    constructor(
        private persistenceService: PersistenceService
    ) {
    }

    public getFileByName(name: string) : File {
        let foundFile: File = null;
        this._projectSource.getValue().files.forEach((file: File) => {
            if(file.name == name) {
                foundFile = file;
            }
        });
        return foundFile;
    }

    public addFile(newFile: File) {
        if(this.fileExists(newFile.name)) {
            throw new Error("File already exists");
        }
        this._projectSource.getValue().files.push(newFile);
    }
    
    public deleteFile(file: File) {
        this._projectSource.getValue().files.splice(this._projectSource.getValue().files.indexOf(file), 1);
        this._fileDeleted.next(file);
    }

    public fileExists(name: string) : boolean {
        let conflictedFile: File = null;
        this._projectSource.getValue().files.forEach((existingFile: File) => {
            if(name == existingFile.name) {
                conflictedFile = existingFile;
            }
        });
        if(conflictedFile) {
            return true;
        } else {
            return false;
        }
    }

    public get project() {
        return this._projectSource.getValue();
    }

    public set project(project: Project) {
        this._projectSource.next(project);
    }
    
    public persist(cb) {
        this.persistenceService.persist(this._projectSource.getValue(), function(err) {
            if(err) {
                cb(err);
            }
            this._persistenceState.next(true);
            cb();
        });
    }

    public persisted() : Boolean {
        return this._persistenceState.getValue();
    }

    public updateFileContent(file: File, newContent: string) {
        this._persistenceState.next(false);
        file.content = newContent;
    }
}
