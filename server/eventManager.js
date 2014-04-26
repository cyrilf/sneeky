'use strict';

var socketio    = require('socket.io');
var gameManager = require('./game/gameManager');

/**
 * Manage all events between server and client
 *   - socket.io
 */
var eventManager = {
  io: null,

  /**
   * Bind socket.io to the server
   * Initialization of the socket events
   * @param  {Object} server
   */
  bind: function(server) {
    this.io = socketio.listen(server);
    this.io.set('log level', 0);
  },

  /**
   * Start listenning to the socket events
   */
  listen: function() {
    this.io.sockets.on('connection', this.onSocketConnection);
  },

  onSocketConnection: function(socket) {
    // Refactor this hard-coded '0', the day we have multi-games
    // at the same time
    var game = gameManager.games[0];

    game.newPlayer(socket.id).then(function(infos) {
      socket.emit('initSneeky', {
        id       : socket.id,
        // canvas   : canvas,
        // unit     : unit,
        color    : infos.color,
        players  : infos.players,
        gameIsOn : infos.gameIsOn,
        scoreMax : infos.scoreMax
      });

      socket.broadcast.emit('newPlayer' , {
        id    : socket.id,
        color : infos.color
      });

      // Listen for a player move
      socket.on('player:move', game.onPlayerMove);

      // Listen for socket disconnected
      socket.on('disconnect', eventManager.onPlayerDisconnect);
    }, function(errorName, value) {
      socket.emit(errorName, {
        players: value
      });
    });
  },

  onPlayerDisconnect: function() {
    //!\\ 'this' is equal to the socket in this function,
    //     not the game object
    var socket = this;

    // Refactor this hard-coded '0', the day we have multi-games
    // at the same time
    var game = gameManager.games[0];

    game.onPlayerDisconnect(socket).then(function(playerRemoved) {
      socket.broadcast.emit('player:loose', {
          player: playerRemoved
      } );

      // Broadcast removed player to connected socket clients
      socket.broadcast.emit('player:remove', { id: socket.id } );
    });
  }
};

module.exports = eventManager;
