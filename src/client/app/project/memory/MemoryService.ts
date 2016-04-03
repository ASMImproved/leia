
import {Injectable, EventEmitter} from "angular2/core";
import {SocketService} from "../SocketService";
import {MemoryFrame} from "../../../../common/MemoryFrame";
import {BehaviorSubject} from "rxjs/Rx";
import {MemoryBlock} from "../../../../common/MemoryBlock";

@Injectable()
export class MemoryService {
    private _frame: MemoryFrame;
    private _blocks: BehaviorSubject<Array<MemoryBlock>>;
    public memoryBlocksChanged$;

    public constructor(private socketService: SocketService) {
        this._blocks = new BehaviorSubject<Array<MemoryBlock>>([]);
        this.memoryBlocksChanged$ = this._blocks.asObservable();
        this.socketService.socket.on('memoryUpdate', (blocks: Array<MemoryBlock>) => {
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