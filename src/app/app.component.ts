import {Component} from 'angular2/core';
import {AceDirective} from './ace.directive'
import {File} from './file'

declare var io: any;

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html',
    directives: [AceDirective]
})
export class AppComponent {
	private socket;
	public file: File;

	constructor() {
		this.socket = io.connect();
	    this.socket.on('news', function (data) {
	      console.log(data);
	    });
	    this.file = new File();
	}

	run() {
		console.log("run %s", this.file.content);
		this.socket.emit('run', { content: this.file.content });
	}

}