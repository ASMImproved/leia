import {Component, EventEmitter} from 'angular2/core';

@Component({
    selector: 'lea-splash',
    templateUrl: 'client/app/splash/splash.html',
    outputs: ["newProjectEvent"]
})
export class SplashComponent {
    public newProjectEvent: EventEmitter<any>;
    constructor() {
        this.newProjectEvent = new EventEmitter();
    }

    public newProject() {
        console.log('in splash');
        this.newProjectEvent.emit({});
    }
}