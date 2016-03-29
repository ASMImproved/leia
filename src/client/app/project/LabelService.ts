import {File} from '../../../common/File'
import {EventEmitter} from "angular2/core";
import {Project} from "../../../common/Project";

export interface Label {
    global?: boolean;
    name: string;
    file: string;
    line: number;
}

//TODO regex are too easy and will find elements within strings, too
const LABEL_REGEX = /(\S+)\s*:/g;
const GLOBAL_REGEX = /\.globl\s+(\S+)/g;

export class LabelService {
    private _labels: Label[] = [];
    public labelsChanged: EventEmitter<Label[]> = new EventEmitter<Label[]>();

    constructor() {
    }

    public get labels() {
        return this._labels;
    }

    public clear(file: File) {
        this._labels = this._labels.filter((label: Label) => {
            return label.file != file.name;
        })
    }

    public parse(file: File, content?: string) {
        this.clear(file);
        if (!content) {
            content = file.content;
        }
        if (!content) {
            return;
        }

        let globals: string[] = [];
        let lines: string[] = content.split(/\n/);
        for (let lineNo: number = 0; lineNo < lines.length; lineNo++) {
            let match: RegExpExecArray;
            const line = lines[lineNo];
            while ((match = GLOBAL_REGEX.exec(line)) !== null) {
                globals.push(match[1]);
            }
            while ((match = LABEL_REGEX.exec(line)) !== null) {
                this._labels.push({
                    file: file.name,
                    name: match[1],
                    line: lineNo+1,
                    global: globals.indexOf(match[1]) >= 0
                });
            }
        }
        this.labelsChanged.emit(this._labels);
    }

    parseProject(project:Project) {
        this._labels = [];
        for (let file of project.files) {
            this.parse(file);
        }
    }
}
