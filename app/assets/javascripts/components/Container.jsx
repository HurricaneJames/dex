var React = require('react')
  , ContainerMixin = require('./ContainerMixin');

var Container = React.createClass({
  displayName: 'Container',
  mixins: [ContainerMixin],
  render: function() {
    return (
      <div>{this.renderContainer()}</div>
    );
  }
});

module.exports = Container;