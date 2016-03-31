import {File} from '../../../common/File'
import {Injectable} from "angular2/core";
import {BehaviorSubject} from 'rxjs/Rx'
import {Project} from "../../../common/Project";
import {ProjectService} from "./ProjectService";

export interface Symbol {
    global?: boolean;
    name: string;
    file: File;
    line: number;
}

//TODO regex are too easy and will find elements within strings, too
const SYMBOL_REGEX = /(\S+)\s*:/g;
const GLOBAL_REGEX = /\.globl\s+(\S+)/g;

@Injectable()
export class SymbolService {
    private _symbolsSource = new BehaviorSubject<Symbol[]>([]);
    public symbolsChanged$ = this._symbolsSource.asObservable();

    constructor(private projectService: ProjectService) {
        projectService.projectChanged$.subscribe((project: Project) => {
            this.parseProject(project);
        })
    }

    public get symbols(): Symbol[] {
        return this._symbolsSource.getValue();
    }

    public clear(file: File) {
        this._symbolsSource.next(
            this.symbols.filter(symbol => symbol.file != file)
        );
    }

    public parse(file: File, content?: string) {
        this.clear(file);
        if (!content) {
            content = file.content;
        }
        if (!content) {
            return;
        }

        let newSymbols: Symbol[] = [];

        let globals: string[] = [];
        let lines: string[] = content.split(/\n/);
        for (let lineNo: number = 0; lineNo < lines.length; lineNo++) {
            let match: RegExpExecArray;
            const line = lines[lineNo];
            while ((match = GLOBAL_REGEX.exec(line)) !== null) {
                globals.push(match[1]);
            }
            while ((match = SYMBOL_REGEX.exec(line)) !== null) {
                newSymbols.push({
                    file: file,
                    name: match[1],
                    line: lineNo+1,
                    global: globals.indexOf(match[1]) >= 0
                });
            }
        }
        this._symbolsSource.next(this.symbols.concat(newSymbols));
    }

    public parseProject(project:Project) {
        this._symbolsSource.next([]);
        for (let file of project.files) {
            this.parse(file);
        }
    }
}
