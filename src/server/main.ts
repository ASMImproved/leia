/// <reference path="../../typings/main.d.ts" />
import {Gcc} from './gcc'
import {Project} from '../common/project.ts'
import {MipsRunner} from './mipsRunner'
import express = require('express')
import path = require('path');
import cp = require('child_process');
var app: express.Express = express()
import http = require('http')
var server: http.Server = http.createServer(app)
var io: SocketIO.Server = require('socket.io')(server)
 
app.get('/', (req, res) => {
	res.sendFile('public/index.html', {
		root: __dirname + '/../'
	})
})

app.use(express.static(__dirname + '/../public'));

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('run', function (project: Project) {
		var gcc: Gcc = new Gcc(project);
		gcc.compile((err, stdout, stderr, dirPath) => {
			if (err)
				return console.error(err);

			var mipsRun: cp.ChildProcess = (new MipsRunner(path.join(dirPath, "proj.out"))).execute();
			mipsRun.stdout.setEncoding('utf8');
			mipsRun.stdout.on('data', (chunk) => {
				socket.emit('stdout', chunk);
			})
		});
	});
});
 
server.listen(80)
console.log("server starts accepting connections");
