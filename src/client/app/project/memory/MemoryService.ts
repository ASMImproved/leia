
import {Injectable, EventEmitter} from "angular2/core";
import {SocketService} from "../SocketService";
import {MemoryFrame} from "../../../../common/MemoryFrame";

@Injectable()
export class MemoryService {
    public memoryContentUpdate: EventEmitter<any> = new EventEmitter();
    private _frame: MemoryFrame;
    private _blocks;

    public constructor(private socketService: SocketService) {

        this.socketService.socket.on('memoryUpdate', (blocks) => {
            this._blocks = blocks;
            console.log(blocks);
            this.memoryContentUpdate.emit(blocks);
        });

    }

    public get MemoryContent() {
        return this._blocks;
    }
    
    public get MemoryFrame() : MemoryFrame {
        return this._frame;
    }

    public updateMemoryFrame(frame: MemoryFrame) {
        this._frame = frame;
        this.socketService.socket.emit('memoryFrameChange', frame);
    }
    
}