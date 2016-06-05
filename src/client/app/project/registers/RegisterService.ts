
import {Injectable} from "@angular/core";
import {SocketService} from "../socket/SocketService";
import {AnswerContext} from "../../../../common/AnswerContext";
import {Register} from "../../../../common/Debugger";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/Rx";

const INTEGER_REGISTER_NAMES: string[] = [
    'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3',
    't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
    's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
    't8', 't9',
    'gp', 'sp', 'fp', 'ra', 'pc'
];

@Injectable()
export class RegisterService {
    private _registersSubject = new BehaviorSubject<Register[]>(null);
    public registersChanged$ = this._registersSubject.asObservable();
    
    constructor(private socketService: SocketService) {
        socketService.subscribeToContext('registerUpdate', (answer: AnswerContext) => {
            this._registersSubject.next(answer.payload.filter((register: Register) => {
                return INTEGER_REGISTER_NAMES.indexOf(register.name) > 0;
            }));
        });
    }
}