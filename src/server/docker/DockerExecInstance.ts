
import stream = require('stream');
import events = require('events');

export class DockerExecInstance extends events.EventEmitter {
    private _stdout: stream.Readable;
    private _stderr :stream.Readable;

    constructor(private _socket: stream.Duplex) {
        super();

        this._stdout = new stream.Readable();
        this._stdout._read = () => {};
        this._stdout.setEncoding('utf8');
        this._stderr = new stream.Readable();
        this._stderr._read = () => {};
        this._stderr.setEncoding('utf8');

        this.on('stdout', (chunk) => {
            this._stdout.push(chunk, 'utf8');
        });
        this.on('stderr', (chunk) => {
            this._stderr.push(chunk, 'utf8');
        });
        _socket.on('close', () => {
            this._stdout.push(null);
            this._stderr.push(null);
        });

        let contentLength = null;
        let header = null;
        let content;

        _socket.on('readable', () => {
            let dataLeft = true;
            while(dataLeft) {
                if(contentLength === null) {
                    header = _socket.read(8);
                    if(header !== null) {
                        header = new Buffer(header);
                        contentLength = header.readUInt32BE(4);
                    } else {
                        dataLeft = false;
                    }
                }
                if(contentLength !== null) {
                    content = _socket.read(contentLength)
                    if(content !== null) {
                        switch(header[0]) {
                            case 0:
                                console.error("received on stdin");
                                break;
                            case 1:
                                this.emit('stdout', content);
                                break;
                            case 2:
                                this.emit('stderr', content);
                                break;
                            default:
                                console.error(`received data on unknown STREAM_TYPE ${header[0]}`);
                        }
                        contentLength = null;
                    } else {
                        dataLeft = false;
                    }
                }
            }
        });
        _socket.on('close', () => {
            this.emit('close');
        });
    }

    public get stdout () {
        return this._stdout;
    }

    public get stderr () {
        return this._stderr;
    }

    public get socket() {
        return this._socket;
    }
}