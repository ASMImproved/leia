/// <reference path="../../../../typings/globals/jasmine/index.d.ts" />
import {describe, it, expect} from '@angular/core/testing';
import {FileNameEndingService} from './FileNameEndingService'


describe('FileNameEndingService', function() {
    var fileNameEndingService: FileNameEndingService = new FileNameEndingService();

    it('simple file name', function() {
       expect(fileNameEndingService.getFileNameEnding('test.css')).toBe('css');
    });

    it('file name with two dots should only return the last bit', function() {
        expect(fileNameEndingService.getFileNameEnding('test.a.b')).toBe('b');
    });

    it('file name without an ending should return NULL', function() {
        expect(fileNameEndingService.getFileNameEnding('test')).toBeNull();
    })
});