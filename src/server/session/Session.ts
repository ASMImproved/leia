/// <reference path="../../../typings/main.d.ts" />
import {Project} from '../../common/project.ts'
import {MipsRunner} from '../MipsRunner'
import {Gcc} from '../Gcc'
import path = require('path');
import cp = require('child_process');

export class Session {
	public hookSocket(socket: SocketIO.Socket) {
		socket.on('run', function(project: Project) {
			var gcc: Gcc = new Gcc(project);
			gcc.compile((err, stdout, stderr, dirPath) => {
				if (err)
					return console.error(err);

				var mipsRun: cp.ChildProcess = (new MipsRunner(path.join(dirPath, "proj.out"))).execute();
				mipsRun.stdout.setEncoding('utf8');
				mipsRun.stdout.on('data', (chunk) => {
					socket.emit('stdout', chunk);
				})
			});
		});
	}
}
