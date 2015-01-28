// not really a flux container, just trying to make this component stateless

jest.dontMock('../DraggableListContainer');

var randomWords = ["apple", "bannana", "watermelon", "oranges", "ice cream"]
  , CONTAINER_TYPE = 'custom_container_type'
  , CONTAINER_DROP_ZONE_ACTIVE = 'container-dropZone-active';

describe('DraggableListContainer', function() {
  var React = require('react/addons')
    , TestUtils = React.addons.TestUtils
    , Container = require('../DraggableListContainer')
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
    it("should call the onClickOnItem when an item is clicked", function() {
      var mockOnClickOnItem = jest.genMockFunction()
        , container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} onClickOnItem={mockOnClickOnItem} /> );
      TestUtils.Simulate.click(getItemFromContainer(container, 0))
      expect(mockOnClickOnItem).toBeCalledWith(0);
    });

    it('should mark the item <li> element with the "container-selected" className when that item is in the selected prop', function() {
      var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} selected={[0]} /> );
      expect(getItemFromContainer(container, 0).props.className).toBe('container-selected');
    });

    it('does not highlight items when they are un-selected', function() {
      var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} /> );
      expect(getItemFromContainer(container, 0).props.className).toBe('');
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
    var mockDataTransfer, mockOnDragStart, container, item;
    beforeEach(function() {
      mockDataTransfer = { setData: jest.genMockFunction() }
      mockOnDragStart  = jest.genMockFunction();
      container        = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} onDragStart={mockOnDragStart} />)
      item             = getItemFromContainer(container, 0);
    })
    it('should call onItemDragStart when an item dragging is started', function() {
      TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
      expect(mockOnDragStart).toBeCalledWith(0);
    });
    it('should set the data transfer with the correct type and the items to being dragged', function() {
      TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
      expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple"]');
    });
    it("should put all selected items into the data transfer", function() {
      container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} selected={[0]} onDragStart={mockOnDragStart} />)
      var item2 = getItemFromContainer(container, 1);
      TestUtils.Simulate.dragStart(item2, { dataTransfer: mockDataTransfer });
      expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple","bannana"]');
    });
  });

  describe('Drag Over', function() {
    var container, item, dropZoneAbove, dropZoneBelow, mockEvent, mockOnDropZoneActivate;
    beforeEach(function() {
      mockEvent     = {
        dataTransfer: { types: [CONTAINER_TYPE] },
        preventDefault: jest.genMockFunction()
      }
      mockOnDropZoneActivate = jest.genMockFunction();
      container     = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} onDropZoneActivate={mockOnDropZoneActivate} />);
      overItem      = getItemFromContainer(container, 2)
      dropZoneAbove = getDropZone(container, 2)
      dropZoneBelow = getDropZone(container, 3)
    });
    it('should mark the active drop zone with active className prop when activeDropZone prop is provided', function() {
      container    = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} activeDropZone={0} />);
      var dropZone = getDropZone(container, 0);
      expect(getDropZone(container, 0).props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
      expect(getDropZone(container, 1).props.className).not.toBe(CONTAINER_DROP_ZONE_ACTIVE);
    });
    it('should call onDropZoneActivate when dragging over a drop zone', function() {
      var dropZone = getDropZone(container, 0);
      TestUtils.Simulate.dragOver(dropZone, mockEvent);
      expect(mockOnDropZoneActivate).toBeCalledWith(0);
      expect(mockEvent.preventDefault).toBeCalled();
    });
    it('should call onDropZoneActivate when dragging over a drop zone', function() {
      var dropZone = getDropZone(container, 0);
      mockEvent.dataTransfer.types = ['bad_type'];
      TestUtils.Simulate.dragOver(dropZone, mockEvent);
      expect(mockOnDropZoneActivate).not.toBeCalled();
      expect(mockEvent.preventDefault).not.toBeCalled();
    });
    it('should call onDropZoneActivate with the previous drop zone when hovering over top half of item', function() {
      mockEvent.clientY = 2;
      overItem.getDOMNode().offsetTop = 0;
      overItem.getDOMNode().offsetHeight = 10;

      TestUtils.Simulate.dragOver(overItem, mockEvent);
      expect(mockOnDropZoneActivate).toBeCalledWith(2);
      expect(mockEvent.preventDefault).toBeCalled();
    });
    it('should call onDropZoneActivate with the next drop zone when hovering over bottom half of item', function() {
      mockEvent.clientY = 7
      overItem.getDOMNode().offsetTop = 0;
      overItem.getDOMNode().offsetHeight = 10;

      TestUtils.Simulate.dragOver(overItem, mockEvent);
      expect(mockOnDropZoneActivate).toBeCalledWith(3);
      expect(mockEvent.preventDefault).toBeCalled();
    });

    it("should call onDropZoneActivate with null when the dragged item leaves the container", function() {
      container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} activeDropZone={0} onDropZoneActivate={mockOnDropZoneActivate} />);
      var containerElement = TestUtils.findRenderedDOMComponentWithTag(container, 'ul').getDOMNode();

      expect(TestUtils.scryRenderedDOMComponentsWithClass(container, CONTAINER_DROP_ZONE_ACTIVE).length).toBe(1);

      mockEvent.clientX = 0;
      mockEvent.clientY = 101;
      containerElement.offsetTop = containerElement.offsetLeft = 0;
      containerElement.offsetHeight = containerElement.offsetWidth = 100;

      TestUtils.Simulate.dragLeave(containerElement, mockEvent);
      expect(mockOnDropZoneActivate).toBeCalledWith(null);
    });
  });

  describe('Drop Behavior', function() {
    it('should call onItemsAdded when items are dropped on the container', function() {
      var activeDropZone = randomWords.length
        , randomDropWords = '["peaches", "cream"]'
        , mockOnItemsAdded = jest.genMockFunction()
        , container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords.slice(0)} activeDropZone={activeDropZone} onItemsAdded={mockOnItemsAdded} />)
        , mockEvent = {
          dataTransfer: {
            types: [CONTAINER_TYPE],
            getData: function() { return randomDropWords; }
          }
        }
      TestUtils.Simulate.drop(TestUtils.findRenderedDOMComponentWithTag(container, 'ul'), mockEvent);
      expect(mockOnItemsAdded).toBeCalledWith(['peaches', 'cream']);
    });
    it('should call onItemsRemoved when the dragEnd event is fired on the original container', function() {
      var mockOnRemoveSelected = jest.genMockFunction()
        , container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords.slice(0)} onRemoveSelected={mockOnRemoveSelected} />)
        , mockEvent = { dataTransfer: { dropEffect: 'move' } }
        , item = getItemFromContainer(container, 0);

      TestUtils.Simulate.dragEnd(TestUtils.findRenderedDOMComponentWithTag(container, 'ul'), mockEvent);
      expect(mockOnRemoveSelected).toBeCalled();
    });
    it('should not call onRemoveSelected when the dragEnd event is fired without a drop', function() {
      var mockOnRemoveSelected = jest.genMockFunction()
        , container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords.slice(0)} onRemoveSelected={mockOnRemoveSelected} />)
        , mockEvent = { dataTransfer: { } }
        , item = getItemFromContainer(container, 0);

      TestUtils.Simulate.dragEnd(TestUtils.findRenderedDOMComponentWithTag(container, 'ul'), mockEvent);
      expect(mockOnRemoveSelected).not.toBeCalled();      
    });
  });
})