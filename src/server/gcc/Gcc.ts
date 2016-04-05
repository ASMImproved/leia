/// <reference path="../../../typings/main.d.ts" />

import util = require('util');
import cp = require('child_process');
import fs = require('fs');
import path = require('path');
import async = require('async');
import {Project} from '../../common/Project.ts';
var temp = require('temp');
var rimraf = require('rimraf');
var gccParser = require('gcc-output-parser');

export class Gcc {
	constructor(private project: Project) {

	}

	compile(compileFinishedCb) {
		temp.mkdir('', (err, dirPath) => {
			async.parallel(this.project.files.map((file) => {
				return function(cb) {
					var filepath: string = path.join(dirPath, file.name);
					fs.writeFile(filepath, file.content, (err: NodeJS.ErrnoException) => {
						cb(err, filepath);
					});
				}
			}), (err, result: Array<string>) => {
				if(err) {
					compileFinishedCb(err)
				}
				var filestring: string = result.join(' ');
				var out: string = path.join(dirPath, 'proj.out');
				cp.exec(util.format("mips-linux-gnu-gcc -g -static -mips32r5 -o %s %s", out, filestring), (err, stdout, stderr) => {
					compileFinishedCb(err, stdout, stderr, dirPath);
				});
			});
		});
	}
}
