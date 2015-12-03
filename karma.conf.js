
var path = require('path')

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ],
    frameworks: [
      'phantomjs-shim',
      'jasmine',
    ],
    singleRun: true,
    plugins: [
      'karma-phantomjs-shim',
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],
    files: [
      'node_modules/es6-promise/dist/es6-promise.js',
      'node_modules/whatwg-fetch/fetch.js',
      'test.js'
    ],
  })
};
