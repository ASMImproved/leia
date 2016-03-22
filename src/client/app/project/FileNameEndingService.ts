import {Output, EventEmitter, Injectable} from 'angular2/core';

@Injectable()
export class FileNameEndingService {

    getFileNameEnding(fileName: string) {
        var chunks: Array<string>  = fileName.split('.');
        if(chunks.length === 1) {
            return null;
        } else {
            return chunks[chunks.length - 1];
        }
    }
}