
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// web sockets

var clients = [];

io.sockets.on('connection', function (socket) {
  //add the new client
  clients.push(socket);
  //sent welcome message
  socket.emit('message', { time: new Date().toLocaleTimeString(), person: 'Chat Server', message: 'Welcome to Chat!' });
  //wait for messages
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
  socket.on('typing', function (data) {
    //add server time to the message
    data.time = new Date().toLocaleTimeString();
    //log the message
    console.log(data.person + ': is typeing');
    //send messages to all clients
    for (var i = 0; i < clients.length; i++)
    {
      clients[i].emit('typing', data);
    }
  });
});