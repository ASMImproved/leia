
import {AnswerContext} from "../../../../common/AnswerContext";
import {Subject} from "rxjs/Subject";

declare var io: any;

export class SocketService {
    public socket: any;
    private _connected;
    private contextSubjects: {[id: string] : Subject<AnswerContext>} = {};
    private serverEventSubjects: {[id: string] : Subject<any>} = {};

    constructor() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log("socket connected");
            this._connected = true;
        });
        this.socket.on('disconnect', () => {
            console.log("socket disconnected");
            this._connected = false;
        });
        this.socket.on('event', this.emitServerEmit.bind(this));
    }

    get connected(): boolean {
        return this._connected;
    }
    
    public sendCommand(name: string, payload: any, answerCallback: (err, answerPayload?: any, answerContext?: Array<AnswerContext>) => any) {
        this.socket.emit("event", {
            command: name,
            payload: payload
        }, (answer: any) => {
            console.log('received answer', answer);
            if(answer.err) {
                return answerCallback(answer.err);
            }
            answerCallback(null, answer.answer, answer.context);
            answer.context.forEach((context: AnswerContext) => {
                this.emitContext(context);
            });
        });
    }

    private emitServerEmit(event) {
        console.log('received server event', event);
        let subjectKey: string = this.createSubjectKey(event.name);
        this.serverEventSubjects[subjectKey] || (this.serverEventSubjects[subjectKey] = new Subject<any>());
        this.serverEventSubjects[subjectKey].next(event);
        event.context.forEach((context: AnswerContext) => {
            this.emitContext(context);
        });
    }

    public subscribeToServerEvent(name: string, handler: (event) => any) {
        let subjectKey: string = this.createSubjectKey(name);
        this.serverEventSubjects[subjectKey] || (this.serverEventSubjects[subjectKey] = new Subject<any>());
        this.serverEventSubjects[subjectKey].subscribe(handler);
    }

    private emitContext(context: AnswerContext) {
        let subjectKey: string = this.createSubjectKey(context.type);
        this.contextSubjects[subjectKey] || (this.contextSubjects[subjectKey] = new Subject<AnswerContext>());
        this.contextSubjects[subjectKey].next(context);
    }

    public subscribeToContext(type: string, handler: (a: AnswerContext) => any) {
        let subjectKey: string = this.createSubjectKey(type);
        this.contextSubjects[subjectKey] || (this.contextSubjects[subjectKey] = new Subject<AnswerContext>());
        this.contextSubjects[subjectKey].subscribe(handler);
    }

    private createSubjectKey(name: string):string {
        return '$' + name;
    }
}
