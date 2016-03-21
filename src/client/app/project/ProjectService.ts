import {Project} from "../../../common/Project";
import {File} from "../../../common/File";

export class ProjectService {
    public project: Project;

    public getFileByName(name: string) : File {
        let foundFile: File;
        this.project.files.forEach((file: File) => {
            if(file.name == name) {
                foundFile = file;
            }
        });
        return foundFile;
    }
}