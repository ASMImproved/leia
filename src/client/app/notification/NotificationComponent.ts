import {Component, OnInit, Input, ViewChild, AfterViewInit} from "@angular/core";
import { MODAL_DIRECTVES } from 'ng2-bootstrap/components/modal';
import { BS_VIEW_PROVIDERS } from 'ng2-bootstrap/ng2-bootstrap';
import {NotificationService, NotificationLevel} from "./NotificationService";

export enum NotificationType {
    Notification,
    Prompt
}

@Component({
    selector: 'leia-notification-component',
    template: require('./notification.html'),
    directives: [ MODAL_DIRECTVES ],
    viewProviders:[ BS_VIEW_PROVIDERS ]
})
export class NotificationComponent implements  OnInit, AfterViewInit{
    @ViewChild('notificationModal') notificationModal;
    @ViewChild('promptModal') promptModal;
    private message: string;
    private header: string;
    private cb;
    private callbackCalled = false;
    private notificationLevelToHeader = new Map<NotificationLevel, string>();
    private notificationQueue: Array<{type: NotificationType, payload}> = new Array<{type: NotificationType, payload}>();

    constructor(private notificationService: NotificationService) {
        this.notificationLevelToHeader.set(NotificationLevel.Info, 'Info');
        this.notificationLevelToHeader.set(NotificationLevel.Warn, 'Warn');
        this.notificationLevelToHeader.set(NotificationLevel.Error, 'Error');
    }

    ngOnInit():any {
        this.notificationService.registerNotificationComponent(this);
    }

    ngAfterViewInit() {
        this.notificationModal.onHidden.subscribe(() => {
            this.processQueue();
        });
        this.promptModal.onHidden.subscribe(() => {
            if(!this.callbackCalled) {
                this.cb(null, false);
                this.processQueue();
            }
        })
    }

    public notify(message, level: NotificationLevel) {
        this.notificationQueue.push({
            type: NotificationType.Notification,
            payload: {
                message: message,
                level: level
            }
        });
        if(this.notificationQueue.length === 1) {
            this.processQueue();
        }
    }

    public confirm(message:string, cb:any) {
        this.notificationQueue.push({
            type: NotificationType.Prompt,
            payload: {
                message: message,
                cb: cb
            }
        });
        if(this.notificationQueue.length === 1) {
            this.processQueue();
        }
    }

    private processQueue() {
        if(this.notificationQueue.length === 0) {
            return;
        }
        let notification = this.notificationQueue.shift();
        switch (notification.type) {
            case NotificationType.Notification:
                this.showNotification(notification.payload);
                break;
            case NotificationType.Prompt:
                this.showPrompt(notification.payload);
                break;
        }
    }

    private showNotification(payload) {
        this.message = payload.message;
        this.header = this.notificationLevelToHeader.get(payload.level);
        this.notificationModal.show();
    }

    private showPrompt(payload) {
        this.callbackCalled = false;
        this.message = payload.message;
        this.cb = payload.cb;
        this.promptModal.show();
    }

    private abortPrompt() {
        this.cb(null, false);
        this.callbackCalled = true;
        this.promptModal.hide();
    }

    private confirmPrompt() {
        this.cb(null, true);
        this.callbackCalled = true;
        this.promptModal.hide();
    }
}