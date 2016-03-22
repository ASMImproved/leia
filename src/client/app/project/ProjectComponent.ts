import {Component, Input, OnInit} from 'angular2/core';
import {File} from '../../../common/File'
import {Project} from '../../../common/Project'
import {NewFileFormComponent} from './new-file/NewFileFormComponent'
import {SocketService} from "./SocketService";
import {RunService} from "./RunService";
import {ProgramStoppedEvent} from "../../../common/Debugger";
import {EditorComponent} from "./editor/EditorComponent";
import {FileNameEndingService} from './FileNameEndingService'
import {EditSessionService} from './editor/EditSessionService';
import {Session} from "./editor/Session";
import {ProjectService} from "./ProjectService";
import {BreakpointService} from "./BreakpointService";

@Component({
    selector: 'lea-project',
    templateUrl: 'client/app/project/project.html',
    directives: [NewFileFormComponent, EditorComponent],
	providers: [SocketService, RunService, FileNameEndingService, EditSessionService, ProjectService, BreakpointService]
})
export class ProjectComponent implements OnInit{
	private _project: Project;
	private sessionSet: Array<{key; value}> = [];

	constructor(private socketService: SocketService, private runService: RunService, private editSessionService: EditSessionService, private projectService: ProjectService) {
		editSessionService.setChanged.subscribe((set) => {
			this.sessionSet = set;
		});
	}

	ngOnInit() {

	}

	selectFile(file: File) {
		this.editSessionService.selectFile(file);
	}

	deleteFile(file: File) {
		this._project.files.splice(this._project.files.indexOf(file), 1);
	}

	closeSession(session: Session) {
		this.editSessionService.closeSession(session);
	}

	newFile(file: File) {
		this._project.files.push(file);
		this.selectFile(file);
	}

	runProject() {
		this.sessionSet.forEach((session: {key: File; value: Session; }) => {
			session.value.save();
		});
		this.runService.run(this._project);
	}

	@Input()
	public set project(project: Project) {
		this._project = project;
		this.projectService.project = project;
	};
}
