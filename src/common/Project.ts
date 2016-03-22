import {File} from './File'

export class Project {
	files: Array<File>;

	constructor (public name: string) {
		this.files = [];
		let main: File = new File("main.s");
		main.content = `
.text
.globl main
.extern hello

main:
  jal hello

  li  $a0, 0
  li  $v0, 4001
  syscall
`;
		let hello: File = new File("hello.s");
		hello.content = `
.data
hellostring:  .ascii "Hello "
              .asciiz "World!\\n"

.text
.globl hello
hello:
  li  $a0, 1
  la  $a1, hellostring
  li  $a2, 14
  li  $v0, 4004
  syscall
  jr $ra
`;
		this.files.push(main);
		this.files.push(hello);
	}
}
