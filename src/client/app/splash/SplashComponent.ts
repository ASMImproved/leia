import {Component} from 'angular2/core';
import {ProjectComponent} from '../project/ProjectComponent'

@Component({
    selector: 'lea-splash',
    templateUrl: 'client/app/splash/splash.html',
    directives: [ProjectComponent]
})
export class SplashComponent {
    constructor() {

    }
}