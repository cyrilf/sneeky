'use strict';

var directions    = require('../../common/directions');
var PlayerManager = require('../player/playerManager');
var Q             = require('q');

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
  this.playerManager = new PlayerManager(this);
};

Game.prototype.start = function() {
  console.log('start');
};

Game.prototype.newPlayer = function(socketId) {
  var self = this;
  var deferred = Q.defer();

  console.log('New player has connected: ' + socketId);

  if(this.playerManager.isFull()) {
    deferred.reject('game:fullRoom', self.players.length);
    return;
  }

  this.playerManager.newPlayer(this, socketId).then(function(newPlayer) {
    var infos = {
      id       : socketId,
      // canvas   : canvas,
      // unit     : unit,
      color    : newPlayer.color,
      players  : self.players,
      gameIsOn : self.isOn,
      scoreMax : self.scoreMax
    };

    deferred.resolve(infos);
  });

  //Someone is here, so the game is on.
  this.isOn = true;

  return deferred.promise;
};

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

Game.prototype.onPlayerDisconnect = function(socket) {
  var deferred = Q.defer();

  console.log('Player has disconnected: ' + socket.id);

  this.playerManager.removePlayer(socket.id).then(function(playerRemoved) {
    deferred.resolve(playerRemoved);
  });

  return deferred.promise;
};

module.exports = Game;
