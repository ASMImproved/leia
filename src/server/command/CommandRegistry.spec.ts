import {describe, it, expect} from 'angular2/testing';
import {CommandRegistry} from "./CommandRegistry";
import {AbstractCommand, Command} from "./Command";
import {ExecutionContext} from "./ExecutionContext";
import {AnswerContext} from "../../common/AnswerContext";

class TestClass extends AbstractCommand {
    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
    }
}

describe('CommandRegistry', function() {
    it('can register a command', function() {
        CommandRegistry.addCommand({name: 'test'}, TestClass);
        expect(CommandRegistry.createCommand('test')).toBeAnInstanceOf(TestClass);
    })
});


@Command({
    name: 'test2'
})
class Test2Class extends AbstractCommand {
    execute(payload:any, executionContext:ExecutionContext, callback:(err:any, answer?:any, answerContext?:Array<AnswerContext>)=>any) {
    }
}

describe('Command', function() {
    it('registers a command', function() {
        expect(CommandRegistry.createCommand('test2')).toBeAnInstanceOf(Test2Class);
    })
});
