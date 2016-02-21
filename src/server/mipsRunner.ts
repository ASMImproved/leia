/// <reference path="../../typings/main.d.ts" />

import cp = require('child_process');
import util = require('util');

export class MipsRunner {
	constructor(private elfFile: string) {

	}

	execute() {
		var mipsRun: cp.ChildProcess = cp.spawn("qemu-mips", [this.elfFile]);
		return mipsRun;
	}
}
