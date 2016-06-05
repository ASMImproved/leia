/// <reference path="../../typings/globals/ace/index.d.ts" />
/// <reference path="../../typings/globals/async/index.d.ts" />
/// <reference path="../../typings/globals/bunyan/index.d.ts" />
/// <reference path="../../typings/globals/express-serve-static-core/index.d.ts" />
/// <reference path="../../typings/globals/express-session/index.d.ts" />
/// <reference path="../../typings/globals/express/index.d.ts" />
/// <reference path="../../typings/globals/jasmine/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
/// <reference path="../../typings/globals/socket.io/index.d.ts" />
/// <reference path="../../typings/globals/tar/index.d.ts" />
/// <reference path="../../typings/modules/express-socket.io-session/index.d.ts" />
/// <reference path="../../typings/modules/randomstring/index.d.ts" />
/// <reference path="../../typings/modules/request/index.d.ts" />
/// <reference path="../../typings/modules/serve-static/index.d.ts" />
require('source-map-support').install();
import * as express from "express";
import path = require('path');
import expressSession = require('express-session');
import expressSocketioSession = require('express-socket.io-session');

var app: express.Express = express();
import http = require('http')
import {SocketSessionManager} from "./socket/SocketSessionManager";
var server: http.Server = http.createServer(app);
var io: SocketIO.Server = require('socket.io')(server);

var session = expressSession({
	secret: 'shouldbesecret',
	name: 'asmimproved-leia'
});

app.use(session);

app.get('/', (req, res) => {
	res.sendFile('public/index.html', {
		root: path.join(__dirname, '..')
	})
});

app.use(express.static(path.join(__dirname, '..', 'public')));

io.use(expressSocketioSession(session));

var socketSessionManager: SocketSessionManager = new SocketSessionManager(io);
socketSessionManager.startListening();
 
server.listen(process.env.port || 80);
console.log("server starts accepting connections");
