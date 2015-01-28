// This is more of an integration test in that DraggableListContainerView is really
// useless without the DraggableListView controller.
jest.dontMock('../Container');
jest.dontMock('../DraggableListView');

var randomWords = ["apple", "bannana", "watermelon", "oranges", "ice cream"]
  , CONTAINER_TYPE = 'custom_container_type'
  , CONTAINER_SELECTED_ITEM    = 'container-selected'
  , CONTAINER_DROP_ZONE_ACTIVE = 'container-dropZone-active';

describe('Container', function() {
  var React = require('react/addons')
    , TestUtils = React.addons.TestUtils
    , Container = require('../Container')
    , CustomTemplate = React.createClass({
        displayName: 'CustomTemplate',
        propTypes: { item: React.PropTypes.any.isRequired },
        render: function() { return <span className="customFinder">{this.props.item}</span>; }
      });

  function getItemFromContainer(container, itemId) {
    return TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[2*itemId + 1];
  }
  function getDropZone(container, itemId) {
    return TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[2*itemId];
  }

  it('should display items, by default, in a text template (span element)', function() {
    var container = TestUtils.renderIntoDocument(<Container items={randomWords} />);
    expect(container.getDOMNode().textContent).toBe(randomWords.join(''));
  });

  it('should display items with a custom template', function() {
    container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
    var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
    expect(items).toEqual(randomWords);
  });

  describe("Selecting Items", function() {
    var container, item;
    beforeEach(function() {
      container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
      item      = getItemFromContainer(container, 0);
    });

    it('highlights item as selected when clicked', function() {
      expect(item.props.className).toBe('');
      TestUtils.Simulate.click(item);
      expect(item.props.className).toBe(CONTAINER_SELECTED_ITEM);
    });

    it('does not highlight items when they are un-selected', function() {
      TestUtils.Simulate.click(item);
      TestUtils.Simulate.click(item);
      expect(item.props.className).toBe('');
    });
  });

  it('should mark items as draggable', function() {
    var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
    expect(getItemFromContainer(container, 0).getDOMNode().getAttribute('draggable')).toBeTruthy();
  });

  it('should not mark drop zones as draggable', function() {
    var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
    expect(getDropZone(container, 0).getDOMNode().getAttribute('draggable')).toBeFalsy();
  });

  describe("Drag Start", function() {
    var mockDataTransfer, container, item;
    beforeEach(function() {
      mockDataTransfer = { setData: jest.genMockFunction() }
      container        = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
      item             = getItemFromContainer(container, 0);
    })
    it('highlights item as selected when dragged', function() {
      expect(item.props.className).toBe('');
      TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
      expect(item.props.className).toBe(CONTAINER_SELECTED_ITEM);
    });
    it('shoudl keep previously selected items as selected when dragged', function() {
      TestUtils.Simulate.click(item);
      expect(item.props.className).toBe(CONTAINER_SELECTED_ITEM);
      TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
      expect(item.props.className).toBe(CONTAINER_SELECTED_ITEM);
    });
    it('should set the data transfer with the correct type and the items to being dragged', function() {
      TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
      expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple"]');
    });
    it("should put all selected items into the data transfer", function() {
      TestUtils.Simulate.click(item);
      var item2 = getItemFromContainer(container, 1);
      TestUtils.Simulate.dragStart(item2, { dataTransfer: mockDataTransfer });
      expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple","bannana"]');
    });
  });

  describe('Drag Over', function() {
    var container, item, dropZoneAbove, dropZoneBelow, mockEvent;
    beforeEach(function() {
      mockEvent     = {
        dataTransfer: { types: [CONTAINER_TYPE] },
        preventDefault: jest.genMockFunction()
      }
      container     = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
      overItem      = getItemFromContainer(container, 2)
      dropZoneAbove = getDropZone(container, 2)
      dropZoneBelow = getDropZone(container, 3)
    });
    it('shows the current dropzone when hovering over drop zone', function() {
      var dropZone = getDropZone(container, 0);
      expect(dropZone.props.className).toBe('');
      TestUtils.Simulate.dragOver(dropZone, mockEvent);
      expect(dropZone.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
      expect(mockEvent.preventDefault).toBeCalled();
    });
    it('should not activate a dropzone when the container type is wrong', function() {
      var dropZone = getDropZone(container, 0);
      mockEvent.dataTransfer.types = ['bad_type'];
      expect(dropZone.props.className).toBe('');
      TestUtils.Simulate.dragOver(dropZone, mockEvent);
      expect(dropZone.props.className).not.toBe(CONTAINER_DROP_ZONE_ACTIVE);
      expect(mockEvent.preventDefault).not.toBeCalled();
    });
    it('shows previous drop zone when hovering over top half of item', function() {
      mockEvent.clientY = 2;
      overItem.getDOMNode().offsetTop = 0;
      overItem.getDOMNode().offsetHeight = 10;

      expect(dropZoneAbove.props.className).toBe('');
      expect(dropZoneBelow.props.className).toBe('');
      TestUtils.Simulate.dragOver(overItem, mockEvent);
      expect(dropZoneAbove.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
      expect(dropZoneBelow.props.className).toBe('');
      expect(mockEvent.preventDefault).toBeCalled();
    });
    it('shows next drop zone when hovering over bottom half of item', function() {
      mockEvent.clientY = 7
      overItem.getDOMNode().offsetTop = 0;
      overItem.getDOMNode().offsetHeight = 10;

      expect(dropZoneAbove.props.className).toBe('');
      expect(dropZoneBelow.props.className).toBe('');
      TestUtils.Simulate.dragOver(overItem, mockEvent);
      expect(dropZoneAbove.props.className).toBe('');
      expect(dropZoneBelow.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
      expect(mockEvent.preventDefault).toBeCalled();
    });

    it("should clear any active drop zones when the dragged item leaves the container", function() {
      var containerElement = TestUtils.findRenderedDOMComponentWithTag(container, 'ul').getDOMNode();

      TestUtils.Simulate.dragOver(overItem, mockEvent);
      expect(TestUtils.scryRenderedDOMComponentsWithClass(container, CONTAINER_DROP_ZONE_ACTIVE).length).toBe(1);

      mockEvent.clientX = 0;
      mockEvent.clientY = 101;
      containerElement.offsetTop = containerElement.offsetLeft = 0;
      containerElement.offsetHeight = containerElement.offsetWidth = 100;

      TestUtils.Simulate.dragLeave(containerElement, mockEvent);
      expect(TestUtils.scryRenderedDOMComponentsWithClass(container, CONTAINER_DROP_ZONE_ACTIVE).length).toBe(0);
    });
  });

  describe('Drop Behavior', function() {
    beforeEach(function() {
      container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords.slice(0)} />);
      overItem  = getDropZone(container, randomWords.length)
      mockEvent = { dataTransfer: { types: [CONTAINER_TYPE] } }
    });
    it('adds dropped items to currently selected drop zone', function() {
      var randomDropWords = '["peaches", "cream"]';
      mockEvent.dataTransfer.getData = function() { return randomDropWords; };

      TestUtils.Simulate.dragOver(overItem, mockEvent);
      TestUtils.Simulate.drop(overItem, mockEvent);
      var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
      expect(items).toEqual(randomWords.concat(["peaches", "cream"]));
    });
    it('removes selected items', function() {
      var item = getItemFromContainer(container, 0);
      mockEvent.dataTransfer.dropEffect = "move";
      mockEvent.dataTransfer.setData = function() {};
      mockEvent.dataTransfer.getData = function() { return "[\"" + randomWords[0] + "\"]"; };
      TestUtils.Simulate.dragStart(item, mockEvent);
      TestUtils.Simulate.dragOver(overItem, mockEvent);
      TestUtils.Simulate.drop(overItem, mockEvent);
      TestUtils.Simulate.dragEnd(item, mockEvent);
      var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
      // array where first item is now last
      expect(items).toEqual(randomWords.slice(1).concat(randomWords[0]));
    });

    it("should hide the active drop zone after dropping", function() {
      var item = getItemFromContainer(container, 0);
      mockEvent.dataTransfer.dropEffect = "move";
      mockEvent.dataTransfer.setData = function() {};
      mockEvent.dataTransfer.getData = function() { return "[\"" + randomWords[0] + "\"]"; };
      TestUtils.Simulate.dragStart(item, mockEvent);
      TestUtils.Simulate.dragOver(overItem, mockEvent);
      TestUtils.Simulate.drop(overItem, mockEvent);
      TestUtils.Simulate.dragEnd(item, mockEvent);

      var activeDropZones = TestUtils.scryRenderedDOMComponentsWithClass(container, CONTAINER_SELECTED_ITEM);
      expect(activeDropZones.length).toBe(0);
    });
  });

})