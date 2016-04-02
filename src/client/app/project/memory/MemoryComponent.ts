import {Component, OnInit} from "angular2/core";
import {MemoryService} from "./MemoryService";
import {MemoryFrame} from "../../../../common/MemoryFrame";

const HELLO_WORLD_ADDRESS: number = 4874208;
const BYTES_PER_CELL: number = 4;
const CELLS_PER_ROW: number = 10;
const ROWS: number = 10;
const MEMORY_FRAME_SIZE: number = ROWS * CELLS_PER_ROW * BYTES_PER_CELL;

@Component({
    selector: 'lea-memory',
    templateUrl: 'client/app/project/memory/memory.html'
})
export class MemoryComponent implements  OnInit{
    private matrix: Array<Array<string>> = [];
    
    public constructor(private memoryService: MemoryService) {
        for(let i: number = 0; i < ROWS; i++) {
            this.matrix[i] = [];
        }
    }

    ngOnInit():any {
        this.memoryService.memoryBlocksChanged$.subscribe((blocks) => {
            blocks.forEach((block) => {
                let offset = parseInt(block.offset.substring(2), 16);
                for(let i: number = 0; i < block.contents.length; i += 2) {
                    let positionOffset = offset + (i/2);
                    let rowOffset = Math.floor(positionOffset / (BYTES_PER_CELL * CELLS_PER_ROW));
                    let colOffset = Math.floor((positionOffset - rowOffset * (BYTES_PER_CELL * CELLS_PER_ROW)) / BYTES_PER_CELL);
                    let localOffset = positionOffset % BYTES_PER_CELL;
                    //console.log('pos: %s, row: %s, col: %s, loc: %s', positionOffset, rowOffset, colOffset, localOffset);
                    if(rowOffset < 0 || rowOffset >= ROWS || colOffset < 0 || colOffset >= ROWS)
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
        this.memoryService.updateMemoryFrame(new MemoryFrame(HELLO_WORLD_ADDRESS, MEMORY_FRAME_SIZE));
    }
    
    private moveUp() {
        let jumpAddress = this.memoryService.MemoryFrame.start + MEMORY_FRAME_SIZE;
        if(jumpAddress < 0) {
            jumpAddress = 0;
        }
        this.memoryService.updateMemoryFrame(new MemoryFrame(jumpAddress, MEMORY_FRAME_SIZE));
    } 
    
    private moveDown() {
        this.memoryService.updateMemoryFrame(new MemoryFrame(this.memoryService.MemoryFrame.start - MEMORY_FRAME_SIZE, MEMORY_FRAME_SIZE));
    }


}