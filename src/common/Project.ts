import {File} from './File'

export class Project {
	files: Array<File>;

	constructor (public name: string) {
		this.files = [];
		var file: File = new File("main.s");
		file.content = `
.data
hellostring:  .ascii "Hello "
              .asciiz "World!\n"

.text
.globl main

main:
  li  $a0, 1
  la  $a1, hellostring
  li  $a2, 14
  li  $v0, 4004
  syscall

  li  $a0, 0
  li  $v0, 4001
  syscall
`
		this.files.push(file);
	}
}
