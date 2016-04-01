import {Component} from "angular2/core";
import {SymbolService, Symbol} from "../SymbolService";
import {EditSessionService} from "../editor/EditSessionService";

@Component({
    selector: 'lea-symboltable',
    templateUrl: 'client/app/project/symbols/symboltable.html'
})
export class SymboleTableComponent {
    private globalSymbols: Symbol[] = [];
    private localSymbols: Symbol[] = [];

    constructor(private symbolService: SymbolService, private editSessionService: EditSessionService) {
        symbolService.symbolsChanged$.subscribe((symbols: Symbol[]) => {
            console.log("symbols changed");
            console.log(symbols);
            this.globalSymbols = [];
            this.localSymbols = [];
            symbols.forEach((symbol: Symbol) => {
                if (symbol.global) {
                    console.log("global symbol");
                    console.log(symbol);
                    this.globalSymbols.push(symbol);
                } else {
                    console.log("local symbol");
                    console.log(symbol);
                    this.localSymbols.push(symbol);
                }
            })
        });
    }

    public goto(symbol: Symbol) {
        this.editSessionService.goto(symbol.file, symbol.line);
    }
}
