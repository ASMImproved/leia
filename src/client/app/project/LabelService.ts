import {File} from '../../../common/File'
import {EventEmitter} from "angular2/core";

export interface Label {
    global?: boolean;
    name: string;
    file: string;
    line: number;
}

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

    public addLabel(label:Label) {
        this._labels.push(label);
        this.labelsChanged.emit(this._labels);
        console.log("add label: ");
        console.log(label);
    }

    public addLabels(labels: Label[]) {
        this._labels = this._labels.concat(labels);
        this.labelsChanged.emit(this._labels);
        console.log("add labels: ");
        console.log(labels);
    }
}
