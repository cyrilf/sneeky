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

  /**
   * When someone connect via socket.io
   *   - send this player his infos (color..)
   *   - broadcast to everyone that a new player is here
   *   - listen for events
   *     (move, disconnect, ..)
   * @param  {Object} socket the socket.io instance
   */
  onSocketConnection: function(socket) {
    // Refactor this hard-coded '0', the day we have multi-games
    // at the same time
    var game = gameManager.games[0];

    game.newPlayer(socket.id).then(function(infos) {
      socket.emit('game:init', {
        id       : socket.id,
        // canvas   : canvas,
        // unit     : unit,
        color    : infos.color,
        players  : infos.players,
        gameIsOn : infos.gameIsOn,
        scoreMax : infos.scoreMax
      });

      socket.broadcast.emit('player:new' , {
        id    : socket.id,
        color : infos.color
      });

      // Listen for a player move
      socket.on('player:move', game.onPlayerMove);

      // Listen for socket disconnected
      socket.on('disconnect', eventManager.onPlayerDisconnect);
    }, function(inGamePlayers) {
      socket.emit('game:fullRoom', {
        inGamePlayers: inGamePlayers
      });
    });
  },

  /**
   * When a player disconnect
   *   - We notify the game
   *   - We broadcast to everyone that the player loose
   *   - We broadcast to everyone that the player has disconnected
   */
  onPlayerDisconnect: function() {
    //!\\ 'this' is equal to the socket in this function,
    //     not the game object
    var socket = this;

    // Refactor this hard-coded '0', the day we have multi-games
    // at the same time
    var game = gameManager.games[0];

    game.onPlayerDisconnect(socket.id).then(function(playerRemoved) {
      socket.broadcast.emit('player:loose', {
          player: playerRemoved
      });

      // Broadcast removed player to connected socket clients
      socket.broadcast.emit('player:remove', { id: socket.id } );
    });
  },


  /**
   * Emit events
   */

  /**
   * Notify that a player won the game
   * @param  {Player} winner winner
   * @param  {Int} score     his score
   */
  emitPlayerWin: function(winner, score) {
    this.io.sockets.emit('player:win', {
      id    : winner.id,
      name  : winner.name,
      color : winner.color,
      score : score
    });
  },

  /**
   * Notify that a player lost
   * @param  {Player} looser looser
   */
  emitPlayerLoose: function(looser) {
    this.io.sockets.emit('player:loose', {
      player: looser
    });
  },

  /**
   * Notify players new positions
   * @param  {Array[Object]} playersSockets players informations
   */
  emitPlayersNewPositions: function(playersSockets) {
    this.io.sockets.emit('game:update', {
      players: playersSockets
    });
  },

  /**
   * Notify a new game
   */
  emitNewGame: function() {
    this.io.sockets.emit('game:new');
  }
};

module.exports = eventManager;
