import {Component} from 'angular2/core';
import {ProjectComponent} from '../project/ProjectComponent'
import {SplashComponent} from '../splash/SplashComponent'
import {Project} from '../../../common/Project'
import {PersistenceService} from "../project/persistence/PersistenceService";

@Component({
    selector: 'lea',
    templateUrl: 'client/app/lea/lea.html',
    directives: [ProjectComponent, SplashComponent],
    providers: [PersistenceService]
})
export class LeaComponent {
    public activeProject: Project;

    public newProject() {
        console.log('received in lea');
        this.activeProject = new Project("Test Project");
    }

    public exitProject() {
        this.activeProject = null;
    }
}