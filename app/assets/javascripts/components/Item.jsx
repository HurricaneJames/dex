var React = require('react');

var Item = React.createClass({ displayName: 'Item',
  render: function() {
    return <div>{this.props.name}</div>; }
});

module.exports = Item;
