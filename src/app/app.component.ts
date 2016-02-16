import {Component} from 'angular2/core';
import {AceDirective} from './ace.directive'
import {File} from './file'
import {Project} from './project'
import {NewFileForm} from './new-file-form.component'

declare var io: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html',
    directives: [AceDirective, NewFileForm]
})
export class AppComponent {
	private socket;
	public project: Project;
	public selectedFile: File;

	constructor() {
		this.socket = io.connect();
	    this.socket.on('news', function (data) {
	      console.log(data);
	    });
	    this.project = new Project("Test project");
		this.project.files.push(new File("main.s"));
		this.selectedFile = new File("");
		this.selectedFile.content = "";
	}

	run() {
		console.log("run %s", this.project.files[0].content);
		this.socket.emit('run', { content: this.project.files[0].content });
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
	}
}