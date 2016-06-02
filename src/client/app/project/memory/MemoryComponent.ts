import {Component, OnInit} from "@angular/core";
import {MemoryService} from "./MemoryService";
import {MemoryFrame} from "../../../../common/MemoryFrame";
import {RegisterService} from "../registers/RegisterService";
import {Register} from "../../../../common/Debugger";
import {SymbolService, Symbol} from "../SymbolService";
import {MemoryWatchService} from "../MemoryWatchService";
import {MemoryByteComponent} from "./MemoryByteComponent";

@Component({
    selector: 'lea-memory',
    templateUrl: 'client/app/project/memory/memory.html',
    directives: [MemoryByteComponent]
})
export class MemoryComponent implements  OnInit{
    private matrix: Array<Array<Array<{value: string, address: number, registers: Array<Register>, symbols: Array<Symbol>}>>> = [];
    private registers: Register[];
    private symbols: Symbol[];
    private blocks;

    public constructor(
        private memoryService: MemoryService,
        private registerService: RegisterService,
        private symbolService: SymbolService,
        private memoryWatchService:MemoryWatchService) {
        this.clearMatrix();
    }

    private clearMatrix () {
        for (let i: number = 0; i < this.memoryService.ROWS; i++) {
            this.matrix[i] = [];
        }
    }

    ngOnInit():any {
        this.memoryService.memoryBlocksChanged$.subscribe((blocks) => {
            this.blocks = blocks;
            this.computeMatrix();
        });
        this.memoryService.memoryReadFailed$.subscribe(() => {
            this.clearMatrix();
        });
        this.registerService.registersChanged$.subscribe((registers:Register[]) => {
            this.registers = registers;
            this.computeMatrix();
        });
        this.symbolService.symbolsChanged$.subscribe((symbols: Symbol[]) => {
            this.symbols = symbols;
            this.computeMatrix();
        });
    }

    private computeMatrix() {
        if (this.blocks) {
            this.clearMatrix();
            this.blocks.forEach((block) => {
                let offset = parseInt(block.offset.substring(2), 16);
                for (let i:number = 0; i < block.contents.length; i += 2) {
                    let positionOffset = offset + (i / 2);
                    let rowOffset = Math.floor(positionOffset / (this.memoryService.BYTES_PER_CELL * this.memoryService.CELLS_PER_ROW));
                    let colOffset = Math.floor((positionOffset - rowOffset * (this.memoryService.BYTES_PER_CELL * this.memoryService.CELLS_PER_ROW)) / this.memoryService.BYTES_PER_CELL);
                    let localOffset = positionOffset % this.memoryService.BYTES_PER_CELL;
                    //console.log('pos: %s, row: %s, col: %s, loc: %s', positionOffset, rowOffset, colOffset, localOffset);
                    if (rowOffset < 0 || rowOffset >= this.memoryService.ROWS || colOffset < 0 || colOffset >= this.memoryService.ROWS)
                        continue;
                    if (!this.matrix[rowOffset][colOffset]) {
                        this.matrix[rowOffset][colOffset] = [];
                    }
                    const address = this.memoryService.memoryFrame.start + positionOffset;
                    this.matrix[rowOffset][colOffset][localOffset] = {
                        value: block.contents.substring(i, i + 2),
                        address: address,
                        registers: this.addressInRegister(address),
                        symbols: this.symbolsForAddress(address)
                    }
                }
            });
        }
    }

    private addressInRegister(address:number):Array<Register> {
        let matchRegisters:Array<Register> = [];
        if (this.registers) {
            this.registers.forEach((currentRegister:Register) => {
                if (address == currentRegister.value) {
                    matchRegisters.push(currentRegister);
                }
            });
        }
        return matchRegisters;
    }

    private symbolsForAddress(address: number) : Array<Symbol> {
        let matchSymbols: Array<Symbol> = [];
        if(this.symbols) {
            this.symbols.forEach((symbol: Symbol) => {
                if(address == symbol.address) {
                    matchSymbols.push(symbol);
                }
            });
        }
        return matchSymbols;
    }
    
    private moveUp() {
        let jumpAddress = this.memoryService.memoryFrame.start + this.memoryService.MEMORY_FRAME_SIZE;
        if (jumpAddress < 0) {
            jumpAddress = 0;
        }
        this.memoryService.updateMemoryFrame(new MemoryFrame(jumpAddress, this.memoryService.MEMORY_FRAME_SIZE));
    }

    private moveDown() {
        this.memoryService.updateMemoryFrame(new MemoryFrame(this.memoryService.memoryFrame.start - this.memoryService.MEMORY_FRAME_SIZE, this.memoryService.MEMORY_FRAME_SIZE));
    }

    private watch(address:number) {
        this.memoryWatchService.watchCell(address);
    }

    private unwatch(watchId:number) {
        this.memoryWatchService.unwatchCell(watchId);
    }

}
