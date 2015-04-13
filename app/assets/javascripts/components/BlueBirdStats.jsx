var React = require('react')
  , Reflux = require('reflux')
  , BlueBirdStore = require('./BlueBirdStore');

var BlueBirdStats = React.createClass({
  displayName: "BlueBirdStats",
  mixins: [Reflux.connect(BlueBirdStore, 'somethingElse')],
  render: function() {
    return (
      <div style={{float: 'right', maxWidth: 350}}>
        <div>Body Size: {this.state.somethingElse.length}</div>
        <div>{this.state.somethingElse}</div>
      </div>
    );
  }

});

module.exports = BlueBirdStats;