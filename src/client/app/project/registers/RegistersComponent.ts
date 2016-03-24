import {Component} from "angular2/core";
import {SocketService} from "../SocketService";
import {Register} from "../../../../common/Debugger";
import {RegisterPipe} from './RegisterPipe'

const INTEGER_REGISTER_NAMES: string[] = [
    'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3',
    't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
    's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
    't8', 't9',
    'gp', 'sp', 'fp', 'ra'
];

@Component({
    selector: 'lea-registers',
    templateUrl: 'client/app/project/registers/registers.html',
    pipes: [RegisterPipe]
})
export class RegistersComponent {
    private integerRegisters: Register[] = [];

    constructor(private socketService: SocketService) {
        socketService.socket.on('updateRegisters', (registers: Register[]) => {
            this.integerRegisters = registers.filter((register: Register) => {
                return INTEGER_REGISTER_NAMES.indexOf(register.name) > 0;
            });
        });
    }
}
