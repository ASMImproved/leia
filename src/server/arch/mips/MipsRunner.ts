/// <reference path="../../../../typings/main.d.ts" />

import * as dbgmits from "asmimproved-dbgmits";
import {EventEmitter} from 'events';
import cp = require('child_process');
import util = require('util');

export class MipsRunner extends EventEmitter {
	public port: number = 60000;
	private execution: cp.ChildProcess;
	public debug: dbgmits.DebugSession;
	public debuggerStartedPromise: Promise<void>;

	constructor(private elfFile: string) {
		super();
	}

	public run() {
		this.execution = cp.spawn("qemu-mips", ["-g", String(this.port), this.elfFile]);
		this.execution.stdout.setEncoding("utf-8");
		this.execution.stderr.setEncoding("utf-8");
		this.execution.stdout.on('data', (chunk) =>{
			this.emit('stdout', chunk);
		});
		this.execution.stderr.on('data', (chunk) => {
			this.emit('stderr', chunk);
		});
		this.execution.on('exit', (code: number, signal: string) => {
			this.emit('exit', code, signal);
		});

		//TODO better detection than timeout
		setTimeout(
			() => {
				this.emit("debuggerPortReady");
			},
			1000
		);
	}

	public connectDebugger() : Promise<void> {
		this.debug = dbgmits.startDebugSession(dbgmits.DebuggerType.GDB, "gdb-multiarch");
		this.debuggerStartedPromise = this.debug
			.setExecutableFile(this.elfFile)
			.then(() => {
				return this.debug.connectToRemoteTarget("localhost", this.port)
			});
		return this.debuggerStartedPromise;
	};

	public dispose() {
		this.debug.end();
		this.debug.removeAllListeners();
		this.execution.kill('SIGKILL');
		this.removeAllListeners();
	}
}
