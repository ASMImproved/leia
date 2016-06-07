
import {Injectable} from "@angular/core";
import {NotificationComponent} from "./NotificationComponent";

export enum NotificationLevel {
    Info,
    Warn,
    Error
}

@Injectable()
export class NotificationService {
    private notificationComponent: NotificationComponent;
    private notificationsHistory: Array<{message: string, level: NotificationLevel, time}> = [];

    constructor() {

    }

    public confirm(message: string, cb) {
        this.notificationComponent.confirm(message, cb);
    }

    public notify(message: string, level: NotificationLevel) {
        this.notificationsHistory.push({
            message: message,
            level: level,
            time: new Date()
        });
        this.notificationComponent.notify(message, level);
    }

    public registerNotificationComponent(notificationComponent: NotificationComponent) {
        this.notificationComponent = notificationComponent;
    }
}