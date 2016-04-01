import {Project} from "../../../common/Project";
import {File} from "../../../common/File";
import {BehaviorSubject} from 'rxjs/Rx'

export class ProjectService {
    private _projectSource = new BehaviorSubject<Project>(new Project("Empty"));
    public projectChanged$ = this._projectSource.asObservable();

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
}
