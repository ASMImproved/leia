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
        const globals: string[] = [];
        const labels: Label[] = [];
        for (let line: number = 0; line < this.ace.getLength(); ++line) {
            const tokens = <TokenInfo[]>this.ace.getTokens(line);
            if (tokens.length < 1) {
                continue;
            }
            if (tokens[0].type === "directive.keyword.control"
                && tokens[0].value === ".globl") {
                let labelFound = false;
                labels.forEach((label: Label) => {
                    if (label.name == tokens[2].value) {
                        label.global = true;
                        labelFound = true;
                    }
                });
                if (!labelFound) {
                    globals.push(tokens[2].value);
                }
            } else if (tokens[0].type === "variable.other"
                && tokens[1].value === ":") {
                labels.push({
                    file: this.file.name,
                    global: globals.indexOf(tokens[0].value) >= 0,
                    line: line+1,
                    name: tokens[0].value
                });
            }
        }
        this.labelService.clear(this.file);
        this.labelService.addLabels(labels);
    }
}
