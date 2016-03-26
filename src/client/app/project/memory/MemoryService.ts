
import {Injectable} from "angular2/core";
import {SocketService} from "../SocketService";

@Injectable()
export class MemoryService {
    private _blocks;

    public constructor(private socketService: SocketService) {

        this.socketService.socket.on('memoryUpdate', (blocks) => {
            this._blocks = blocks;
            console.log(blocks);
        });
    }

    public get MemoryFrame() {
        return this._blocks;
    }
}