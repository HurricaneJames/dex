var SimpleSet = (function () {
  var array;
  var SimpleSet = defclass({
    constructor: function (array) {
      array = array || [];
      this.array = [];
      for(var i=0, length=array.length; i<length; i++) { this.add(array[i]); }
    },
    add: function(item) {
      if(this.array.indexOf(item) === -1) { this.array.push(item); }
    },
    delete: function(item) {
      var idx = this.array.indexOf(item);
      if(idx !== -1) { return this.array.splice(idx, 1); }
    },
    clear:   function() { this.array = []; },
    size:    function() { return this.array.length; },
    has:     function(item) { return this.array.indexOf(item) !== -1 },
    forEach: function() { return Array.prototype.forEach.apply(this.array, arguments); },
    toArray: function() { return this.array; }
  });

  return SimpleSet;

  function defclass(prototype) {
      var constructor = prototype.constructor;
      constructor.prototype = prototype;
      return constructor;
  }
}());

if (typeof module === "object") module.exports = SimpleSet;
if (typeof define === "function" && define.amd) define(SimpleSet);