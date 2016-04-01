
import {Injectable, EventEmitter} from "angular2/core";
import {SocketService} from "../SocketService";
import {MemoryFrame} from "../../../../common/MemoryFrame";
import {BehaviorSubject} from "rxjs/Rx";

@Injectable()
export class MemoryService {
    private _frame: MemoryFrame;
    private _blocks;
    public memoryBlocksChanged$;

    public constructor(private socketService: SocketService) {
        this._blocks = new BehaviorSubject<any>([]);
        this.memoryBlocksChanged$ = this._blocks.asObservable();
        this.socketService.socket.on('memoryUpdate', (blocks) => {
            this._blocks = blocks;
            console.log(blocks);
            this._blocks.next(blocks);
        });
    }
    
    public get MemoryFrame() : MemoryFrame {
        return this._frame;
    }

    public updateMemoryFrame(frame: MemoryFrame) {
        this._frame = frame;
        this.socketService.socket.emit('memoryFrameChange', frame);
    }
    
}