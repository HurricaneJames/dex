jest.dontMock('../Container');

var randomWords = [
  ["apple", "bannana", "watermelon", "oranges", "ice cream"],
  [],
  ["alpha", "beta", "gamma", "iota"],
  ["hot dog", "mustard", "guava"],
  ["chocolate", "ice cream", "cookies", "brownies"],
  ["dog", "cat", "iguana", "leopard", "bear"]
];

describe('Container', function() {
  var React = require('react/addons')
    , TestUtils = React.addons.TestUtils
    , Container = require('../Container')
    , CustomTemplate = React.createClass({
        displayName: 'CustomTemplate',
        propTypes: { item: React.PropTypes.any.isRequired },
        render: function() { return <span className="customFinder">{this.props.item}</span>; }
      });

  it('should display items, by default, in a text template (span element)', function() {
    var container = TestUtils.renderIntoDocument(<Container items={randomWords[0]} />)
      , items = TestUtils.scryRenderedDOMComponentsWithTag(container, 'span').map(function(item) { return item.getDOMNode().textContent; });
    expect(items).toEqual(randomWords[0]);
  });

  it('should display items with a custom template', function() {
    container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords[0]} />);
    var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
    expect(items).toEqual(randomWords[0]);
  });

  it('highlights item as selected when clicked', function() {});

  describe('drop zones', function() {
    it('shows when hovering over drop zone', function() {});
    it('shows previous drop zone when hovering over top half of item', function() {});
    it('shows next drop zone when hovering over bottom half of item', function() {});
  });

  describe('Drop Behavior', function() {
    it('adds dropped items to currently selected drop zone', function() {});
    it('removes selected items on drag end', function() {});
  });
})