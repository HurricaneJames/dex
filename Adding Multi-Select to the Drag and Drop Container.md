Adding Multi-Select to the Drag and Drop Container
==================================================

In our [last article](https://reactjsnews.com/testing-complex-components-in-react/), we added some [Jest](https://facebook.github.io/jest/) based tests to our Container. I highly recommend reading that article and the preceding articles, especially the article on [Complex Drag and Drop Lists Using React](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/). We will be building on both of these articles for this installment.

For reference, the series to far is:

- [Adding Multi-Select to the Drag and Drop Container](https://reactjsnews.com/testing-complex-components-in-react/) (this article)
- [Testing Complex Components in React.js](https://reactjsnews.com/testing-complex-components-in-react/)
- [Complex Drag and Drop Lists Using React](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/)
- [Setting up Rails for React and Jest](https://reactjsnews.com/setting-up-rails-for-react-and-jest/)


Starting with Tests
-------------------
To expand on the last article, we will be using [TDD](http://en.wikipedia.org/wiki/Test-driven_development) to enhance our Container. The new requirements are:

- clicking on an item should mark it as selected
- clicking on a selected item should mark it as not selected
- it should still mark an item as selected when dragging it with no click required
- it should not mark a previously selected item as not selected when dragging it
- it should add all of the items to the datatransfer
- it should add all of the dragged items to the container
- it should remove all of the selected items from the original container

With these requirements in hand, let's get started.

Selecting/De-Selecting Items
----------------------------

Since we are using TDD now, we will start with the tests. First up, clicking on an item.

    describe("Selecting Items", function() {
      var container, item;
      beforeEach(function() {
        container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
        item      = getItemFromContainer(container, 0);
      });

      it('highlights item as selected when clicked', function() {
        expect(item.props.className).toBe('');
        TestUtils.Simulate.click(item);
        expect(item.props.className).toBe('container-selected');
      });

      it('does not highlight items when they are un-selected', function() {
        TestUtils.Simulate.click(item);
        TestUtils.Simulate.click(item);
        expect(item.props.className).toBe('');
      });
    });

These are both fairly simple to understand and appropriately red when running `npm test Container`. Next up, dragging. We already test that items are selected when dragged. But we should make sure that selected items are no un-selected when dragged.

    describe("Drag Start", function() {
      // ...
      it('shoudl keep previously selected items as selected when dragged', function() {
        TestUtils.Simulate.click(item);
        expect(item.props.className).toBe('container-selected');
        TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
        expect(item.props.className).toBe('container-selected');
      });
      // ...
    });

This test also fails because we do not yet handle the click event. So let's turn these tests green.

### Set

The basic data structure for a collection of unique items is a Set. It just so happens that ECMAScript 6 has such a [Set data structure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set). Even better, there is a polyfill availabe as a Node package, [es6-set](https://www.npmjs.com/package/es6-set). So, up at the top of `Container.jsx`, we should be able to add `var Set = require('es6-set');` and include 'es6-set' in our `package.json` file. Right? Wrong!

It turns out that at least the 'es6-set' package is extremely incompatable with Jest. Just including the library, without even instantiating a single Set, causes Jest to crash and burn. After hours of debugging, no solution was in sight. It seems to be an issue with node packages included by other node packages.

The solution we ultimately decided upon was the creation of a SimpleSet. SimpleSet uses the an almost native ECMAScript 6 Set object when available and a simple subset when not. The implementation is available on GitHub: [SimpleSet](https://github.com/HurricaneJames/dex/blob/master/app/assets/javascripts/components/support/SimpleSet.js) and [SimpleSet-test](https://github.com/HurricaneJames/dex/blob/master/app/assets/javascripts/components/__tests__/support/SimpleSet-test.js). We did add one function that we consider missing from the ECMAScript 6 spec, toArray(). Set is really annoying without a simple, inline way to convert it to an array. Given that `Array.from()` is only supported by FireFox at the moment, we do not consider that an acceptable solution.

Now that we have a SimpleSet implementation, we include it by adding `var Set = require('./support/SimpleSet');` at the top of our `Container.jsx` file. We also need to include `"support/"` in the `unmockedModulePathPatterns` section of the package.json, otherwise Jest will auto-mock the SimpleSet module when it is required.


### Adding Multi-Select Support

Now that we have a Set implementation, we need to replace the old `state.selected` with the new Set. 

- `NONE_SELECTED` - delete this variable completely
- `getInitialState()` - replace `NONE_SELECTED` with `new Set()`
- `renderListElement()` - add two new props to the `<li />` component
    - `onClick={this.onClickOnListItem}`
- `onClickOnListItem()` - new function

        onClickOnListItem: function(e) {
          var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
          this.toggleSelectedItem(selectedIndex);
          this.setState({ selected: this.state.selected });
        },

    Notice that we are using `getAttribute('data-key')` because Jest does not support the `dataset` property of elements.

- `toggleSelectedItem()` - new function

        toggleSelectedItem: function(selectedIndex) {
          return this.state.selected.has(selectedIndex) ? this.state.selected.delete(selectedIndex) : this.state.selected.add(selectedIndex);
        },

With these changes, the tests for selecting items should go green.

Starting Drag Operations
------------------------

Now that we have item selection working, we need to turn our attention to requirements for when dragging operations begin.

### Tests

Again, we are going to start with our tests.

- it should still mark an item as selected when dragging it with no click required (existing test, no changes required)

- it should not mark a previously selected item as not selected when dragging it

        it('should keep previously selected items as selected when dragged', function() {
          TestUtils.Simulate.click(item);
          expect(item.props.className).toBe('container-selected');
          TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
          expect(item.props.className).toBe('container-selected');
        });


- it should add all of the items to the datatransfer

        it("should put all selected items into the data transfer", function() {
          TestUtils.Simulate.click(item);
          var item2 = getItemFromContainer(container, 1);
          TestUtils.Simulate.dragStart(item2, { dataTransfer: mockDataTransfer });
          expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple","bannana"]');
        });

These tests depend on a beforeEach that sets

        mockDataTransfer = { setData: jest.genMockFunction() }
        container        = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
        item             = getItemFromContainer(container, 0);

Running the tests, as expected, produces nice red responses.

### Making Drag Start Operations Green

Now we need to turn that red to green. Looking at our first set of errors leads to `onDragStart`. It is doing many bad things, from trying to set `selected = selectedIndex` to not including all of the items. So we can start by changing that function.

    onDragStart: function(e) {
      var selectedIndex = parseInt(e.currentTarget.getAttribute('data-key'));
      this.state.selected.add(selectedIndex);
      e.dataTransfer.effectAllowed = ALLOWED_DROP_EFFECT;
      e.dataTransfer.setData(DRAG_DROP_CONTENT_TYPE, JSON.stringify(this.getSelectedItems()));
      this.setState({ selected: this.state.selected });
    },

First, we add the selected index to the selected set. We still limit the drop effect, but now we stringify all the selected items with the help of a `getSelectedItems()` function. Finally we set the new state.

`getSelectedItems()` is fairly simple. It just copies out the selected items into an array, sorts them, and maps the resulting ids to the actual items.

    getSelectedItems: function() {
      return this.state.selected.toArray().sort().map(function(itemIndex) { return this.state.items[itemIndex]; }, this);
    },

Now the tests should all run green.

Drop Operations
---------------

The drag over operations did not change, but we do need to address the differences in drop operations. Our requirements translate fairly well to tests that are already in our spec, they just need to be updated.

### It Should Add All of the Dragged Items to the Container

Starting with our test:

    it('adds dropped items to currently selected drop zone', function() {
        var randomDropWords = '["peaches", "cream"]';
        mockEvent.dataTransfer.getData = function() { return randomDropWords; };

        TestUtils.Simulate.dragOver(overItem, mockEvent);
        TestUtils.Simulate.drop(overItem, mockEvent);
        var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
        expect(items).toEqual(randomWords.concat(["peaches", "cream"]));
    });

In the original test we only added "peaches". This time we are adding `["peaches", "cream"]`. The only other thing that changes is we expect items to equal a slightly longer list.

The changes to turn red to green are fairly straight forward. Starting with onDrop.

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

First we change the splice function to add in all of the data with a little trick. Instead of calling `this.state.items` directly, we call `Array.prototype.splice.apply`. Then we pass in `this.state.items` as the `this` argument for the function and an array for our parameters. If you are unfamiliar with this trick, I highly recommend reading Josh Resig' and Bear Bibeault's excellent book "[Secrets of the JavaScript Ninja](http://www.amazon.com/Secrets-JavaScript-Ninja-John-Resig/dp/193398869X/)."

We setState as before. For now, `correctSelectedAfterDrop = function() {}`. Run the tests and green, well at least this test went green. We will need to update the `correctSelectedAfterDrop` to make the next test pass.

### It Should Remove All of the Selected Items from the Original Container

The previous test, `it('removes selected items', function() {...}`, should still work, but something is wrong with removing the selected items. Looking at `onDragEnd`, it obviously needs some changes. It is still splicing a single item, based on a variable that is not a number anymore, and it is trying to set selected to NONE_SELECTED, which does not exist. Let's take a stab a rewriting this.

*The astute reader will also notice that we made a faux pas in our previous version in that we are setting state variables directly. We are going to clean that up now too.*

    onDragEnd: function(e) {
      if(e.dataTransfer.dropEffect === ALLOWED_DROP_EFFECT) {
        this.removeSelectedItems();
        this.state.selected.clear();
        this.setState({
          items:    this.state.items,
          selected: this.state.selected,
          hoverOver: NO_HOVER
        });
        return;
      }
      if(this.state.hoverOver !== NO_HOVER || this.state.selected.size !== 0) {
        this.state.selected.clear();
        this.setState({ hoverOver: NO_HOVER, selected: this.state.selected });
      }
    },

Now we have a separate function for removing selected items, and we properly clear the set. We set the state correctly. We also fixed the second if statement to properly clear and set the state when the drag operation was cancelled. Ignore

The new function to remove selected items is a little more complex than the original splice.

    removeSelectedItems: function() {
      return this.state.selected.toArray().sort().reverse().map(function(itemId) { return this.state.items.splice(itemId, 1); }, this);
    },

We start by converting the selected set into an array and sorting it. We then reverse that sort so we start from the last selected item first, otherwise we would be throwing off the indicies with every item removed. The reverse is not a problem with the number of items we have selected, but if ever ever becomes a problem, just remove the `reverse().map()` and replace with a for loop iterating from length down to zero. Why not do that now, becuase that would be "premature optimization." As Donald Knuth once said "Premature optimization is the root of all evil (or at least most of it) in programming."

We could run our test now, but we are forgetting that we took a pass on `correctSelectedAfterDrop()` in the `onDrop()` function. We need to implement that for real now. Feel free to run the tests, but it will still be red.

    correctSelectedAfterDrop: function(droppedItems) {
      if(this.state.dragActive) {
        var bumpSet = []
          , bumpBy  = droppedItems.length;
        this.state.selected.forEach(function(itemId) { if(itemId >= this.state.hoverOver) { bumpSet.push(itemId); } }, this);
        bumpSet.forEach(function(itemId) { this.state.selected.delete(itemId); }, this);
        bumpSet.forEach(function(itemId) { this.state.selected.add(itemId + bumpBy); }, this);
      }
    },

First we start by creating a bumpSet. This is an array of selected indicies that are greater than or equal to the dropZone index, `hoverOver`. Then we remove each of these indicies from the selected set. Finally, we add them back, bumped by the number of items dropped into the container. 

However, we only want to do this if we dropped the items into the container from which they were extracted. So we add a `dragActive` state property. This property is only set to true by `onDragStart`, which is only called by the original container. `onDrop` is only called on the destination container. So if we have a drop event and dragActive is true, then we know we need to modify the selected item indicies. To make this work we need to ammend the state in four places over add three functions.

- `getInitialState` - needs to set `dragActive: false`
- `onDragStart` - needs to amend the `setState` line to `this.setState({ selected: this.state.selected, dragActive: true });`
- `onDragEnd` - we need to add `dragActive: false` to both of the `setState` calls

Now, when we run our tests, we see all green. And when we fire up our browser, it works as expected.
