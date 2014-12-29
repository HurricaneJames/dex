jest.dontMock('../DemoComponent');

describe('DemoComponent', function() {
  it('should tell use it is a demo component', function() {
    var React = require('react/addons');
    var TestUtils = React.addons.TestUtils;
    var DemoComponent = require('../DemoComponent');
    var demoComponent = TestUtils.renderIntoDocument(<DemoComponent/>);

    expect(demoComponent.getDOMNode().textContent).toBe('Demo Component');
  });
});