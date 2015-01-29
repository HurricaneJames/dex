var React     = require('react')
  , Immutable = require('immutable')
  , merge     = require('./support/ObjectMerge')
  , Set       = Immutable.Set
  , List      = Immutable.List
  , DraggableListView = require('./DraggableListView')
  , ImmutableRenderMixin = require('react-immutable-render-mixin');

var DRAG_DROP_CONTENT_TYPE = "custom_container_type"
  , ALLOWED_DROP_EFFECT = "move"
  , NONE_ACTIVE = -1;

var toggleSelectedItem = function(selectedIndex) {
      return this.state.selected.has(selectedIndex) ? this.state.selected.delete(selectedIndex) : this.state.selected.add(selectedIndex);
    }
  , correctSelectedIndicesAfterAddingItems = function(droppedItems) {
      if(this.state.activeDropZone !== NONE_ACTIVE) {
        // need to bump selected pointers to point account for data added by onDrop
        var selected = this.state.selected.asMutable()
          , bumpSet = selected.filter(function(itemId) { return itemId >= this.state.activeDropZone; }, this)
          , bumpBy  = droppedItems.length;
        bumpSet.forEach(function(itemId) { selected.delete(itemId); }, this);
        bumpSet.forEach(function(itemId) { selected.add(itemId + bumpBy); }, this);
        return selected.asImmutable();
      }
    }
  , onClickOnItem = function(itemId) {
      this.setState({ selected: toggleSelectedItem.call(this, itemId) });
    }
  , onDragStart = function(itemId) {
      this.setState({ selected: this.state.selected.add(itemId) });
    }
  , onDropZoneActivate = function(dropZoneId) {
      this.setState({ activeDropZone: dropZoneId });
    }
  , onItemsAdded = function(items) {
      this.setState({
        items: this.state.items.splice.apply(this.state.items, [this.state.activeDropZone, 0].concat(items)),
        selected: correctSelectedIndicesAfterAddingItems.call(this, items),
        activeDropZone: NONE_ACTIVE
      });
    }
  , onRemoveSelected = function() {
      this.setState({ 
        items: this.state.items.filterNot(function(item, index) { return this.state.selected.has(index); }, this),
        selected: this.state.selected.clear()
      });
    };

var ContainerMixin = {
  mixins: [ImmutableRenderMixin],
  propTypes: {
    items: React.PropTypes.array,
    itemTemplate: React.PropTypes.func,
  },
  getDefaultProps: function() {
    return { items: [] };
  },
  getInitialState: function() {
    return {
      items: new List(this.props.items),
      selected: new Set(),
      activeDropZone: NONE_ACTIVE
    };
  },
  renderContainer: function() {
    return (
      <DraggableListView
        containerDropType={"custom_container_type"}
        itemTemplate={this.props.itemTemplate}
        items={this.state.items.toArray()}
        selected={this.state.selected.toArray()}
        activeDropZone={this.state.activeDropZone}
        onClickOnItem={onClickOnItem.bind(this)}
        onDragStart={onDragStart.bind(this)}
        onDropZoneActivate={onDropZoneActivate.bind(this)}
        onItemsAdded={onItemsAdded.bind(this)}
        onRemoveSelected={onRemoveSelected.bind(this)} />
    );
  }
};

module.exports = ContainerMixin;