/// <reference path="../../typings/main.d.ts" />

var express = require('express')
var app = express()
var server = require('http').Server(app)
var io: SocketIO.Server = require('socket.io')(server)
 
app.get('/', (req, res) => {
  res.send('Hello World from node')
})

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('run', function (data) {
    console.log("running %s", data.content);
  });
});
 
server.listen(80)
console.log("server starts accepting connections");