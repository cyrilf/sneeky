'use strict';

var directions    = require('../../common/directions').directions;
var PlayerManager = require('../player/playerManager');
var _             = require('lodash');

/**
 * Game
 */
var Game = function() {
  // Change it to a random number
  this.id = 0;
  this.canvas = {
    width : 800,
    height : 600
  };
  this.unit          = 3;
  this.scoreMax      = 30;
  this.isOn          = false;
  this.origins       = [directions.UP, directions.DOWN, directions.LEFT, directions.RIGHT];
  this.players       = [];
  this.activePlayers = 0;
  this.maxPlayers    = 4;
  this.refreshTime   = 15;
  this.playerManager = new PlayerManager(this);
};

/**
 * New player
 * @param  {String} socketId socket id
 * @return {Promise(Object)} new player infos
 */
Game.prototype.newPlayer = function(socketId) {
  var self = this;

  return new Promise(function(resolve, reject) {
    console.log('New player has connected: ' + socketId);

    if(self.playerManager.isFull()) {
      reject(self.players.length);
      return;
    }

    self.playerManager.newPlayer(self, socketId).then(function(newPlayer) {
      // @TODO re-enable canvas/unit or find better solution
      var infos = {
        id       : socketId,
        // canvas   : canvas,
        // unit     : unit,
        color    : newPlayer.color,
        players  : self.players,
        gameIsOn : self.isOn,
        scoreMax : self.scoreMax
      };

      resolve(infos);
    });

    //Someone is here, so the game is on.
    self.isOn = true;
  });
};

/**
 * A player moved
 * @param  {Object} data player new direction
 */
Game.prototype.onPlayerMove = function(data) {
  //!\\ 'this' is equal to the socket in this function,
  //     not the game object
  var socket = this;

  this.playerManager.findById(socket.id).then(function(player) {
    player.direction = data.direction;
  }, function(err) {
    console.log('Unable to move player: ' + socket.id + '. Reason: ' + err);
  });
};

/**
 * A player has disconnected
 * @param  {String} socketId socket id
 * @return {Promise(player)} player removed
 */
Game.prototype.onPlayerDisconnect = function(socketId) {
  var self = this;
  return new Promise(function(resolve) {
    console.log('Player has disconnected: ' + socketId);

    self.playerManager.removePlayer(socketId).then(function(playerRemoved) {
      resolve(playerRemoved);
    });
  });
};

/**
 * Start a new game
 * @param  {eventManager} eventManager event manager
 */
Game.prototype.start = function(eventManager) {
  var self = this;
  // If the game is on
  if(this.isOn) {
    // Move the players
    this.playerManager.move(eventManager).then(function(winner) {
      if(winner !== null) {
        var scoreMaxReach = false;

        winner.score += 3;
        if(winner.score >= self.scoreMax) {
          scoreMaxReach = true;
        }

        // Foreach players we find the winner
        _(self.players).each(function(player) {
          // Re-init the players
          player.init();
        });

        var score = winner.score;
        // If score max reach, reset score for all players
        if(scoreMaxReach) {
          _(self.players).each(function(player) {
            player.score = 0;
          });
          score = 'win this round!';
        }

        eventManager.emitPlayerWin(winner, score);

        // The game is over
        self.isOn = false;

        // Wait for 1.5 sec ( animation on the client ) and relaunch the game
        setTimeout( function() { self.restart(eventManager); }, 1500 );
      }

      /**
       * Send the informations back to the client
       * with new players positions
       */

      var playersSockets = [];
      var pSocket;
      _(self.players).each(function(p) {
        pSocket = {
          id        : p.id,
          isPlaying : p.isPlaying,
          color     : p.color,
          direction : p.direction,
          trails    : [ p.trails[0], p.trails[1] ],
          score     : p.score
        };
        if(! pSocket.trails[1]) { // At the first loop p.trails[1] doesn't exist,
                                  // so to avoid an error we made it the same as p.trails[0]
          pSocket.trails[1] = pSocket.trails[0];
        }

        playersSockets.push(pSocket);
      });

      eventManager.emitPlayersNewPositions(playersSockets);
    });
  }

  setTimeout( function() { self.start(); }, self.refreshTime );
};

/**
 * Restart the game
 * @param  {eventManager} eventManager event manager
 */
Game.prototype.restart = function(eventManager) {
  this.activePlayers = this.players.length;
  this.isOn = true;

  eventManager.emitNewGame();
};

module.exports = Game;
