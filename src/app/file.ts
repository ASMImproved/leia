export class File {
	content: string;

	constructor(public name: string) {
		this.content = `
		addi $1, 17, $2
		beq $1, $2, loop
		`;
	}
}