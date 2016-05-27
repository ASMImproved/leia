
import {Injectable, EventEmitter} from "angular2/core";
import {SocketService} from "../socket/SocketService";
import {MemoryFrame} from "../../../../common/MemoryFrame";
import {BehaviorSubject} from "rxjs/Rx";
import {MemoryBlock} from "../../../../common/MemoryBlock";
import {AnswerContext} from "../../../../common/AnswerContext";

@Injectable()
export class MemoryService {

    private _blocks: BehaviorSubject<Array<MemoryBlock>>;
    public memoryBlocksChanged$;
    private _frame: MemoryFrame;
    private _frameSubject: BehaviorSubject<MemoryFrame>;
    public memoryFrameChanged$;

    public constructor(private socketService: SocketService) {
        this._blocks = new BehaviorSubject<Array<MemoryBlock>>([]);
        this.memoryBlocksChanged$ = this._blocks.asObservable();
        this._frameSubject = new BehaviorSubject<MemoryFrame>(null);
        this.memoryFrameChanged$ = this._frameSubject.asObservable();
        this.socketService.subscribeToContext('memoryUpdate', (context: AnswerContext) => {
            this._blocks.next(context.payload);
        });
        this.updateMemoryFrame(new MemoryFrame(this.HELLO_WORLD_ADDRESS, this.MEMORY_FRAME_SIZE));
    }
    
    public get memoryFrame() : MemoryFrame {
        return this._frame;
    }

    public updateMemoryFrame(frame: MemoryFrame) {
        this._frame = frame;
        this._frameSubject.next(frame);
        this.socketService.sendCommand('changeMemoryFrame', frame, () => {
            
        });
    }

    public goto(start: number) {
        let frame = new MemoryFrame(start, this.MEMORY_FRAME_SIZE);
        this.updateMemoryFrame(frame);
        // highlight memory panel could be triggered here
    }

    public get HELLO_WORLD_ADDRESS() : number {
        return 4874208
    }
    public get BYTES_PER_CELL() : number {
        return 4;
    }
    public get CELLS_PER_ROW() : number {
        return 10;
    }
    public get ROWS() : number {
        return 10;
    }
    public get MEMORY_FRAME_SIZE() : number{
        return this.ROWS * this.CELLS_PER_ROW * this.BYTES_PER_CELL;
    }
}
