/// <reference path="../../../typings/main.d.ts" />
import {Project} from '../../common/project.ts'
import {MipsRunner} from '../MipsRunner'
import {Gcc} from '../Gcc'
import path = require('path');
import cp = require('child_process');

export class Session {
	running: boolean = false;
	mipsRun: cp.ChildProcess;
	stage: string;

	public hookSocket(socket: SocketIO.Socket) {
		socket.on('run', (project: Project) => {
			this.running = true;
			this.stage = "gcc";
			var gcc: Gcc = new Gcc(project);
			gcc.compile((err, stdout, stderr, dirPath) => {
				if (err) {
					socket.emit('gcc-error', stderr);
					this.stage = "gcc-error";
					socket.emit('exit');
					return console.error(err);
				}

				this.stage = "running";

				this.mipsRun = (new MipsRunner(path.join(dirPath, "proj.out"))).execute();
				this.mipsRun.stdout.setEncoding('utf8');
				this.mipsRun.stdout.on('data', (chunk) => {
					socket.emit('stdout', chunk);
				})
				this.mipsRun.on('exit', (code: number, signal: string) => {
					this.running = false;
					socket.emit('exit', {code: code, signal: signal});
				})
			});
		});
		socket.on('stop', () => {
			// very basic implementation. This will not stop a process which hangs in the assembler stage
			if(this.mipsRun) {
				this.mipsRun.kill('SIGKILL');
				this.running = false;
			}
		});
	}
}
