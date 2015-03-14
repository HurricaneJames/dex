var React = require('react');

var Simple = React.createClass({
  propTypes: { value: React.PropTypes.number },
  getDefaultProps: function() { return { value: 0 }; },
  getInitialState: function() { return { value: this.props.value }; },
  plus: function()  { this.setState({ value: this.state.value + 1}); },
  minus: function() { this.setState({ value: this.state.value - 1}); },
  render: function() {
    return (
      <div>
        <button onClick={this.minus}>-</button>
        {this.state.value}
        <button onClick={this.plus}>+</button>
      </div>
    );
  }
});

module.exports = Simple;


