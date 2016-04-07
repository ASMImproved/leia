/// <reference path="../../typings/main.d.ts" />
require('source-map-support').install();
import express = require('express')
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
	name: 'asmimproved-lea'
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
