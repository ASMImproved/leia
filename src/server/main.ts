/// <reference path="../../typings/main.d.ts" />
import express = require('express')
import path = require('path');
import expressSession = require('express-session');
import expressSocketioSession = require('express-socket.io-session');

var app: express.Express = express();
import http = require('http')
import {SessionManager} from './session/SessionManager'
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

var sessionManager: SessionManager = new SessionManager(io);
sessionManager.startListening();
 
server.listen(process.env.port || 80);
console.log("server starts accepting connections");
