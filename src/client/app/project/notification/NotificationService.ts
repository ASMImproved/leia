
import {Injectable} from "angular2/core";

export enum NotificationLevel {
    Info,
    Warn,
    Error
}

@Injectable()
export class NotificationService {
    private notificationsHistory: Array<{message: string, level: NotificationLevel, time}> = [];

    constructor() {

    }

    public confirm(message, cb) {
        let answer = confirm(message);
        cb(null, answer);
    }

    public notify(message: string, level: NotificationLevel) {
        this.notificationsHistory.push({
            message: message,
            level: level,
            time: new Date()
        });
        alert(level + ": " + message);
    }

}