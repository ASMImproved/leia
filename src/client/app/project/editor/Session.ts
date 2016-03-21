import IEditSession = AceAjax.IEditSession;
import {FileNameEndingService} from "../FileNameEndingService";
import {File} from "../../../../common/File";

export class Session {
    public ace: IEditSession;
    private fileNameEndingService: FileNameEndingService;
    public dirty: boolean = false;

    constructor(public file: File) {
        this.fileNameEndingService = new FileNameEndingService();
        switch (this.fileNameEndingService.getFileNameEnding(file.name)) {
            case 's':
                this.ace = ace.createEditSession(file.content, new (ace.require("ace/mode/mips").Mode));
                break;
            case 'c':
            case 'h':
                this.ace = ace.createEditSession(file.content, new (ace.require('ace/mode/c_cpp').Mode));
                break;
            default:
                this.ace = ace.createEditSession(file.content, new (ace.require('ace/mode/text').Mode));
        }
        this.ace.on("change", () => {
            this.dirty = true;
        })
    }

    public save() {
        this.file.content = this.ace.getValue();
        this.dirty = false;
    }
}