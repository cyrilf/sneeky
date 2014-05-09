'use strict';

require('es6-shim/es6-shim.js');
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
