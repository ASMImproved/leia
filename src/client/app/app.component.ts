import {Component} from 'angular2/core';
import {AceDirective} from './ace.directive'
import {File} from '../../common/file'
import {Project} from '../../common/project'
import {NewFileForm} from './new-file-form.component'

declare var io: any;

@Component({
    selector: 'my-app',
    templateUrl: 'client/app/app.html',
    directives: [AceDirective, NewFileForm]
})
export class AppComponent {
	private socket;
	public stdout: string = "";
	public project: Project;
	public selectedFile: File;

	constructor() {
		this.socket = io.connect();
		this.socket.on('stdout', (buffer) => {
			this.stdout += buffer;
		})
	    this.project = new Project("Test project");
		this.project.files.push(new File("main.s"));
		this.selectedFile = this.project.files[0];
	}

	run() {
		console.log("run %s", this.project);
		this.socket.emit('run', this.project);
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
