import {Component, OnInit} from "angular2/core";
import {MemoryService} from "./MemoryService";
import {MemoryFrame} from "../../../../common/MemoryFrame";

@Component({
    selector: 'lea-memory',
    templateUrl: 'client/app/project/memory/memory.html'
})
export class MemoryComponent implements  OnInit{
    private length: number = 400;
    private matrix: Array<Array<string>> = [];
    
    public constructor(private memoryService: MemoryService) {
        for(let i: number = 0; i < 10; i++) {
            this.matrix[i] = [];
        }
    }

    ngOnInit():any {
        this.memoryService.memoryBlocksChanged$.subscribe((blocks) => {
            blocks.forEach((block) => {
                let offset = parseInt(block.offset.substring(2), 16);
                for(let i: number = 0; i < block.contents.length; i += 2) {
                    let positionOffset = offset + (i/2);
                    let rowOffset = Math.floor(positionOffset / 40);
                    let colOffset = Math.floor((positionOffset - rowOffset * 40) / 4);
                    let localOffset = positionOffset % 4;
                    //console.log('pos: %s, row: %s, col: %s, loc: %s', positionOffset, rowOffset, colOffset, localOffset);
                    if(rowOffset < 0 || rowOffset >= 10 || colOffset < 0 || colOffset >= 10)
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
        this.memoryService.updateMemoryFrame(new MemoryFrame(4874208, 100));
    }
    
    private moveUp() {
        this.memoryService.updateMemoryFrame(new MemoryFrame(this.memoryService.MemoryFrame.start + this.length, this.length));
    } 
    
    private moveDown() {
        this.memoryService.updateMemoryFrame(new MemoryFrame(this.memoryService.MemoryFrame.start - this.length, this.length));
    }


}