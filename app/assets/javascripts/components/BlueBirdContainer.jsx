var React = require('react')
  , Reflux = require('reflux')
  , BlueBird = require('./BlueBird')
  , BlueBirdActions = require('./BlueBirdActions')
  , BlueBirdStore = require('./BlueBirdStore');

var BODY_STYLE = {
  border: '1px solid black',
  backgroundColor: '#ddd',
  maxWidth: 400
};

var BlueBirdContainer = React.createClass({
  displayName: 'BlueBirdContainer',
  mixins: [Reflux.connect(BlueBirdStore, 'bluebirdBody')],
  propTypes: {
    reverse: React.PropTypes.bool
  },
  getContent: function() {
    if(this.props.reverse) {
      return this.state.bluebirdBody.split('').reverse().join('');
    }else {
      return this.state.bluebirdBody;
    }
  },
  onBodyChange: function(newValue) {
    // this.setState({bluebirdBody: newValue});
    BlueBirdActions.inputChange(newValue);
  },
  render: function() {
    return (
      <div>
        <BlueBird content={this.getContent()} onChange={this.onBodyChange} style={BODY_STYLE} />
      </div>
    );
  }
});

module.exports = BlueBirdContainer;