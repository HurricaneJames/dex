var Reflux=require('reflux')
  , Faye = require('faye')
  , BlueBirdActions = require('./BlueBirdActions');

var input = ""
  , client, sub;

var Store = Reflux.createStore({
  listenables: [BlueBirdActions],
  init: function() {
    client = new Faye.Client('http://localhost:8000/');
    sub    = client.subscribe('/messages', this.onMessage);
    if(document.body) {
      input = document.body.getAttribute('data-bluebird-store') || "";
    }
  },
  getInitialState: function() { console.debug("is: %o", input); return input; },
  onMessage: function(message) {
    if(input !== message.text) {
      input = message.text;
      this.trigger(input);
    }
  },
  onInputChange: function(newValue) {
    input = newValue;
    this.trigger(input);
    if(client) { client.publish('/messages', { text: newValue }); }
  }
});

module.exports = Store;