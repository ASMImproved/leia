/// <reference path="../../typings/main.d.ts" />
import express = require('express')
import path = require('path');
var app: express.Express = express()
import http = require('http')
import {SessionManager} from './SessionManager'
var server: http.Server = http.createServer(app)
var io: SocketIO.Server = require('socket.io')(server)
 
app.get('/', (req, res) => {
	res.sendFile('public/index.html', {
		root: path.join(__dirname, '..')
	})
})

app.use(express.static(path.join(__dirname, '..', 'public')));

var sessionManager: SessionManager = new SessionManager(io);
sessionManager.startListening();
 
server.listen(process.env.port || 80);
console.log("server starts accepting connections");
