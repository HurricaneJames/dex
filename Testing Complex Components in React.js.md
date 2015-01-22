Testing Complex Components in React.js
======================================
Welcome back! [Last time](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/) we left off with a nice little Container component that allowed dragging and dropping items both internally and between components. However, despite having the ability with our [setup](https://reactjsnews.com/setting-up-rails-for-react-and-jest/), we did not write a single test.

Generally speaking, I believe in [TDD](http://en.wikipedia.org/wiki/Test-driven_development). It improves both design and maintainability. However, a lot of projects, like our Container, were developed without tests. In those cases, it is often best to start by building tests around what is there then enhancing with TDD. And that is exactly what we are going to do in this article.

Also, as a general rule, we should attempt to do [black-box testing](http://en.wikipedia.org/wiki/Black-box_testing) whenever possible. Put in simple terms, it means we should not need to know the internals of the function we are testing. This helps make our tests less fragile when refactoring code.

Basic Setup
-----------
This article picks up where ["Complex Drag and Drop Lists Using React"](https://reactjsnews.com/complex-drag-and-drop-lists-using-react/) left off. It is recommended reading prior to this article, but not absolutely required. The code for that article is available on GitHub in the [Dex v1.0 tag](https://github.com/HurricaneJames/dex/tree/v1.0). The code for this article is available in the [Dex v2.0 tag](https://github.com/HurricaneJames/dex/tree/v2.0).

This setup uses JEST for testing. All tests are located in the `app/assets/javascripts/components/__tests__/` directory. The test file is named `[Component]-test.jsx`. Tests are run from the command line via `npm test` or `npm test [Component]`. So, the tests for Container will be in `app/assets/javascripts/components/__tests__/Container-test.jsx`, and can run it with `npm test Container`.

Jest and React Test Utilities
-----------------------------
[Jest](https://facebook.github.io/jest/) is the testing engine designed by Facebook to go with React. It is based on Jasmine, so very familiar to anybody who has done Jasmine tests before. However, unlike Jasmine, Jest is run from the command line and backed by a fake DOM. This makes integration with continuous integration systems easier. It also means Jest can spin up multiple processes and run the tests faster. But Jest's biggest advantage is automocking. Modules imported via CommonJS `require` are automatically mocked.

React provides some nice [testing utilities](http://facebook.github.io/react/docs/test-utils.html) via `React.addons.TestUtils` as well. Be sure to read through these as the `Simulate` and find/scry method will be used a lot.

Although billed as "Painless JavaScript Unit Testing", Jest is frequently a pain. Throughout this article, I will point out some of places that Jest complicated our lives and made us write code just for testing. That said, it is a lot better than it could have been and probably worth the effort.

Container Testing
-----------------
First, create a new file, `app/assets/javascripts/components/__tests__/Container-test.jsx`. This is where all of our tests will go. Then we need to tell Jest not to mock the `Container` module that we want to test. Finally, we will use Jasmine's `describe/it` syntax to setup a block for our Container.

    jest.dontMock('../Container');

    describe('Container', function() { });

Now, we start building tests to cover the system that is already in place. The best place to start is by looking at some of the things the Container already does.

- when given a list of items, it should render them all to the screen
- when given a list of items and a template, it should render the list using the template for each item
- items should be marked as draggable
- dragging an item should highlight the item being dragged
- dragging an item should call setData in the datatransfer with the right type and data being dragged

- dragging over a dropZone should highlight the drop zone
- dragging over the top half of an item should active the pervious drop zone
- dragging over the bottom half of an item should active the next drop zone
- dragging out of the container should clear any active drop zones
- dropping should add the item to the list
- dropping should selected items from the original list

There are probably more, but this is a good start. Next we will start building out tests and validating that each one goes green.

- When given a list of items, it should render them all to the screen.

        it('should display items, by default, in a text template (span element)', function() {
            var container = TestUtils.renderIntoDocument(<Container items={randomWords} />);
            expect(container.getDOMNode().textContent).toBe(randomWords.join(''));
        });

    First, we start with the `it()` function. Like `describe()`, `it()` expects two parameters, a description and a function. The `Container` is rendered into the fake DOM with the React `TestUtils.renderIntoDocument()` function. By using a `jsx` extension, the `Container-test.jsx` will automatically convert `<Container items={randomWords} />` into plain JavaScript. The returned `container` is the component that was rendered, and is the basis for all further testing.

    Finally, we check that the `Container` rendered the words to the page. `container.getDOMNode()` gets the DOM node and `textContent` is all the text content that is rendered inside the node. This test does not care about how the Container rendered the items, merely that they are present., so we check with `toBe()`. A better, but slower, test would iterating over each random word to check that the `textContent.indexOf(randomWord) !== -1`.

- When given a list of items and a template, it should render the list using the template for each item

        var CustomTemplate = React.createClass({
          displayName: 'CustomTemplate',
          propTypes: { item: React.PropTypes.any.isRequired },
          render: function() { return <span className="customFinder">{this.props.item}</span>; }
        });

        it('should display items with a custom template', function() {
          container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />);
          var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
          expect(items).toEqual(randomWords);
        });

    Just like the last test, we start with `renderIntoDocument`. However, this time we add the `itemTemplate={CustomTemplate}` property. The only difference between the default `TextTemplate` defined in `Container.jsx` is that we add `className="customFinder"` to make it easy to find our rendered elements.

    The second line of our test uses this classname along with the `TestUtils.scryRenderedDOMComponentsWithClass()` function to retrieve the rendered items. `map()` is a standard Array function that iterates over the results of `scryRenderedDOMComponentsWithClass()` and creates an array of the returned items, the `textContent` in this case.

    Finally, we run our actual `expect()` test. This time we check that `items` is equal to the original array we passed to the `Container`.


- items should be marked as draggable

    As we saw in the previous article, setting the `draggable` attribute is required for HTML5 Drag and Drop. That means we should probably guarantee that any refactoring does not forget to include it.

        it('should mark items as draggable', function() {
          var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
            , item = TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[1];
          expect(item.getDOMNode().getAttribute('draggable')).toBeTruthy();
        });

    As with the last test, this one starts by creating a `container`. We then use `scryRenderedDOMComponentsWithTag()` to grab all of the 'li' components, keeping the second one (the first component is a drop zone). Finally, we test for the `draggable` attribute, expecting it `toBeTruthy()`.

- dragging an item should highlight the item being dragged

    In the original article we "highlighted" an item using the [React: CSS in JS](https://speakerdeck.com/vjeux/react-css-in-js) technique of embedded styles. Now, we should be able to test this by calling `items.getDOMNode().style` or even `item.props.style`, but it does not seem to work. Neither call returns the style we set in our Container.jsx file. The solution we chose was the good old className. It is always painful to change working code just for the sake of testing, but sometimes you do not have a choice, let's call this pain point #1.

        it('highlights item as selected when being dragged', function() {
          var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
            , item = getItemFromContainer(container, 0)
            , mockDataTransfer = { setData: jest.genMockFunction() };
          expect(item.props.className).toBe('');
          TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
          expect(item.props.className).toBe('container-selected');
        });
        function getItemFromContainer(container, itemId) {
          return TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[2*itemId + 1];
        }

    We do a couple things differently in this test. First we pull the  `scryRenderedDOMComponentsWithTag` logic into a separate function. This is both more readable and [DRYer](http://en.wikipedia.org/wiki/Don%27t_repeat_yourself). Then we make sure the class name is blank initially. Next we simulate a dragStart event since the container currently only marks dragged items as selected (we are going to change this later). Then we check whether the className was applied. While we do not actually know that it was highlighted, we know a specific class was added, and presumably that class will trigger some highlighting.

    So, what about the `{ dataTransfer: mockDataTransfer }` property. `Simulate.dragSTart` takes an event properties parameter. In this case, we happen to know that our `dragStart` function handler requires a `dataTransfer.setData()` function, so we add a mock function. It breaks a little to know we need to supply a dataTransfer, but it is the only way to test. It would be much better if the React TestUtils supplied the required properties for the events they are simulating, but we can call that pain point #2.

    While we are talking about "pain points", I should mention one other. Jest does not support the HTMLElement [`dataset`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.dataset) property. It is probably better that we do not use it anyway because Internet Explorer did not support it until IE11. Also, as the Mozilla Developer Network points out in the [Using data attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Using_data_attributes) Issues section, there is a performance penalty when using `dataset`.

    In order to make the tests pass we need to make a few code changes. First, replace all instances of `dataset.key` with `getAttribute('data-key')`. Second, we need to add the className prop to the selected item in `renderListItem`'s `<li />` component.

        `className={this.state.selected.has(key) ? 'container-selected' : ''}`

- dragging an item should call setData in the datatransfer with the right type and data being dragged

    As we saw in the last test, React TestUtils `Simulate` functions do not relicate the `dataTransfer` event property, but we can mock it on a per call basis. To work with HTML5 Drag and Drop, we must call `dataTransfer.setData()`, so it is probably a really good idea to make sure the call was made.

        var CONTAINER_TYPE = 'custom_container_type';
        it('should set the data transfer with the correct type and the items to being dragged', function() {
          var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
            , item = getItemFromContainer(container, 0)
            , mockDataTransfer = { setData: jest.genMockFunction() };
          TestUtils.Simulate.dragStart(item, { dataTransfer: mockDataTransfer });
          expect(mockDataTransfer.setData).toBeCalledWith(CONTAINER_TYPE, '["apple"]');
        });

    This test is almost the same as the last one. In fact, many devs would combine this test with the last test, but I have found it makes requirements easier to determine if the tests are lower level. However it is arranged, it is important to check that the `mockDataTransfer.setData()` function was called with the right data type, `'custom_container_type'`, and the proper JSON representation of the data. For convenience later, we extract the dataType `'custom_container_type'` into the global variable, `CONTAINER_TYPE`.

- dragging over a dropZone should highlight the drop zone

        var CONTAINER_DROP_ZONE_ACTIVE = 'container-dropZone-active';
        it('shows the current dropzone when hovering over drop zone', function() {
          var container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords} />)
            , dropZone = getDropZone(container, 0)
            , mockEvent = { dataTransfer: { types: CONTAINER_TYPE } };
          expect(dropZone.props.className).toBe('');
          TestUtils.Simulate.dragOver(dropZone, mockEvent);
          expect(dropZone.props.className).toBe(CONTAINER_DROP_ZONE_ACTIVE);
        });
        function getDropZone(container, itemId) {
          return TestUtils.scryRenderedDOMComponentsWithTag(container, 'li')[2*itemId];
        }

    Just like our test to see if selected items were highlighted, we run into pain point #1 all over again. Again, using the className solution works. This time we simulate a `dragOver` event. Also, we created a function for extracting rendered drop zones.

    Again, we need to change our code to make the test pass. This time, add the `className={this.state.hoverOver === index ? 'container-dropZone-active' : ''}` to the `renderDropZone `<li />` component.

    Do you see it? This is a testing bug. It was not obvious because the test passed. In fact, if we were not thinking carefully, and working through the code as we wrote tests, we would have missed it. While writing this test, and looking at the code, we notice that all of the drag over event handlers have the same line at the start.

        if(this.containerAcceptsDropData(e.dataTransfer.types)) { e.preventDefault(); }

    This reminds us part of the HTML5 spec is that, by default, drop is not allowed. The spec requires calling `e.preventDefault()` on every dragEnter/dragOver operation. Our container only allows drops for certain types. Being good coders, we add an expect line for this case, but what are we expecting. Remember, testing pain point #2, some/many required event properties are not automatically mocked. So we redefine mockEvent to include a preventDefault function we can test.

        mockEvent = {
          dataTransfer: { types: CONTAINER_TYPE },
          preventDefault: jest.genMockFunction()
        }
        // ...
        expect(mockEvent.preventDefault).toBeCalled();

    And here is our bug, `types: CONTAINER_TYPE`. Types is an array, but we supply a single string. The solution is simple.

        types: [CONTAINER_TYPE]

    Why do we take so much time to highlight this, because we learn from our mistakes. And this was a mistake I made, and only noticed while writing this article. As this article is about testing, and learning from testing, it seemed like a good example of working through a real world problem. It also highlights a potential pitfall of testing in reverse, it is pretty easy to miss features that should be tested and sometimes you are not tests are not testing what they at first appear to be testing.

- dragging over the top half of an item should active the pervious drop zone

    At this point we have started repeating ourselves. So first we are going to make use of the very helpful `beforeEach()` function. `beforeEach()` will run before each of the tests in a `describe()` block. This gives us a way of setting up some common variables and making sure they are the same for each test. There is also a very handy `beforeAll()` function that will run just once, before all of the tests.

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

    Run the tests again, after going back over the previous tests in the same describe block to refactor out the variables. If every thing is still green, it is time to check that dragging over the top half of an item activates the drop zone above that item. We already grabbed those drop zones in the `beforeEach()` function call.

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

    First thing, you will notice that we are specifying the mouse position (`clientY`) and item dimensions (`offsetTop` and `offsetHeight`). Interestingly, this test did pass in this environment, but it might throw errors in other environments. Again, we check for the active style and that preventDefault was called.

- dragging over the bottom half of an item should active the next drop zone

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

    This test looks almsot identical to the last test. The only change is our mouse position (`clientY`) is now 7. We define the item to be 10px high with `offsetHeight`, so this puts the drag event in the bottom half of the item.

    Unlike the last test, this one will fail without the mouse position and item dimensions. Instead of activating the `dropZoneBelow`, the `dropZoneAbove` is activated. But again, it might error out in other environments long before our expect call.

- dragging out of the container should clear any active drop zones

    This was an important fix from the last article. Otherwise drop zones remain active after dragging the item out of the container, even when just dragging over a container.

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

    First, our `container` is the React element, not the list element where we attached the `onDragLeave` event handler. So the first thing we need to do is grab that `'ul'` element. This breaks our black-box test a bit, but there is no way around it. 

    Next, we simulate a dragOver event and check that it activated one of the drop zones. 

    Then we setup the mouse coordinates and bounding dimensions of the list. We know from the code that these are important, but we also know from the HTML5 spec that they will be provided.

    Finally, we simulate the drag leave and check that the number of active drop zones is now bac to zero.

- dropping should add the item to the list

    For our drop testing we will use a new beforeEach setup.

        beforeEach(function() {
          container = TestUtils.renderIntoDocument(<Container itemTemplate={CustomTemplate} items={randomWords.slice(0)} />);
          overItem  = getDropZone(container, randomWords.length)
          mockEvent = { dataTransfer: { types: [CONTAINER_TYPE] } }
        });

    This will give us a container, with overItem pointing to the last dropZone and a basic mockEvent. Then we can test whether dropping adds the item.

        it('adds dropped items to currently selected drop zone', function() {
            mockEvent.dataTransfer.getData = function() { return '"peaches"'; };

            TestUtils.Simulate.dragOver(overItem, mockEvent);
            TestUtils.Simulate.drop(overItem, mockEvent);
            var items = TestUtils.scryRenderedDOMComponentsWithClass(container, 'customFinder').map(function(item) { return item.getDOMNode().textContent; });
            expect(items).toEqual(randomWords.concat(["peaches"]));
        });

    First, we add a mock getData function that just returns `"peaches"`. Then we simulate a drag over to activate a drop zone, and we simulate a drop event to put that data into the container. Finally, we extract the items and see if our new item has been appended to the end.

- dropping should selected items from the original list

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

    This time we grab the first item in the container. We setup the mockEvent dataTransfer with that item's information. Then we simulate all of the events that normally happen, including the dragEnd. Then we check that the result is the list with with the first item removed and pinned to the end (`randomWords.slice(1).concat(randomWords[0])`).


Conclusion
----------

This gives us a pretty good starting point for refactoring and adding some new features. Which we are going to do in the next article [Adding Multi-Select to the Drag and Drop Container]().

First, since we can do TDD, we should
Extra Tips
- it.only

Questions I would like somebody who got a ticket to Reactjs.conf to ask!
- css in js - how to test?

Pain Points
1. no access to style property
2. Simulate.drag* does not provide drag related properties, so we have to do so ourselves.