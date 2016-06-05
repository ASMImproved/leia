import {Component, OnInit, Input} from "@angular/core";
import { TOOLTIP_DIRECTIVES } from 'ng2-bootstrap/components/tooltip';
import {Register} from "../../../../common/Debugger";
import {Symbol} from "../SymbolService";

@Component({
    selector: 'leia-memory-byte',
    template: `<span tooltipPlacement="top" [tooltip]="tooltipMessage" [ngClass]="{'memoryByteRegister': byte.registers.length, 'memoryByteSymbol': byte.symbols.length}">{{byte.value}}</span>`,
    directives: [TOOLTIP_DIRECTIVES]
})
export class MemoryByteComponent implements  OnInit{
    @Input('byte') private byte: {value: string, address: number, registers: Array<Register>, symbols: Array<Symbol>};

    constructor() {

    }

    ngOnInit():any {

    }

    private get tooltipMessage () : string {
        return `Address: 0x${this.byte.address.toString(16)}
        Registers: ${this.byte.registers.map((register: Register) => {return register.name}).join(', ') || 'none'}
        Symbols: ${this.byte.symbols.map((symbol: Symbol) => {return symbol.name}).join(', ') || 'none'}`;
    }
}
