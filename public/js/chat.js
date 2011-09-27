//create the app
Chat = SC.Application.create();

Chat.LocationButtonView = SC.Button.extend({
  click: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        socket.emit('message', { person: Chat.person.name, message: "is at " + position.coords.latitude + ' ' + position.coords.longitude });
      });
    }
  }
});
Chat.person = SC.Object.create({"name":null});
Chat.PersonView = SC.TextField.extend({
  valueBinding: "Chat.person.name"
});
Chat.AddMessageView = SC.TextField.extend({
  keyUp: function(event) {
    if (event.which != 13) //<cr>
    {
      //notify that a message is coming
      socket.emit('typing', { person: Chat.person.name });
    }
    else
    {
      //send the message
      var value = this.get('value');
      if (value) {
        socket.emit('message', { person: Chat.person.name, message: value });
        this.set('value', '');
      }
    }
  }
});

//define the message object
Chat.Message = SC.Object.extend({"time": null, "person": null, "message": null});

//create a message controller
Chat.messagesController = SC.ArrayProxy.create({
  // Initialize the array controller with an empty array.
  content: [],

  createMessage: function(data) {
    this.removeComing(data.person);
    this.insertAt(0, Chat.Message.create(data));
  },
  
  removeComing: function(person)
  {
    for (var i = 0; i < this.length; i++)
    {
      console.log(i)
      while (this[i].person == person && this[i].message == '[is typing...]')
      {
        console.log('removing');
        this.removeAt(i);
      }
    }
  },
  
  coming: function(data) {
    this.removeComing(data.person);
    data.message = '[is typing...]';
    this.insertAt(0, Chat.Message.create(data));
  }
});

var socket;
$(function() {
  //connect the socket
  socket = io.connect('http://localhost:3000');
  
  //receive message
  socket.on('message', function (data) {
    Chat.messagesController.createMessage(data);
  });
  
  //reveive a typing message
  socket.on('typing', function (data){
    Chat.messagesController.coming(data);
  });
});