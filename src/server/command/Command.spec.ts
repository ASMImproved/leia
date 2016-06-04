/// <reference path="../../../typings/globals/jasmine/index.d.ts" />
import {AbstractCommand, Command, CommandRegistry} from "./Command";
import {ExecutionContext} from "./ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";

class TestClass extends AbstractCommand<void> {
    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
    }

    public canUse(payload:any):payload is void {
        return true;
    }
}

describe('CommandRegistry', function() {
    it('can register a command', function() {
        CommandRegistry.addCommand({name: 'test'}, TestClass);
        expect(CommandRegistry.createCommand('test') instanceof TestClass).toBe(true);
    })
});


@Command({
    name: 'test2'
})
class Test2Class extends AbstractCommand<void> {
    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
    }

    public canUse(payload:any):payload is void {
        return true;
    }
}

describe('Command', function() {
    it('registers a command', function() {
        expect(CommandRegistry.createCommand('test2') instanceof Test2Class).toBe(true);
    })
});
