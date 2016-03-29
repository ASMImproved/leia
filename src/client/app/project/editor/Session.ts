import IEditSession = AceAjax.IEditSession;
import EditorChangeEvent = AceAjax.EditorChangeEvent;
import {FileNameEndingService} from "../FileNameEndingService";
import {File} from "../../../../common/File";
import {LabelService, Label} from "../LabelService";

interface TokenInfo extends AceAjax.TokenInfo {
    // AceAjax.TokenInfo is incomplete
    type: string;
}

export class Session {
    public ace: IEditSession;
    private fileNameEndingService: FileNameEndingService;
    public dirty: boolean = false;

    constructor(public file: File, private labelService: LabelService) {
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
        this.ace.on("change", (changeEvent: EditorChangeEvent) => {
            this.dirty = true;
            this.updateLabels(changeEvent);
        });
    }

    public save() {
        this.file.content = this.ace.getValue();
        this.dirty = false;
    }

    private updateLabels(change: AceAjax.EditorChangeEvent) {
        this.labelService.parse(this.file, this.ace.getValue());
    }
}
