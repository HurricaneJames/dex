var React = require('react')
  , LazyInput = require('lazy-input');

var BODY_STYLE = {
  border: '1px solid black',
  backgroundColor: '#ddd',
  maxWidth: 400
};

var BlueBirdBody = React.createClass({
  displayName: 'BlueBirdBody',
  propTypes: {
    content: React.PropTypes.string,
    onChange: React.PropTypes.func
  },
  onChange: function(e) {
    this.props.onChange(e.target.value);
  },
  render: function() {
    return (
      <div>
        <span>Enter Some Text</span>
        <LazyInput type="textarea" value={this.props.content} onChange={this.onChange} style={BODY_STYLE} rows={15} />
      </div>
    );
  }
});
module.exports = BlueBirdBody;