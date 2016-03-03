/// <reference path="../../../typings/main.d.ts" />
import {SessionManager} from './SessionManager'

describe("SessionManager", function() {
	var io: any;
	var sessionManager: SessionManager;

	beforeEach(function() {
		io = {
			on: function() {}
		}
		spyOn(io, "on");
		sessionManager = new SessionManager(io);
	})
	it("listen on socket.io object when startListening is called", function() {
		sessionManager.startListening();
		expect(io.on).toHaveBeenCalled();
		expect(io.on.calls.first().args[0]).toEqual("connection");
	})

})
