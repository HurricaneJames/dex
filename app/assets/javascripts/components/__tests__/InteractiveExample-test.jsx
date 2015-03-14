jest.dontMock('../InteractiveExample');

describe("Demo1", function() {
  var React = require('react/addons')
    , TestUtils = React.addons.TestUtils
    , Demo1 = require('../InteractiveExample')
    , demo1;

  beforeEach(function() {
    demo1 = TestUtils.renderIntoDocument(<Demo1 />);
  });
  it("should default to 0 with buttons for +/-", function() {
    expect(demo1.getDOMNode().textContent).toBe('-0+');
  });
  it("should increment the counter when clicking on the +", function() {
    var plusButton = TestUtils.scryRenderedDOMComponentsWithTag(demo1, 'button')
          .filter(function(component) { return component.getDOMNode().textContent === '+'})[0];
    TestUtils.Simulate.click(plusButton)
    expect(demo1.getDOMNode().textContent).toBe('-1+');
  });
  it("should decrement the counter when clicking on the +", function() {
    var minusButton = TestUtils.scryRenderedDOMComponentsWithTag(demo1, 'button')
          .filter(function(component) { return component.getDOMNode().textContent === '-'})[0];
    TestUtils.Simulate.click(minusButton)
    expect(demo1.getDOMNode().textContent).toBe('--1+');
  });

  it("should test react dom input", function() {
    var input = TestUtils.renderIntoDocument(<input name="xyzzy" value="abc" onChange={jest.genMockFunction()} />);
    console.log("isDOMComponent: " + TestUtils.isDOMComponent(input));
    console.log("isCompositeComponent: " + TestUtils.isCompositeComponent(input));
  })
});