/// <reference path="../../../typings/main.d.ts" />
import {Project} from '../../common/project.ts'
import {MipsRunner} from '../MipsRunner'
import {Gcc} from '../Gcc'
import path = require('path');
import cp = require('child_process');
import * as dbgmits from "asmimproved-dbgmits";
import {ProgramStoppedEvent, ISourceLocation, SourceLocation, Breakpoint, Registers} from "../../common/Debugger";
import {basename} from 'path';
import {RegisterValueFormatSpec} from "asmimproved-dbgmits/lib/index";

export interface ResultCallback<ResultType> {
	(result: ResultType, error: any): void;
}

export class Session {
	running: boolean = false;
	stage: string;
	private mipsProgram: MipsRunner = null;
	private memoryFrame: {start: number, length: number};

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
					this.clearSignals(socket);
					socket.emit('exit', {code: code, signal: signal});
				});

				this.mipsProgram.on('debuggerReady', () => {
					this.mipsProgram
						.connectDebugger()
						.then(() => {
							console.log("connected debugger");
							this.updateMemoryFrame(socket);
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
		socket.on('memoryFrameChange', (frame) => {
			this.memoryFrame = frame;
		});
	}

	private clearSignals(socket: SocketIO.Socket) {
		socket.removeAllListeners('addBreakpoint');
		socket.removeAllListeners('continue');
		socket.removeAllListeners('step');
	}

	private setupSignals(socket: SocketIO.Socket) {
		socket.on('addBreakpoint', (location: ISourceLocation, onFinished: ResultCallback<Breakpoint>) => {
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
		socket.on('removeBreakpoint', (breakpointId: number) => {
			this.mipsProgram.debug.removeBreakpoint(breakpointId);
		});

		socket.on('continue', () => {
			console.log("continue");
			this.mipsProgram.debug.resumeInferior();
		});
		socket.on('step', () => {
			console.log('step');
			this.mipsProgram.debug.stepIntoInstruction();
		});

		this.mipsProgram.debug.on(dbgmits.EVENT_TARGET_RUNNING, (threadId: string) => {
			console.log("continue running");
			socket.emit("programContinued");
		});
		this.mipsProgram.debug.on(dbgmits.EVENT_BREAKPOINT_HIT, (stoppedEvent: dbgmits.IBreakpointHitEvent) => {
			console.log("hit");
			console.log(stoppedEvent);
			socket.emit("programStopped", <ProgramStoppedEvent>{
				location: new SourceLocation(basename(stoppedEvent.frame.filename), stoppedEvent.frame.line),
				breakpointId: stoppedEvent.breakpointId
			});
			this.sendRegisterUpdate(socket);
		});
		this.mipsProgram.debug.on(dbgmits.EVENT_STEP_FINISHED, (stoppedEvent: dbgmits.IStepFinishedEvent) => {
			console.log("stepped");
			socket.emit("programStopped", {
				location: new SourceLocation(basename(stoppedEvent.frame.filename), stoppedEvent.frame.line)
			});
			this.sendRegisterUpdate(socket);
		});
	}

	private sendRegisterUpdate(socket: SocketIO.Socket): void {
		console.log("sending registers");
		let registers: Registers = [];
		//TODO cache names?
		let registerNames: Promise<void> =
			this.mipsProgram.debug
				.getRegisterNames()
				.then((names: string[]) => {
					for (let i = 0; i < names.length; ++i) {
						if (registers[i] === undefined) {
							registers[i] = {
								name: null,
								value: 0
							}
						}
						registers[i].name = names[i];
					}
				});
		let registerValues: Promise<void> =
			this.mipsProgram.debug
				.getRegisterValues(RegisterValueFormatSpec.Binary)
				.then((values: Map<number, string>) => {
					values.forEach((registerValue:string, registerNumber:number) => {
						if (registers[registerNumber] === undefined) {
							registers[registerNumber] = {
								name: null,
								value: 0
							}
						}
						registers[registerNumber].value = Number.parseInt(registerValue, 2);
					});
				});
		Promise.all([registerValues, registerNames]).then(() => {
			console.log(registers);
			socket.emit('updateRegisters', registers);
		});
	}

	public updateMemoryFrame(socket: SocketIO.Socket) {
		this.mipsProgram.debug.readMemory("&hellostring", 10000)
		.then((blocks: dbgmits.IMemoryBlock[]) => {
			socket.emit("memoryUpdate", blocks);
		});
	}
}
