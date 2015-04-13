var React = require('react')
  , Reflux = require('reflux')
  , BlueBirdBody = require('./BlueBirdBody')
  , BlueBirdActions = require('./BlueBirdActions')
  , BlueBirdStore = require('./BlueBirdStore');

var BlueBird = React.createClass({
  displayName: 'BlueBird',
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
        <BlueBirdBody content={this.getContent()} onChange={this.onBodyChange} />
      </div>
    );
  }
});

module.exports = BlueBird;