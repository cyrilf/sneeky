'use strict';

var directions = require('../../common/directions').directions;
var Player     = require('./player');
var Q          = require('q');
var _          = require('lodash');

/**
 * PlayerManager is an helper allowing us to easily work with the player collection
 * and do operations on it
 * @type {Object}
 */
var PlayerManager = function(game) {
  this.colors  = [ 'Firebrick', 'Yellowgreen', 'DodgerBlue ', 'Goldenrod' ];
  this.origins = [ directions.UP, directions.DOWN, directions.LEFT, directions.RIGHT ];

  /**
   * Create a new Player instance
   * @param {Game} game A game instance
   * @return {Player} Player instance
   */
  this.newPlayer = function(game, socketId) {
    var deferred = Q.defer();

    // Choose a random color
    var color  = this.colors.shift();
    // Choose a origin
    var origin = this.origins.shift();

    // Create a new player
    var newPlayer = new Player({
      id     : socketId,
      color  : color,
      origin : origin,
      // canvas : canvas,
      // unit   : unit
    });
    newPlayer.init(game.isOn);

    // Increment the number of player
    if(! game.isOn) {
      game.activePlayers += 1;
    }

    game.players.push(newPlayer);

    deferred.resolve(newPlayer);

    return deferred.promise;
  };

  this.findById = function(id) {
    var deferred = Q.defer();
    var playerFound = false;
    _(game.players).each(function(player) {
      if(player.id === id) {
        playerFound = true;
        deferred.resolve(player);
      }
    });

    deferred.reject('Player not found');

    return deferred.promise;
  };

  this.removePlayer = function(id) {
    var self = this;
    var deferred = Q.defer();

    this.findById(id).then(function(player) {
      self.origins.unshift((player.origin));
      self.colors.unshift((player.color));

      game.players.splice(game.players.indexOf(player), 1);
      game.activePlayers -= 1;

      // If only one player and he disconnects, the gameIsOver
      if(game.players.length === 0) {
        game.isOn = false;
      }

      deferred.resolve(player);
    }, function(err) {
      deferred.reject('Player not removed. Reason: ' + err);
    });

    return deferred.promise;
  };

  this.isFull = function() {
    var maxPlayerReached = (game.players.length === game.maxPlayers);

    if(maxPlayerReached) {
      return true;
    } else {
      return false;
    }
  };
};

module.exports = PlayerManager;
