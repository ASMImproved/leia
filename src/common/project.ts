import {File} from './file'

export class Project {
	files: Array<File>;

	constructor (public name: string) {
		this.files = [];
	}
}