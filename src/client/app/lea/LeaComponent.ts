import {Component} from 'angular2/core';
import {ProjectComponent} from '../project/ProjectComponent'
import {SplashComponent} from '../splash/SplashComponent'

@Component({
    selector: 'lea',
    templateUrl: 'client/app/lea/lea.html',
    directives: [ProjectComponent, SplashComponent]
})
export class LeaComponent {

}