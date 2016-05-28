import {Component, OnInit} from "angular2/core";
import {MemoryService} from "./MemoryService";
import {MemoryFrame} from "../../../../common/MemoryFrame";
import {RegisterService} from "../registers/RegisterService";
import {Register} from "../../../../common/Debugger";
import {MemoryWatchService} from "../MemoryWatchService";

@Component({
    selector: 'lea-memory',
    templateUrl: 'client/app/project/memory/memory.html'
})
export class MemoryComponent implements OnInit {
    private matrix:Array<Array<Array<{value:string, address:number, registers:Array<Register>, watchId?: number}>>> = [];
    private registers:Register[];
    private blocks;

    public constructor(private memoryService:MemoryService,
                       private registerService:RegisterService,
                       private memoryWatchService:MemoryWatchService) {
        for (let i:number = 0; i < this.memoryService.ROWS; i++) {
            this.matrix[i] = [];
        }
    }

    ngOnInit():any {
        this.memoryService.memoryBlocksChanged$.subscribe((blocks) => {
            this.blocks = blocks;
            this.computeMatrix();
        });
        this.registerService.registersChanged$.subscribe((registers:Register[]) => {
            this.registers = registers;
            this.computeMatrix();
        });
    }

    private computeMatrix() {
        if (this.blocks) {
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
                        watchId: this.memoryWatchService.watchIdFor(address)
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
