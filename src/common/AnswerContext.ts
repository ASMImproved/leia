
export class AnswerContext {
    public constructor(private _type: string, private _payload: any) {

    }

    public get type() {
        return this._type;
    }

    public get payload() {
        return this._payload;
    }
}