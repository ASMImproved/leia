import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
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
import {MemoryWatchService} from "./MemoryWatchService";
import {SymbolService} from "./SymbolService";
import {SymboleTableComponent} from "./symbols/SymbolTableComponent";
import {PersistenceService} from "./persistence/PersistenceService";
import {NotificationService} from "../notification/NotificationService";
import {RegisterService} from "./registers/RegisterService";
import {TabsSelect} from "../tabs/TabsSelect";
import {TabSelect} from "../tabs/TabSelect";
import {TabsList} from "../tabs/TabsList";
import {TabList} from "../tabs/TabList";
import {ProjectPanel} from "./panels/ProjectPanel";
import {LeftPanel} from "./panels/LeftPanel";
import {RightPanel} from "./panels/RightPanel";
import {BottomPanel} from "./panels/BottomPanel";
import {EditableComponent} from "./editable/EditableComponent";

@Component({
    selector: 'leia-project',
    template: require('./project.html'),
    directives: [
		NewFileFormComponent,
		EditorComponent,
		RegistersComponent,
		MemoryComponent,
		SymboleTableComponent,
		TabsSelect,
		TabSelect,
		TabsList,
		TabList,
		ProjectPanel,
		LeftPanel,
		RightPanel,
		BottomPanel,
		EditableComponent
	],
	providers: [
		SocketService,
		RunService,
		FileNameEndingService,
		EditSessionService,
		ProjectService,
		BreakpointService,
		MemoryService,
		MemoryWatchService,
		SymbolService,
		RegisterService
	]
})
export class ProjectComponent implements OnInit{
	// default value is required by Angular's change detection
	private _project: Project = new Project('Skeleton Project');
	private sessionSet: Array<{key; value}> = [];
	/**
	 * required in the HTML code
	 */
	private socketService: SocketService;
	@Output() exitRequest: EventEmitter<any> = new EventEmitter<any>();

	constructor(
		socketService: SocketService,
		private runService: RunService,
		private editSessionService: EditSessionService,
		private projectService: ProjectService,
	    private memoryService: MemoryService,
		private notificationService: NotificationService
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
		this.notificationService.confirm(`Really delete file ${file.name}`, (err, answer) => {
			if(err) {
				return console.error(err);
			}
			if(answer) {
				this.projectService.deleteFile(file);
			}
		});
	}

	closeSession(session: Session) {
		this.editSessionService.closeSession(session);
	}

	runProject() {
		this.editSessionService.saveAll();
		this.runService.run(this._project);
	}

	persist() {
		this.projectService.persist((err) => {
			console.log(err);
		});
	}

	exit() {
		let doExit = () => {
			this.exitRequest.emit(null);
		}
		let checkPersistency = () => {
			if(!this.projectService.persisted()) {
				this.notificationService.confirm("You haven't downloaded the latest version to disk. Any changes will be lost. Do you want to continue? ", (err, answer) => {
					if(err){
						console.error(err);
						return;
					}
					if(answer) {
						doExit();
					}
				});
			} else {
				doExit();
			}
		}
		if(this.editSessionService.projectDirty) {
			this.notificationService.confirm("You have unsaved changes that will be lost. Do you want to continue? ", (err, answer) => {
				if(err) {
					console.error(err);
					return;
				}
				if(answer) {
					checkPersistency();
				}
			});
		} else {
			checkPersistency();
		}
	}

	@Input()
	public set project(project: Project) {
		this._project = project;
		this.projectService.project = project;
	};
}
