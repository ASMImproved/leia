import {Project} from "../../../common/Project";
import {File} from "../../../common/File";

export class ProjectService {
    public project: Project;

    public getFileByName(name: string) : File {
        let foundFile: File = null;
        this.project.files.forEach((file: File) => {
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
        this.project.files.push(newFile);
    }

    public fileExists(name: string) : boolean {
        let conflictedFile: File = null;
        this.project.files.forEach((existingFile: File) => {
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
}