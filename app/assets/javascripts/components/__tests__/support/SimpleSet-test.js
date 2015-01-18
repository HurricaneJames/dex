jest.dontMock('../../support/SimpleSet');

describe("SimpleSet", function() {
  var Set = require('../../support/SimpleSet');
  it("should be creatable", function() {
    var set = new Set()
    var setFromArray = new Set([1, 2, 3]);
  });
  it("should convert the set to an array", function() {
    var set = new Set([1, 2, 3, 4]);
    expect(set.toArray()).toEqual([1, 2, 3, 4]);
  });
  it("should test accept an item", function() {
    var set = new Set();
    set.add(5)
    expect(set.toArray()).toContain(5);
  });
  it("should not allow more than 1 of any item", function() {
    var set = new Set([1]);
    set.add(1);
    expect(set.toArray()).toEqual([1]);
  });
  it("should remove items", function() {
    var set = new Set([1]);
    set.delete(1);
    expect(set.toArray()).not.toContain(1);
  });
  it("should do nothing when asked to remove an item not in the set", function() {
    var set = new Set();
    expect(function(){ set.delete(1) }).not.toThrow();
  });
  it("should clear all items", function() {
    var set = new Set([1, 2, 3]);
    set.clear();
    expect(set.toArray()).toEqual([]);
  });
  it("should return the size of the set", function(){
    var set = new Set([1, 2, 3]);
    expect(set.size()).toBe(3);
    set.delete(2);
    expect(set.size()).toBe(2);
    set.add(5);
    set.add(7);
    expect(set.size()).toBe(4);
  });
  it("should test if an item is in the set", function() {
    var set = new Set([1, 2, 3]);
    expect(set.has(2)).toBeTruthy();
    expect(set.has(5)).toBeFalsy();
  });
  it("should should have a forEach iteration function", function() {
    var set = new Set([1, 2, 3]);
    var results = [];
    set.forEach(function(i) { results.push("" + i); });
    expect(results).toEqual(["1", "2", "3"]);
  });
});