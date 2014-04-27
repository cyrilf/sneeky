'use strict';

var serverManager = require('./serverManager');

/**
 * sneeky
 * Object helper to define the public methods
 */
var sneeky = {
  configure: serverManager.configure,
  start: serverManager.start
};

module.exports = sneeky;
