var React       = require('react')
  , merge       = require('./support/ObjectMerge')
  , Set         = require('./support/SimpleSet');

var DRAG_DROP_CONTENT_TYPE = "custom_container_type"
  , ALLOWED_DROP_EFFECT = "move"
  , HOVER_KEY = -1
  , NO_HOVER  = -1;

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

var TextTemplate = React.createClass({ displayName: "Container-TextTemplate",
  propTypes: {
    item: React.PropTypes.any.isRequired
  },
  render: function() {
    return <span>{this.props.item}</span>;
  }
});

var Container = React.createClass({ displayName: "Container",
  propTypes: {
    items: React.PropTypes.array,
    itemTemplate: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return {
      items: [],
      itemTemplate: TextTemplate
    };
  },
  getInitialState: function() {
    return {
      items: this.props.items,
      selected:  new Set(),
      hoverOver: NO_HOVER,
      dragActive: false
    };
  },
  getSelectedItems: function() {
    return this.state.selected.toArray().sort().map(function(itemIndex) { return this.state.items[itemIndex]; }, this);
  },
  removeSelectedItems: function() {
    return this.state.selected.toArray().sort().reverse().map(function(itemId) { return this.state.items.splice(itemId, 1); }, this);
  },
  toggleSelectedItem: function(selectedIndex) {
    return this.state.selected.has(selectedIndex) ? this.state.selected.delete(selectedIndex) : this.state.selected.add(selectedIndex);
  },
  containerAcceptsDropData: function(transferTypes) {
    // allow drag between custom containers (note: eventually will need to implement something based on the items themselves)
    return Array.prototype.indexOf.call(transferTypes, DRAG_DROP_CONTENT_TYPE) !== -1;
  },
  onClickOnListItem: function(e) {
    var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
    this.toggleSelectedItem(selectedIndex);
    this.setState({ selected: this.state.selected });
  },
  onDragStart: function(e) {
    var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
    this.state.selected.add(selectedIndex);
    e.dataTransfer.effectAllowed = ALLOWED_DROP_EFFECT;
    e.dataTransfer.setData(DRAG_DROP_CONTENT_TYPE, JSON.stringify(this.getSelectedItems()));
    this.setState({ selected: this.state.selected, dragActive: true });
  },
  onDragEnd: function(e) {
    if(e.dataTransfer.dropEffect === ALLOWED_DROP_EFFECT) {
      this.removeSelectedItems();
      this.state.selected.clear();
      this.setState({
        items:    this.state.items,
        selected: this.state.selected,
        hoverOver: NO_HOVER,
        dragActive: false
      });
      return;
    }
    if(this.state.hoverOver !== NO_HOVER || this.state.selected.size !== 0) {
      this.state.selected.clear();
      this.setState({ hoverOver: NO_HOVER, selected: this.state.selected, dragActive: false });
    }
  },
  correctSelectedAfterDrop: function(droppedItems) {
    if(this.state.dragActive) {
      // need to bump selected pointers to point account for data added by onDrop
      var bumpSet = []
        , bumpBy  = droppedItems.length;
      this.state.selected.forEach(function(itemId) { if(itemId >= this.state.hoverOver) { bumpSet.push(itemId); } }, this);
      bumpSet.forEach(function(itemId) { this.state.selected.delete(itemId); }, this);
      bumpSet.forEach(function(itemId) { this.state.selected.add(itemId + bumpBy); }, this);
    }
  },
  onDrop: function(e) {
    var data = JSON.parse(e.dataTransfer.getData(DRAG_DROP_CONTENT_TYPE));
    if(this.state.hoverOver !== NO_HOVER) {
      Array.prototype.splice.apply(this.state.items, [this.state.hoverOver, 0].concat(data));
      this.correctSelectedAfterDrop(data);
      this.setState({
        items: this.state.items,
        selected: this.state.selected,
        hoverOver: NO_HOVER
      });
    }
  },
  onDragOverItem: function(e) {
    if(!this.containerAcceptsDropData(e.dataTransfer.types)) { return; } 
    e.preventDefault();
    var over = parseInt(e.currentTarget.getAttribute('data-key'));
    if(e.clientY - e.currentTarget.offsetTop > e.currentTarget.offsetHeight / 2) { over++; }
    if(over !== this.state.hoverOver) { this.setState({ hoverOver: over }); }
  },
  onDragOverDropZone: function(e) {
    if(!this.containerAcceptsDropData(e.dataTransfer.types)) { return; }
    e.preventDefault();
    var dropZoneId = parseInt(e.currentTarget.getAttribute('data-key'));
    if(dropZoneId !== this.state.hoverOver) { this.setState({ hoverOver: dropZoneId }); }
  },
  onDragLeaveContainer: function(e) {
    var x = e.clientX
      , y = e.clientY
      , top    = e.currentTarget.offsetTop
      , bottom = top + e.currentTarget.offsetHeight
      , left   = e.currentTarget.offsetLeft
      , right  = left + e.currentTarget.offsetWidth;
    if(y <= top || y >= bottom || x <= left || x >= right) { this.resetHover(); }
  },
  resetHover: function(e) {
    if(this.state.hoverOver !== NO_HOVER) { this.setState({ hoverOver: NO_HOVER }); }
  },
  renderDropZone: function(index) {
    var classes = this.state.hoverOver === index ? 'container-dropZone-active' : '';
    return <li key={"dropzone-" + index}
               data-key={index}
               className={classes}
               style={merge(styles.dropZone, this.state.hoverOver === index && styles.activeDropZone)}
               onDragOver={this.onDragOverDropZone}></li>;
  },
  renderListElements: function() {
    var items = [];
    for(var i=0, length=this.state.items.length;i<length;i++) {
      items.push(this.renderDropZone(i));
      // TODO - see if there is a performance hit when recreating these elements
      //        if there is, create a cache of elements in the state when the items are updated
      items.push(this.renderListElement(React.createElement(this.props.itemTemplate, { item: this.state.items[i] }), i));
    }
    items.push(this.renderDropZone(i));
    return items;
  },
  renderListElement: function(item, key) {
    var classes = this.state.selected.has(key) ? 'container-selected' : '';
    return(
      <li key={key}
          data-key={key}
          className={classes}
          style={merge(styles.item, this.state.selected.has(key) && styles.selectedItem )}
          onClick={this.onClickOnListItem}
          draggable  ={true}
          onDragOver ={this.onDragOverItem}
          onDragStart={this.onDragStart}
          onDragEnd  ={this.onDragEnd}>{item}</li>
    );
  },
  render: function() {
    var items = this.renderListElements();
    return (
      <ul ref="container"
          onDrop={this.onDrop}
          onDragLeave={this.onDragLeaveContainer}
          style={styles.container}>{items}</ul>
    );
  }
});

module.exports = Container;