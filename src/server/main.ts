/// <reference path="../../typings/main.d.ts" />

import express = require('express')
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
  socket.on('run', function (data) {
    console.log("running %s", data.content);
  });
});
 
server.listen(80)
console.log("server starts accepting connections");
