// Demo 2
var React = require('react');

var Demo2View = React.createClass({
  propTypes: { value: React.PropTypes.number },
  getDefaultProps: function() { return { value: 0 }; },
  getInitialState: function() { return { value: this.props.value }; },
  plus: function()  { this.setState({ value: this.state.value + 1}); },
  minus: function() { this.setState({ value: this.state.value - 1}); },
  render: function() {
    return (
      <div>
        <button onClick={this.minus}>-</button>
        {this.props.value}
        <button onClick={this.plus}>+</button>
      </div>
    );
  }
});

var Demo2 = React.createClass({
  propTypes: { value: React.PropTypes.number },
  getDefaultProps: function() { return { value: 0 }; },
  getInitialState: function() { return { value: this.props.value }; },
  render: function() {
    return <Demo2View value={this.state.value} />;
  }
});

module.exports = Demo2;


