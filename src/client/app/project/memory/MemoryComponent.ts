import {Component, OnInit} from "angular2/core";
import {MemoryService} from "./MemoryService";
import {MemoryFrame} from "../../../../common/MemoryFrame";

@Component({
    selector: 'lea-memory',
    templateUrl: 'client/app/project/memory/memory.html'
})
export class MemoryComponent implements  OnInit{
    private matrix: Array<Array<string>> = [];
    
    public constructor(private memoryService: MemoryService) {
        for(let i: number = 0; i < this.memoryService.ROWS; i++) {
            this.matrix[i] = [];
        }
    }

    ngOnInit():any {
        this.memoryService.memoryBlocksChanged$.subscribe((blocks) => {
            blocks.forEach((block) => {
                let offset = parseInt(block.offset.substring(2), 16);
                for(let i: number = 0; i < block.contents.length; i += 2) {
                    let positionOffset = offset + (i/2);
                    let rowOffset = Math.floor(positionOffset / (this.memoryService.BYTES_PER_CELL * this.memoryService.CELLS_PER_ROW));
                    let colOffset = Math.floor((positionOffset - rowOffset * (this.memoryService.BYTES_PER_CELL * this.memoryService.CELLS_PER_ROW)) / this.memoryService.BYTES_PER_CELL);
                    let localOffset = positionOffset % this.memoryService.BYTES_PER_CELL;
                    //console.log('pos: %s, row: %s, col: %s, loc: %s', positionOffset, rowOffset, colOffset, localOffset);
                    if(rowOffset < 0 || rowOffset >= this.memoryService.ROWS || colOffset < 0 || colOffset >= this.memoryService.ROWS)
                        continue;
                    if(!this.matrix[rowOffset][colOffset]) {
                        this.matrix[rowOffset][colOffset] = '0xjjjjjjjj';
                    }
                    this.matrix[rowOffset][colOffset] =
                        this.matrix[rowOffset][colOffset].substring(0, 2 + (localOffset * 2))
                        + block.contents.substring(i, i + 2);
                        + this.matrix[rowOffset][colOffset].substring(4 + (localOffset * 2))
                }
            });
        });
    }
    
    private moveUp() {
        let jumpAddress = this.memoryService.MemoryFrame.start + this.memoryService.MEMORY_FRAME_SIZE;
        if(jumpAddress < 0) {
            jumpAddress = 0;
        }
        this.memoryService.updateMemoryFrame(new MemoryFrame(jumpAddress, this.memoryService.MEMORY_FRAME_SIZE));
    } 
    
    private moveDown() {
        this.memoryService.updateMemoryFrame(new MemoryFrame(this.memoryService.MemoryFrame.start - this.memoryService.MEMORY_FRAME_SIZE, this.memoryService.MEMORY_FRAME_SIZE));
    }


}