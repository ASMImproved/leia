import {Component, Input, OnInit} from 'angular2/core';
import {AceDirective} from './AceDirective'
import {File} from '../../../common/File'
import {Project} from '../../../common/Project'
import {NewFileFormComponent} from './new-file/NewFileFormComponent'
import {SocketService} from "./SocketService";

@Component({
    selector: 'lea-project',
    templateUrl: 'client/app/project/project.html',
    directives: [AceDirective, NewFileFormComponent],
	providers: [SocketService]
})
export class ProjectComponent implements OnInit{
	public stdout: string = "";
	public gccErr: string = "";
	@Input() public project: Project;
	public selectedFile: File;
	public running: boolean = false;

	constructor(private socketService: SocketService) {
		socketService.socket.on('stdout', (buffer) => {
			this.stdout += buffer;
		});
		socketService.socket.on('exit', () => {
			this.running = false;
			console.log('exit');
		});
		socketService.socket.on('gcc-error', (err) => {
			this.gccErr = err.toString();
			console.log(this.gccErr);
		});
	}

	ngOnInit() {
		this.selectedFile = this.project.files[0];
	}

	run() {
		this.running = true;
		this.stdout = "";
		this.gccErr = "";
		console.log("run %s", this.project);
		this.socketService.socket.emit('run', this.project);
	}

	stop() {
		this.socketService.socket.emit('stop');
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
