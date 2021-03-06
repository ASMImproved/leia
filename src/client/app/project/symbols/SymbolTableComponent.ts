import {Component} from "@angular/core";
import {SymbolService, Symbol} from "../SymbolService";
import {EditSessionService} from "../editor/EditSessionService";
import {MemoryService} from "../memory/MemoryService";
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/components/tooltip';

@Component({
    selector: 'leia-symboltable',
    template: require('./symboltable.html'),
    directives: [TOOLTIP_DIRECTIVES]
})
export class SymboleTableComponent {
    private globalSymbols: Symbol[] = [];
    private localSymbols: Symbol[] = [];

    constructor(
        private symbolService: SymbolService,
        private editSessionService: EditSessionService,
        private memoryService: MemoryService) {
        symbolService.symbolsChanged$.subscribe((symbols: Symbol[]) => {
            this.globalSymbols = [];
            this.localSymbols = [];
            symbols.forEach((symbol: Symbol) => {
                if (symbol.global) {
                    this.globalSymbols.push(symbol);
                } else {
                    this.localSymbols.push(symbol);
                }
            })
        });
    }

    private gotoSourceLineOfCode(symbol: Symbol) {
        this.editSessionService.goto(symbol.file, symbol.line);
    }
    
    private gotoMemory(symbol: Symbol) {
        if (symbol.address) {
            this.memoryService.goto(symbol.address);
        }
    }
}
