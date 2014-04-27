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
   * @param {Game}   game      Game instance
   * @param {String} socketId  Socket id
   * @return {Promise(Player)} Player instance
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

    // Increment the number of active players
    if(! game.isOn) {
      game.activePlayers += 1;
    }

    game.players.push(newPlayer);

    deferred.resolve(newPlayer);

    return deferred.promise;
  };

  /**
   * find a player by his id
   * @param  {String} id       player unique id
   * @return {Promise(Player)} player instance
   */
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

  /**
   * Remove a player by his id
   * @param  {String} id player unique id
   * @return {Promise(Player)}    removed player instance
   */
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

  /**
   * Move all players and check for collision
   * @return {Promise(Player)} null   if there is no winner
   *                           Player if someone won the game
   */
  this.move = function() {
    var self = this;
    var deferred = Q.defer();

    var hadCollision;
    _(game.players).each(function(player) {
      if(player.isPlaying) {
        // We need to send him the players (for collision check)
        // but this isn't a good thing IMO..
        player.move(game.players).then(function(isGoodMove) {
          hadCollision = ! isGoodMove;
          if(hadCollision) {
            game.activePlayers -= 1;

            // @TODO give it to eventManager
            // Say it to the client
            // io.sockets.emit('player:loose', {
            //   player: player
            // });

            // If only one player left, he's the winner !
            player.isPlaying = false;
            if(game.activePlayers <= 1) {
              self.findWinner().then(function(winner) {
                deferred.resolve(winner);
              });
            }
          }
        });
      }
    });

    deferred.resolve(null);

    return deferred.promise;
  };

  /**
   * Find the winner in the active player
   * @return {Promise(Player)} winner
   */
  this.findWinner = function() {
    var deferred = Q.defer();

    _(game.players).each(function(player) {
      if(player.isPlaying) {
        deferred.resolve(player);
      }
    });

    // If no winner it's because he's playing alone or someone disconnect
    deferred.resolve(game.players[0]);

    return deferred.promise;
  };

  /**
   * Is the game max players reached?
   * @return {Boolean} true if it's full
   *                   false otherwise
   */
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
