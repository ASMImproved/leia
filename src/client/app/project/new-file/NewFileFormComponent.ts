import {Component, Output, EventEmitter} from 'angular2/core';
import {NgForm}    from 'angular2/common';
import { File }    from '../../../../common/File';

@Component({
  selector: 'new-file-form',
  templateUrl: 'client/app/project/new-file/new-file-form.html',
  outputs: [
	"newFile"
  ]
})
export class NewFileFormComponent {
  name: string;
  model = new File("");
  public newFile: EventEmitter<File>;

  constructor() {
	  this.newFile = new EventEmitter<File>();
  }

  onSubmit() { 
  	console.log("new file %s", this.model); 
	this.newFile.next(this.model);
	this.model = new File("");
  }
}
