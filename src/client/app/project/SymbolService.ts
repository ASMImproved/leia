import {File} from '../../../common/File'
import {EventEmitter} from "angular2/core";
import {Project} from "../../../common/Project";

export interface Symbol {
    global?: boolean;
    name: string;
    file: File;
    line: number;
}

//TODO regex are too easy and will find elements within strings, too
const SYMBOL_REGEX = /(\S+)\s*:/g;
const GLOBAL_REGEX = /\.globl\s+(\S+)/g;

export class SymbolService {
    private _symbols: Symbol[] = [];
    public symbolsChanged: EventEmitter<Symbol[]> = new EventEmitter<Symbol[]>();

    constructor() {
    }

    public get symbols() {
        return this._symbols;
    }

    public clear(file: File) {
        this._symbols = this._symbols.filter((symbol: Symbol) => {
            return symbol.file != file;
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
            while ((match = SYMBOL_REGEX.exec(line)) !== null) {
                this._symbols.push({
                    file: file,
                    name: match[1],
                    line: lineNo+1,
                    global: globals.indexOf(match[1]) >= 0
                });
            }
        }
        this.symbolsChanged.emit(this._symbols);
    }

    parseProject(project:Project) {
        this._symbols = [];
        for (let file of project.files) {
            this.parse(file);
        }
    }
}
