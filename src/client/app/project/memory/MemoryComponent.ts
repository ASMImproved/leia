import {Component} from "angular2/core";
import {MemoryService} from "./MemoryService";

@Component({
    selector: 'lea-memory',
    templateUrl: 'client/app/project/memory/memory.html'
})
export class MemoryComponent {
    public constructor(private memoryService: MemoryService) {

    }
}