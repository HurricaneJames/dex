var Reflux=require('reflux')
  // , Faye = require('faye')
  , BlueBirdActions = require('./BlueBirdActions');

var input = ""
  , client, sub;

var Store = Reflux.createStore({
  listenables: [BlueBirdActions],
  init: function() {
    // client = new Faye.Client('http://localhost:8000/');
    // sub    = client.subscribe('/messages', this.onMessage);
  },
  getInitialState: function() { return input; },
  onMessage: function(message) {
    if(input !== message.text) {
      input = message.text;
      this.trigger(input);
    }
  },
  onInputChange: function(newValue) {
    input = newValue;
    this.trigger(input);
    client.publish('/messages', { text: newValue });
  }
});

module.exports = Store;