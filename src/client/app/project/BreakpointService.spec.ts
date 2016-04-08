/// <reference path="../../../../typings/browser/ambient/jasmine/index.d.ts" />
import {describe, it, expect} from 'angular2/testing';
import {BreakpointService} from "./BreakpointService";
import {SocketService} from "./socket/SocketService";
import {RunService} from "./RunService";
import {SourceLocation, Breakpoint} from "../../../common/Debugger";

describe("BreakpointService", () => {
    var breakpointService: BreakpointService;
    var socketService: any;
    var runService: any;
    var io: any;

    beforeEach(function() {
        io = () => {
            return {
            }
        };
        socketService = {
            sendCommand: null
        };
        runService = {
            runStatusChanged: {
                subscribe: (callback: any) => {}
            }
        };

        breakpointService = new BreakpointService(socketService, runService);
    });
    it("removes breakpoint on server if server is running", () => {
        const location = new SourceLocation("test.s", 42);

        runService.running = true;

        spyOn(socketService, "sendCommand").and.callFake((commandName: string, ...args: any[]) => {
            if (commandName === 'addBreakpoint') {
                expect(args[0]).toBe(location);
                expect(typeof(args[1])).toBe('function');
                args[1](<Breakpoint>{
                    location: location,
                    pending: false,
                    id: 420
                }, null);
            } else if (commandName === 'removeBreakpoint') {
                expect(args[0]).toBe(420);
            } else {
                // no other signal should be called
                expect(commandName).not.toBe(commandName);
            }
        });

        breakpointService.addBreakpoint(location);
        expect(socketService.sendCommand).toHaveBeenCalledTimes(1);
        breakpointService.removeBreakpoint(location);
        expect(socketService.sendCommand).toHaveBeenCalledTimes(2);
    });
});
