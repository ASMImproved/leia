/// <reference path="../../../../typings/browser/ambient/jasmine/index.d.ts" />
import {describe, it, expect} from 'angular2/testing';
import {LabelService} from "./LabelService";
import objectContaining = jasmine.objectContaining;

describe("LabelService", () => {
    var labelService: LabelService;

    beforeEach(() => {
        labelService = new LabelService();
    });

    it("recognizes a local label", () => {
        labelService.parse({
            content: "localLabel:",
            name: "testfile.s"
        });
        expect(labelService.labels.length).toBe(1);
        expect(labelService.labels[0].name).toBe('localLabel');
        expect(labelService.labels[0].file.name).toBe('testfile.s');
        expect(labelService.labels[0].line).toBe(1);
        expect(labelService.labels[0].global).toBe(false);
    });

    it("recognizes a global label", () => {
        labelService.parse({
            content: ".globl globalLabel\nglobalLabel:",
            name: "testfile.s"
        });
        expect(labelService.labels.length).toBe(1);
        expect(labelService.labels[0].name).toBe('globalLabel');
        expect(labelService.labels[0].file.name).toBe('testfile.s');
        expect(labelService.labels[0].line).toBe(2);
        expect(labelService.labels[0].global).toBe(true);
    });

});
