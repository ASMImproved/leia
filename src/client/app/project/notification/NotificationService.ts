
import {Injectable} from "angular2/core";

@Injectable()
export class NotificationService {

    constructor() {

    }

    public confirm(message, cb) {
        let answer = confirm(message);
        cb(null, answer);
    }
}