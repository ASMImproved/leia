import {File} from '../../../common/File'

export interface Label {
    global?: boolean;
    name: string;
    file: string;
    line: number;
}

export class LabelService {
    private _labels: Label[] = [];

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
        console.log("add label: ");
        console.log(label);
    }

    public addLabels(labels: Label[]) {
        this._labels.concat(labels);
        console.log("add labels: ");
        console.log(labels);
    }
}
