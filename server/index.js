'use strict';

var serverManager = require('./serverManager');

/**
 * sneeky
 */
var sneeky = {
  configure: serverManager.configure,
  start: serverManager.start
};

module.exports = sneeky;
