/// <reference path="../../typings/main.d.ts" />

import util = require('util');
import cp = require('child_process');

export class gcc {
	constructor(public code: string) {

	}

	compile(cb) {
		cp.exec(util.format("gcc %s"), (err, stdout, stdin) => {
			cb(err);
		});
	}
}
