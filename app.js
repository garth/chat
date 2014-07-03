var express = require('express');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

//configure express
app.configure(function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

//start the http server
// run it on port as defined in cloud9 environment variable, only change to run it on cloud9
app.listen(process.env.C9_PORT); 
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

//setup the chat server
var clients = [];

io.sockets.on('connection', function (socket) {
  //add the new client and send welcome message
  clients.push(socket);
  socket.emit('message', { time: new Date().toLocaleTimeString(), person: 'Chat Server', message: 'Welcome to Chat!' });

  //relay messages
  socket.on('message', function (data) {
    //add server time to the message
    data.time = new Date().toLocaleTimeString();
    //log the message
    console.log(data.person + ': ' + data.message);
    //send messages to all clients
    for (var i = 0; i < clients.length; i++)
    {
      clients[i].emit('message', data);
    }
  });

  //notify pending messages
  socket.on('typing', function (data) {
    //log the message
    console.log(data.person + ': is typing');
    //send messages to all clients
    for (var i = 0; i < clients.length; i++)
    {
      clients[i].emit('typing', data);
    }
  });
});