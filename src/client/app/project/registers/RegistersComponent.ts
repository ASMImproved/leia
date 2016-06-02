import {Component} from "@angular/core";
import {SocketService} from "../socket/SocketService";
import {Register} from "../../../../common/Debugger";
import {RegisterPipe} from './RegisterPipe'
import {AnswerContext} from "../../../../common/AnswerContext";
import {MemoryService} from "../memory/MemoryService";
import {RegisterService} from "./RegisterService";
import {CORE_DIRECTIVES} from "@angular/common";

@Component({
    selector: 'lea-registers',
    templateUrl: 'client/app/project/registers/registers.html',
    pipes: [RegisterPipe],
    directives: [TOOLTIP_DIRECTIVES, CORE_DIRECTIVES]
})
export class RegistersComponent {
    private integerRegisters: Register[] = [];

    constructor(private registerService: RegisterService, private memoryService: MemoryService) {
        this.registerService.registersChanged$.subscribe((integerRegisters: Register[]) => {
            this.integerRegisters = integerRegisters;
        })
    }

    private gotoInMemory(register: Register) {
        this.memoryService.goto(register.value);
    }
}
