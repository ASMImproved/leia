/// <reference path="../../../../../typings/browser/ambient/async/index.d.ts" />
import {Injectable, OnInit} from "angular2/core";
import {Project} from "../../../../common/Project";

declare var zip: any;
declare function saveAs(blob, name);

@Injectable()
export class PersistenceService implements OnInit {

    constructor() {

    }

    ngOnInit():any {
        zip.workerScriptsPath = 'vendor/zipjs/';
        zip.useWebWorkers = false;
    }

    persist(project: Project, cb): any {
        let string: string = JSON.stringify(project);
        zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
            writer.add("proj.json", new zip.TextReader(string), function() {
                writer.close(function(blob) {
                    saveAs(blob, "proj.lea");
                });
            });
        }, function(err) {
            cb('zip failure', err);
        });
    }
}