import {Injectable} from 'angular2/core';
import {SocketService} from "./socket/SocketService";
import {RunService} from "./RunService";
import {HitWatchpointEvent, HitBreakpointEvent} from "../../../common/Debugger";

type WatchpointId = number;

@Injectable()
export class MemoryWatchService {
    /** maps address -> watchpointId */
    private _watchedCells: {[index:number]: WatchpointId} = {};
    private _brokenAddress: number = null;

    public constructor(
        private socketService: SocketService,
        private runService:RunService) {
        runService.runStatusChanged.subscribe((running:boolean) => {
            if (!running) {
                this._watchedCells = {};
                this._brokenAddress = null;
            }
        });
        socketService.subscribeToServerEvent('hitWatchpoint', (event: {payload: HitWatchpointEvent}) => {
            this._brokenAddress = this.addressForWatchId(event.payload.watchpointId);
        });
        runService.continued.subscribe(() => {
            this._brokenAddress = null;
        })
    }

    public watchCell(address: number) {
        this.socketService.sendCommand('watchCell', address, (err, breakId: number) => {
            if (err) {
                return console.error(err);
            }
            this._watchedCells[address] = breakId;
            console.log(`watching ${address} with ${breakId}`);
        })
    }

    public unwatchCell(removedWatchId:number) {
        this.socketService.sendCommand('removeCellWatch', removedWatchId, (err) => {
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

    public watchId(number:number): number {
        if (this._watchedCells.hasOwnProperty(String(number))) {
            return this._watchedCells[number];
        } else {
            return null;
        }
    }

    public brokenBecauseOf(address: number) {
        return address == this._brokenAddress;
    }

    private addressForWatchId(breakpointId:number): number {
        for (let address in this._watchedCells) {
            if (this._watchedCells[address] == breakpointId) {
                return parseInt(address, 10);
            }
        }
        return null;
    }
}
