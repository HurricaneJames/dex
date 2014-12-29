// app/assets/javascripts/components/__tests__/preprocessor.js
var ReactTools = require('react-tools');

module.exports = {
  process: function(src) {
    return ReactTools.transform(src);
  }
};