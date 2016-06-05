import {Injectable} from "@angular/core";
import {Project} from "../../../../common/Project";

declare var zip: any;
declare function saveAs(blob, name);

@Injectable()
export class PersistenceService  {

    constructor() {
        zip.workerScriptsPath = 'vendor/zipjs/';
        zip.useWebWorkers = true;
    }

    persist(project: Project, cb): any {
        let string: string = JSON.stringify(project);
        zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
            writer.add("proj.json", new zip.TextReader(string), function() {
                writer.close(function(blob) {
                    saveAs(blob, "proj.leia");
                });
            });
        }, function(err) {
            cb(err);
        });
    }

    openProjectFromDisk(blob, cb) {
        zip.createReader(new zip.BlobReader(blob), function(reader) {

            // get all entries from the zip
            reader.getEntries(function(entries) {
                let projectBlob;
                entries.forEach((entry) => {
                    if(entry.filename == 'proj.json') {
                        projectBlob = entry;
                    }
                });

                if(!projectBlob) {
                    return cb(new Error('Failed to project from file'));
                }

                projectBlob.getData(new zip.TextWriter(), function(text) {
                    // text contains the entry data as a String
                    let project: Project = JSON.parse(text);
                    cb(null, project);

                    // close the zip reader
                    reader.close(function() {
                        // onclose callback
                    });

                }, function(current, total) {
                    // onprogress callback
                });
            });
        }, function(err) {
            cb(err);
        });
    }
}