//create the app
Chat = SC.Application.create();

//pending messages
Chat.pending = SC.ArrayProxy.create({
  // Initialize the array controller with an empty array.
  content: [],

  addPerson: function(person) {
    if (!this.contains(person)) {
      this.pushObject(person);
    }
  },

  removePerson: function(person) {
    this.removeObject(person);
  }
});

//send geo location
Chat.locationButton = SC.Button.extend({
  click: function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        Chat.socket.emit('message', {
          person: Chat.person.name,
          message: "is at " + position.coords.latitude + ' ' +
                   position.coords.longitude
        });
      });
    }
  }
});

//current person
Chat.person = SC.Object.create({"name":null});
Chat.personView = SC.TextField.extend({
  valueBinding: "Chat.person.name"
});

//prepare message
Chat.Message = SC.Object.extend({"time": null, "person": null, "message": null});
Chat.messageView = SC.TextField.extend({
  keyUp: function(event) {
    var value = $('#message').val();
//    var value = this.get('value'); //this value is not always set (bug in SC?)
    if (value) {
      if (event.which != 13) { //not <cr>
          //notify that a message is coming
          Chat.socket.emit('typing', { person: Chat.person.name });
      }
      else {
        //send the message
        Chat.socket.emit('message', {
          person: Chat.person.name,
          message: value
        });
        this.set('value', '');
      }
    }
  }
});

//create a message controller
Chat.messages = SC.ArrayProxy.create({
  // Initialize the array controller with an empty array.
  content: [],

  addMessage: function(data) {
    Chat.pending.removePerson(data.person);
    this.insertAt(0, Chat.Message.create(data));
  }
});

//wire up socket.io
$(function() {
  //connect the socket
  Chat.socket = io.connect('/');
  
  //receive message
  Chat.socket.on('message', function (data) {
    Chat.messages.addMessage(data);
  });
  
  //reveive a typing message
  Chat.socket.on('typing', function (data){
    Chat.pending.addPerson(data.person);
  });
});