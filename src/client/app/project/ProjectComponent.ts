import {Component, Input, OnInit} from 'angular2/core';
import {File} from '../../../common/File'
import {Project} from '../../../common/Project'
import {NewFileFormComponent} from './new-file/NewFileFormComponent'
import {RegistersComponent} from "./registers/RegistersComponent";
import {SocketService} from "./socket/SocketService";
import {RunService} from "./RunService";
import {EditorComponent} from "./editor/EditorComponent";
import {FileNameEndingService} from './FileNameEndingService'
import {EditSessionService} from './editor/EditSessionService';
import {Session} from "./editor/Session";
import {ProjectService} from "./ProjectService";
import {BreakpointService} from "./BreakpointService";
import {MemoryService} from "./memory/MemoryService";
import {MemoryComponent} from "./memory/MemoryComponent";
import {SymbolService} from "./SymbolService";
import {SymboleTableComponent} from "./symbols/SymbolTableComponent";
import {PersistenceService} from "./persistence/PersistenceService";

@Component({
    selector: 'lea-project',
    templateUrl: 'client/app/project/project.html',
    directives: [NewFileFormComponent, EditorComponent, RegistersComponent, MemoryComponent, SymboleTableComponent],
	providers: [
		SocketService,
		RunService,
		FileNameEndingService,
		EditSessionService,
		ProjectService,
		BreakpointService,
		MemoryService,
		SymbolService,
		PersistenceService
	]
})
export class ProjectComponent implements OnInit{
	private _project: Project;
	private sessionSet: Array<{key; value}> = [];
	/**
	 * required in the HTML code
	 */
	private socketService: SocketService;

	constructor(
		socketService: SocketService,
		private runService: RunService,
		private editSessionService: EditSessionService,
		private projectService: ProjectService,
	    private memoryService: MemoryService,
		private persistenceService: PersistenceService
	) {
		this.socketService = socketService;
	}

	ngOnInit() {
		this.editSessionService.setChanged.subscribe((set) => {
			this.sessionSet = set;
		});
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

	runProject() {
		this.sessionSet.forEach((session: {key: File; value: Session; }) => {
			session.value.save();
		});
		this.runService.run(this._project);
	}

	persist() {
		this.persistenceService.persist(this._project, function(err) {
			console.log(err);
		});
	}

	@Input()
	public set project(project: Project) {
		this._project = project;
		this.projectService.project = project;
	};
}
