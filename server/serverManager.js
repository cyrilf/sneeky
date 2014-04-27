'use strict';

/**
 * Usefull methods for the server to work.
 */
var serverManager = {
  /**
   * Configure the server with some default options
   * @param  {Object}   options
   */
  configure: function(options) {

    var express = require('express');
    var http    = require('http');

    var opts  = options || {};
    opts.name = opts.name || 'sneeky';
    opts.port = opts.port || process.env.PORT || '2377';

    var app = express();
    app.use(express.static(__dirname + '/../public'));
    app.use('/common', express.static(__dirname + '/../common'));

    var server  = http.createServer(app);
    this.server = server;
    this.name   = opts.name;
    this.port   = opts.port;
  },

  /**
   * Run the server
   *   - Bind socket io to the server
   *   - Server start listenning on PORT
   * @param  {Object}   options (optional)
   */
  start: function(options) {
    var eventManager = require('./eventManager');
    var gameManager  = require('./game/gameManager');

    if(options !== null && typeof options === 'object') {
      this.configure(options);
    }

    eventManager.bind(this.server);
    this.server.listen(this.port);
    eventManager.listen();

    gameManager.newGame().then(function(game) {
      game.start(eventManager);

      console.log(this.name + ' is ready at localhost:' + this.port);
    });
  }
};

module.exports = serverManager;
