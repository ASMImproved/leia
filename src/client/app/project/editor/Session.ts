import IEditSession = AceAjax.IEditSession;
import EditorChangeEvent = AceAjax.EditorChangeEvent;
import {FileNameEndingService} from "../FileNameEndingService";
import {File} from "../../../../common/File";
import {SymbolService, Symbol} from "../SymbolService";
import {Subject} from "rxjs/Subject";

interface TokenInfo extends AceAjax.TokenInfo {
    // AceAjax.TokenInfo is incomplete
    type: string;
}

export class Session {
    public ace: IEditSession;
    private fileNameEndingService: FileNameEndingService;
    public dirty: boolean = false;
    private _saved: Subject<any> = new Subject<any>();
    public saved$ = this._saved.asObservable();

    constructor(public file: File, private symbolService: SymbolService) {
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
            this.updateSymbols();
        });
    }

    public save() {
        this.file.content = this.ace.getValue();
        this.dirty = false;
        this._saved.next(null);
    }

    private updateSymbols() {
        this.symbolService.parse(this.file, this.ace.getValue());
    }

    public dispose() {
        this._saved.complete();
    }
}
