var React       = require('react')
  , merge       = require('./support/ObjectMerge')

var ALLOWED_DROP_EFFECT = "move"
  , NO_DROPZONE = null
  , BLANK_FUNCTION = function() {};;

// TODO - make this a require or a prop...
var styles = {
  container: {
    maxWidth: 550,
    background: '#cdc',
    border: '1px solid #777',
    listStyle: 'none',
    margin: 0,
    padding: 2
  },
  item: {
    backgroundColor: '#df90df',
    margin: 3,
    padding: 3
  },
  selectedItem: {
    backgroundColor: '#333'
  },
  dropZone: {
    height: 2,
    backgroundColor: 'transparent',
    transition: 'height 400ms'
  },
  activeDropZone: {
    height: 15,
    background: '#fff',
    transition: 'height 150ms'
  }
}

var TextTemplate = React.createClass({ displayName: "DraggableListView-TextTemplate",
  propTypes: {
    item: React.PropTypes.any.isRequired
  },
  render: function() {
    return <span>{this.props.item}</span>;
  }
});

var DraggableListView = React.createClass({
  displayName: "DraggableListView",
  propTypes: {
    containerDropType:  React.PropTypes.string.isRequired,
    itemTemplate:       React.PropTypes.func.isRequired,
    items:              React.PropTypes.array,
    selected:           React.PropTypes.arrayOf(React.PropTypes.number),
    activeDropZone:     React.PropTypes.number,    // the currently active drop zone (default: -1)
    onClickOnItem:      React.PropTypes.func,       // onClickOnItem(itemId) where itemId is the item that was clicked
    onDragStart:        React.PropTypes.func,       // onDragStart(itemId)   where itemId is the item that initiated the drag
    onDropZoneActivate: React.PropTypes.func,       // onDropZoneActivate(dropZoneId) where dropZoneId is the new active dropzone id
    onItemsAdded:       React.PropTypes.func,       // onItemsAdded(items) where items is an array of added items
    onRemoveSelected:   React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      containerDropType: 'custom_container_type',
      itemTemplate: TextTemplate,
      items: [],
      selected: [],
      activeDropZone:     NO_DROPZONE,
      onClickOnItem:      BLANK_FUNCTION,
      onDragStart:        BLANK_FUNCTION,
      onDropZoneActivate: BLANK_FUNCTION,
      onItemsAdded:       BLANK_FUNCTION,
      onRemoveSelected:   BLANK_FUNCTION
    };
  },
  getInitialState: function() {
    return {};
  },
  getSelectedItems: function(optional) {
    var selected = this.props.selected;
    if(selected.indexOf(optional) === -1) { selected.push(optional); }
    return selected.sort().map(function(itemIndex) { return this.props.items[itemIndex]; }, this);
  },
  containerAcceptsDropData: function(transferTypes) {
    return Array.prototype.indexOf.call(transferTypes, this.props.containerDropType) !== -1;
  },
  onClickOnListItem: function(e) {
    var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
    this.props.onClickOnItem(selectedIndex);
  },
  onDragStart: function(e) {
    var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
    e.dataTransfer.effectAllowed = ALLOWED_DROP_EFFECT;
    e.dataTransfer.setData(this.props.containerDropType, JSON.stringify(this.getSelectedItems(selectedIndex)));
    this.props.onDragStart(selectedIndex);
  },
  onDragEnd: function(e) {
    if(e.dataTransfer.dropEffect === ALLOWED_DROP_EFFECT) {
      this.props.onRemoveSelected();
    }
  },
  onDrop: function(e) {
    if(this.props.activeDropZone !== NO_DROPZONE) {
      this.props.onItemsAdded(JSON.parse(e.dataTransfer.getData(this.props.containerDropType)));
    }
  },
  onDragOverItem: function(e) {
    if(this.containerAcceptsDropData(e.dataTransfer.types)) {
      e.preventDefault();
      var dropZoneId = parseInt(e.currentTarget.getAttribute('data-key'));
      if(e.clientY - e.currentTarget.offsetTop > e.currentTarget.offsetHeight / 2) { dropZoneId++; }
      if(dropZoneId !== this.props.activeDropZone) {
        this.props.onDropZoneActivate(dropZoneId);
      }
    }
  },
  onDragOverDropZone: function(e) {
    if(this.containerAcceptsDropData(e.dataTransfer.types)) {
      e.preventDefault();
      var dropZoneId = parseInt(e.currentTarget.getAttribute('data-key'));
      if(dropZoneId !== this.props.activeDropZone) {
        this.props.onDropZoneActivate(dropZoneId);
      }
    }
  },
  onDragLeaveContainer: function(e) {
    var x = e.clientX
      , y = e.clientY
      , top    = e.currentTarget.offsetTop
      , bottom = top + e.currentTarget.offsetHeight
      , left   = e.currentTarget.offsetLeft
      , right  = left + e.currentTarget.offsetWidth;
    if(y <= top || y >= bottom || x <= left || x >= right) {
      this.props.onDropZoneActivate(NO_DROPZONE);
    }
  },
  renderDropZone: function(index) {
    var classes = this.props.activeDropZone === index ? 'container-dropZone-active' : '';
    return <li key={"dropzone-" + index}
               data-key={index}
               className={classes}
               style={merge(styles.dropZone, this.props.activeDropZone === index && styles.activeDropZone)}
               onDragOver={this.onDragOverDropZone}></li>;
  },
  renderListElement: function(item, key) {
    var classes = this.props.selected.indexOf(key) > -1 ? 'container-selected' : '';
    return(
      <li key={key}
          data-key={key}
          className={classes}
          style={merge(styles.item, this.props.selected.indexOf(key) > -1 && styles.selectedItem )}
          onClick={this.onClickOnListItem}
          draggable  ={true}
          onDragOver ={this.onDragOverItem}
          onDragStart={this.onDragStart}>{item}</li>
    );
  },
  renderListElements: function() {
    var items = [];
    for(var i=0, length=this.props.items.length;i<length;i++) {
      items.push(this.renderDropZone(i));
      // TODO - see if there is a performance hit when recreating these elements
      //        if there is, create a cache of elements in the state when the items are updated
      items.push(this.renderListElement(React.createElement(this.props.itemTemplate, { item: this.props.items[i] }), i));
    }
    items.push(this.renderDropZone(i));
    return items;
  },
  render: function() {
    var items = this.renderListElements();
    return (
      <ul ref="container"
          onDrop={this.onDrop}
          onDragLeave={this.onDragLeaveContainer}
          onDragEnd  ={this.onDragEnd}
          style={styles.container}>{items}</ul>
    );
  }
});

module.exports = DraggableListView;