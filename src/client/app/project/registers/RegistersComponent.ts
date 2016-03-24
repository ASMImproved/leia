import {Component} from "angular2/core";
import {SocketService} from "../SocketService";
import {Register} from "../../../../common/Debugger";
import {RegisterPipe} from './RegisterPipe'

@Component({
    selector: 'lea-registers',
    templateUrl: 'client/app/project/registers/registers.html',
    pipes: [RegisterPipe]
})
export class RegistersComponent {
    private registers: Register[] = [
        {name: "$s0", value: 15},
        {name: "$s1", value: 16}
    ];

    constructor(private socketService: SocketService) {
        socketService.socket.on('updateRegisters', (registers: Register[]) => {
            this.registers = registers;
        });
    }
}
