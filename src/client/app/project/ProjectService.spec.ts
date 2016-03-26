/// <reference path="../../../../typings/browser/ambient/jasmine/index.d.ts" />
import {ProjectService} from './ProjectService'
import {File} from "../../../common/File";
import {Project} from "../../../common/Project";

describe('ProjectService', function() {

    let projectService: ProjectService;

    beforeEach(function() {
        projectService = new ProjectService();
        projectService.project = new Project("Test");
    });

    it('an attempt to add a file that already exists should return an exception', function() {
        let file1: File = new File("test.ext");
        let file2: File = new File("test.ext");
        projectService.addFile(file1);
        expect(projectService.addFile.bind(null, file2)).toThrow();
    });

    it('fileExists should return false if file does not exists', function() {
        expect(projectService.fileExists("test.ext")).toBeFalsy();
    });

    it('fileExists should return true if file already exists', function() {
        projectService.addFile(new File("test.ext"));
        console.log('RESULT:::' + projectService.fileExists("text.ext"));
        expect(projectService.fileExists("test.ext")).toBeTruthy();
    });

    it('getFileByName should return file reference', function() {
        let file = new File("text.ext");
        projectService.addFile(file);
        expect(projectService.getFileByName("text.ext")).toBe(file);
    });

    it("getFileByName should return null if file doesn't exist", function() {
        expect(projectService.getFileByName("text.ext")).toBeNull();
    });
});