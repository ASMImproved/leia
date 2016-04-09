import {describe, it, expect} from 'angular2/testing';
import {AbstractCommand, Command, CommandRegistry} from "./Command";
import {ExecutionContext} from "./ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";
import {CommandDispatcher} from "./CommandDispatcher";

@Command({
    name: 'commandToCheckType'
})
class CommandToCheckType extends AbstractCommand<number> {
    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
        callback(null);
    }

    public canUse(payload:any):payload is number {
        return typeof payload == 'number';
    }
}

describe('CommandDispatcher', function() {
    var dispatcher: CommandDispatcher;

    beforeEach(function() {
        dispatcher = new CommandDispatcher();
    });

    it('can execute a command with correct type', function() {
        var callback = {
            callback: (err) => {
                expect(err).toBeNull(`should not throw error: '${err}'`);
            }
        };
        spyOn(callback, 'callback').and.callThrough();
        dispatcher.executeCommand('commandToCheckType', 42, null, callback.callback);
        expect(callback.callback).toHaveBeenCalledTimes(1);
    });

    it('does not execute command with wrong payload', function() {
        var callback = {
            callback: (err) => {
                if (err) {
                    expect(err).toContainError('Incorrect payload');
                    return;
                }
                fail('expected an error')
            }
        };
        spyOn(callback, 'callback').and.callThrough();
        dispatcher.executeCommand('commandToCheckType', 42, null, callback.callback);
        expect(callback.callback).toHaveBeenCalledTimes(1);
    })
});

