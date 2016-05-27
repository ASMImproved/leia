import {Output, EventEmitter, Injectable} from 'angular2/core';
import {SocketService} from "./socket/SocketService";

@Injectable()
export class MemoryWatchService {
    private _watchedCells: {[index:number]: string} = {};

    public constructor(private socketService: SocketService) {

    }

    public watchCell(address: number) {
        this.socketService.sendCommand('watchCell', address, (err, breakId: string, answerContexts) => {
            if (err) {
                return console.error(err);
            }
            this._watchedCells[address] = breakId;
            console.log(`watching ${address} with ${breakId}`);
        })
    }

    public unwatchCell(removedWatchId:string) {
        this.socketService.sendCommand('removeCellWatch', removedWatchId, (err, answerContexts) => {
            if (err) {
                return console.error(err);
            }
            console.log(`${removedWatchId} unwatched`);
            for (var address in this._watchedCells) {
                if (this._watchedCells[address] == removedWatchId) {
                    delete this._watchedCells[address];
                }
            }
        })
    }

    public watchIdFor(number:number): string {
        if (this._watchedCells.hasOwnProperty(String(number))) {
            return this._watchedCells[number];
        } else {
            return null;
        }
    }
}
