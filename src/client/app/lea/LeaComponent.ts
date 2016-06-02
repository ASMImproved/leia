import {Component} from '@angular/core';
import {ProjectComponent} from '../project/ProjectComponent'
import {SplashComponent} from '../splash/SplashComponent'
import {Project} from '../../../common/Project'
import {PersistenceService} from "../project/persistence/PersistenceService";
import {TabsSelect} from "../tabs/TabsSelect";
import {TabSelect} from "../tabs/TabSelect";

@Component({
    selector: 'lea',
    templateUrl: 'client/app/lea/lea.html',
    directives: [ProjectComponent, SplashComponent, TabsSelect, TabSelect],
    providers: [PersistenceService]
})
export class LeaComponent {
    public activeProject: Project;

    public newProject() {
        this.activeProject = new Project("Test Project");
    }

    public openProject(project: Project) {
        this.activeProject = project;
    }

    public exitProject() {
        this.activeProject = null;
    }
}