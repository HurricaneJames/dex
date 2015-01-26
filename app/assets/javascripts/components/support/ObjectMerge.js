var objectAssign = require("./ObjectAssign");

module.exports = function () {
  var res = {};
  for (var i=0; i<arguments.length; ++i) {
    if (arguments[i]) {
      objectAssign(res, arguments[i]);
    }
  }
  return res;
}
