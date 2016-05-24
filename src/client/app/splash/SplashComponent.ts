import {Component, EventEmitter, Output} from 'angular2/core';
import {PersistenceService} from "../project/persistence/PersistenceService";
import {Project} from "../../../common/Project";

@Component({
    selector: 'lea-splash',
    templateUrl: 'client/app/splash/splash.html'
})
export class SplashComponent {
    @Output() public newProjectEvent: EventEmitter<any>;
    @Output() public openProjectEvent: EventEmitter<Project>;

    constructor(private persistenceService: PersistenceService) {
        this.newProjectEvent = new EventEmitter();
        this.openProjectEvent = new EventEmitter();
    }

    public newProject() {
        console.log('in splash');
        this.newProjectEvent.emit({});
    }

    private openProject(file) {
        this.persistenceService.openProjectFromDisk(file, (err, project: Project) => {
            if(err) {
                console.error(err);
            }
            this.openProjectEvent.emit(project);
        });
    }
}