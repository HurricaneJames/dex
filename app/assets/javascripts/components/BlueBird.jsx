var React = require('react')
  , LazyInput = require('lazy-input');

var BlueBird = React.createClass({
  displayName: 'BlueBird',
  propTypes: {
    content: React.PropTypes.string,
    onChange: React.PropTypes.func,
    style: React.PropTypes.object
  },
  onChange: function(e) {
    this.props.onChange(e.target.value);
  },
  render: function() {
    return (
      <div>
        <span>Enter Some Text</span>
        <LazyInput type="textarea" value={this.props.content} onChange={this.onChange} style={this.props.style} rows={15} />
      </div>
    );
  }
});
module.exports = BlueBird;