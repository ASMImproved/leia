import {Component, ViewContainerRef} from '@angular/core';
import {ProjectComponent} from '../project/ProjectComponent'
import {SplashComponent} from '../splash/SplashComponent'
import {Project} from '../../../common/Project'
import {PersistenceService} from "../project/persistence/PersistenceService";
import {TabsSelect} from "../tabs/TabsSelect";
import {TabSelect} from "../tabs/TabSelect";
import {NotificationService} from "../notification/NotificationService";
import {NotificationComponent} from "../notification/NotificationComponent";

@Component({
    selector: 'leia',
    template: require('./leia.html'),
    directives: [
        ProjectComponent,
        SplashComponent,
        TabsSelect,
        TabSelect,
        NotificationComponent
    ],
    providers: [
        NotificationService,
        PersistenceService
    ]
})
export class LeiaComponent {
    public activeProject: Project;

    public constructor(public viewContainerRef:ViewContainerRef) {
        // Hack required for ng2Bootstrap (requires access to viewContainerRef)
        // http://valor-software.com/ng2-bootstrap/#modals
    }

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