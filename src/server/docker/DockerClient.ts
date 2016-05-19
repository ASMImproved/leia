import http = require('http');
import stream = require('stream');
import * as request from "request";

export class DockerClient{
    private unixSocketPath;

    constructor(options) {
        this.unixSocketPath = options.unixSocketPath;
    }

    public createContainer(body, cb) {
        request.post({
            url: `http://unix:${this.unixSocketPath}:/containers/create`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body,
            json: true
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 201) {
                return cb(new Error(`Docker create returned error status code: ${response.statusCode} ${body}`));
            }
            if(body.Warnings) {
                console.warn('Docker create returned warnings:', body.Warnings);
            }
            let containerId = body.Id;
            return cb(null, containerId);
        });
    }

    public startContainer(containerId, cb) {
        request.post({
            url: `http://unix:${this.unixSocketPath}:/containers/${containerId}/start`
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 204) {
                return cb(new Error(`Docker start return error status code ${response.statusCode} ${body}`));
            }
            return cb(null);
        });
    }

    public copyFilesFromStreamIntoContainer(containerId : string, absoluteDestinationPath : string, tarStream: stream.Readable, cb) {
        let dockerRequestStream = request.put({
            url: `http://unix:${this.unixSocketPath}:/containers/${containerId}/archive?path=${absoluteDestinationPath}`,
            headers: {
                'Content-Type': 'application/x-tar'
            }
        }, (err, response, body) => {
            if (err) {
                return cb(err);
            }
            if (response.statusCode !== 200) {
                return cb(new Error(`Failed to extract in container with status code ${response.statusCode} ${body}`));
            }
            return cb(null);
        });
        tarStream.pipe(dockerRequestStream);
    }
    
    public execAsync(containerId: string, body, cb) {
        request.post({
            url: `http://unix:${this.unixSocketPath}:/containers/${containerId}/exec`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body,
            json: true
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 201) {
                return cb(new Error(`Docker create exec return error status code ${response.statusCode} ${body}`));
            }
            let execId = body.Id;
            let execRequestBody = JSON.stringify({

            });
            request.post({
                url: `http://unix:${this.unixSocketPath}:/exec/${execId}/start`,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': execRequestBody.length
                },
                body: execRequestBody
            }, (err, response, body) => {
                if(err) {
                    return cb(err);
                }
                if(response.statusCode !== 200) {
                    return cb(new Error(`Docker start exec return an error status code ${response.statusCode} ${body}`));
                }
                let stdout = body, stderr = '';
                request.get({
                    url: `http://unix:${this.unixSocketPath}:/exec/${execId}/json`,
                    json: true
                }, (err, response, body) => {
                    if(err) {
                        return cb(err);
                    }
                    if(response.statusCode !== 200) {
                        return cb(new Error(`Docker exec inspect returned error status code ${response.statusCode} ${body}`));
                    }
                    cb(null, body, stdout, stderr);
                });
            });
        });
    }

    public execAsStream(containerId: string, body, options, cb) {
        request.post({
            url: `http://unix:${this.unixSocketPath}:/containers/${containerId}/exec`,
            headers: {
                'Content-Type': 'application/json'
            },
            body: body,
            json: true
        }, (err, response, body) => {
            if (err) {
                return cb(err);
            }
            if (response.statusCode !== 201) {
                return cb(new Error(`Docker create exec return error status code ${response.statusCode} ${body}`));
            }
            let execId = body.Id;
            let execReqBody = JSON.stringify({ });
            let execReq = http.request({
                path: `/exec/${execId}/start?stream=1&stdout=1&stderr=1`,
                method: 'POST',
                socketPath: this.unixSocketPath,
                headers: {
                    'Content-Length': execReqBody.length,
                    'Connection': 'Upgrade',
                    'Content-Type': 'application/json',
                    'Upgrade': 'tcp'
                }
            });
            execReq.write(execReqBody);
            execReq.end();
            execReq.on('response', (response) => {
                // if this event is triggered it didn't upgrade the connection, so it failed
                return cb(new Error(`Docker exec start failed with status code ${response.statusCode}`));
            });
            execReq.on('upgrade', (res, socket, upgradeHead) => {
                // it should require to analyse the input stream but it return just plain text
                return cb(null, socket, execId);
            });
        });
    }

    public inspectExec(execId: string, cb) {
        request.get({
            url: `http://unix:${this.unixSocketPath}:/exec/${execId}/json`,
            json: true
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 200) {
                return cb(new Error(`Docker exec inspect returned error status code ${response.statusCode} ${body}`));
            }
            cb(null, body);
        });
    }

    public removeContainer(containerId, cb) {
        request({
            method: "DELETE",
            url: `http://unix:${this.unixSocketPath}:/containers/${containerId}?v=1&force=1`,
            json: true
        }, (err, response, body) => {
            if(err) {
                return cb(err);
            }
            if(response.statusCode !== 204) {
                return cb(new Error(`Docker remove return error status code ${response.statusCode} ${body}`));
            }
            return cb(null);
        });
    }
}