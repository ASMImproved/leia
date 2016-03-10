import {Component, Input, OnInit} from 'angular2/core';
import {AceDirective} from './AceDirective'
import {File} from '../../../common/File'
import {Project} from '../../../common/Project'
import {NewFileFormComponent} from './new-file/NewFileFormComponent'
import {SocketService} from "./SocketService";
import {RunService} from "./RunService";

@Component({
    selector: 'lea-project',
    templateUrl: 'client/app/project/project.html',
    directives: [AceDirective, NewFileFormComponent],
	providers: [SocketService, RunService]
})
export class ProjectComponent implements OnInit{
	@Input() public project: Project;
	public selectedFile: File;

	constructor(private socketService: SocketService, private runService: RunService) {
	}

	ngOnInit() {
		this.selectedFile = this.project.files[0];
	}

	selectFile(file: File) {
		console.log("select %s", file.name);
		this.selectedFile = file;
	}

	deleteFile(file: File) {
		this.project.files.splice(this.project.files.indexOf(file), 1);
	}

	newFile(file: File) {
		this.project.files.push(file);
		this.selectedFile = file;
	}
}
