/// <reference path="../../../typings/main.d.ts" />
import {Project} from '../../common/project.ts'
import {MipsRunner} from '../MipsRunner'
import {Gcc} from '../Gcc'
import path = require('path');
import cp = require('child_process');
import * as dbgmits from "asmimproved-dbgmits";
import {ProgramStoppedEvent, SourceLocation, Breakpoint} from "../../common/Debugger";

export interface ResultCallback<ResultType> {
	(result: ResultType, error: any): void;
}

export class Session {
	running: boolean = false;
	stage: string;
	private mipsProgram: MipsRunner = null;

	public hookSocket(socket: SocketIO.Socket) {
		socket.on('run', (project: Project, onProgramStarted:(error:any)=>void) => {
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

				this.mipsProgram = new MipsRunner(path.join(dirPath, "proj.out"));
				this.mipsProgram.execution.stdout.on('data', (chunk) => {
					socket.emit('stdout', chunk);
				});
				this.mipsProgram.execution.on('exit', (code: number, signal: string) => {
					this.running = false;
					socket.emit('exit', {code: code, signal: signal});
				});

				socket.on('addBreakpoint', (location: SourceLocation, onFinished: ResultCallback<Breakpoint>) => {
					console.log('addBreakpoint: ' + location.locationString);
					this.mipsProgram.debug
						.addBreakpoint(location.locationString)
						.then((breakpoint: dbgmits.IBreakpointInfo) => {
							onFinished({
								location: location,
								pending: breakpoint.pending !== undefined,
								id: breakpoint.id
							}, null);
						})
						.catch((error: any) => {
							onFinished(null, error);
						});
				});

				socket.on('continue', () => {
					console.log("continue");
					this.mipsProgram.debug.resumeInferior();
				});
				socket.on('step', () => {
					console.log('step');
					this.mipsProgram.debug.stepIntoInstruction();
				});

				this.mipsProgram.on('debuggerReady', () => {
					this.mipsProgram
						.connectDebugger()
						.then(() => {
							console.log("connected debugger");
							this.setupSignals(socket);
							onProgramStarted(null);
						})
						.catch((error) => {
							console.error(error);
						});
				});

			});
		});
		socket.on('stop', () => {
			// very basic implementation. This will not stop a process which hangs in the assembler stage
			if(this.mipsProgram.execution) {
				console.log("kill");
				this.mipsProgram.execution.kill('SIGKILL');
				this.running = false;
			}
		});
	}

	private setupSignals(socket: SocketIO.Socket) {
		this.mipsProgram.debug.on(dbgmits.EVENT_BREAKPOINT_HIT, (stoppedEvent: dbgmits.IBreakpointHitEvent) => {
			console.log("hit");
			socket.emit("programStopped", {
				location: new SourceLocation(stoppedEvent.frame.filename, stoppedEvent.frame.line),
				breakpointId: stoppedEvent.breakpointId
			});
		});
		this.mipsProgram.debug.on(dbgmits.EVENT_STEP_FINISHED, (stoppedEvent: dbgmits.IStepFinishedEvent) => {
			console.log("stepped");
			socket.emit("programStopped", {
				location: new SourceLocation(stoppedEvent.frame.filename, stoppedEvent.frame.line)
			});
		})
	}
}
