'use strict';

var directions = require('../../common/directions').directions;
var Player     = require('./player');
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

    return Promise.resolve(newPlayer);
  };

  /**
   * find a player by his id
   * @param  {String} id       player unique id
   * @return {Promise(Player)} player instance
   */
  this.findById = function(id) {
    return new Promise(function(resolve, reject) {
      var playerFound = false;
      _(game.players).each(function(player) {
        if(player.id === id) {
          playerFound = true;
          resolve(player);
        }
      });

      reject('Player not found');
    });
  };

  /**
   * Remove a player by his id
   * @param  {String} id player unique id
   * @return {Promise(Player)}    removed player instance
   */
  this.removePlayer = function(id) {
    var self = this;

    return new Promise(function(resolve, reject) {
      self.findById(id).then(function(player) {
        self.origins.unshift((player.origin));
        self.colors.unshift((player.color));

        game.players.splice(game.players.indexOf(player), 1);
        game.activePlayers -= 1;

        // If only one player and he disconnects, the gameIsOver
        if(game.players.length === 0) {
          game.isOn = false;
        }

        resolve(player);
      }, function(err) {
        reject('Player not removed. Reason: ' + err);
      });
    });
  };

  /**
   * Move all players and check for collision
   * @param  {eventManager} eventManager event manager
   * @return {Promise(Player)} null   if there is no winner
   *                           Player if someone won the game
   */
  this.move = function(eventManager) {
    var self = this;

    return new Promise(function(resolve, reject) {
      var hadCollision;
      _(game.players).each(function(player) {
        if(player.isPlaying) {
          // We need to send him the players (for collision check)
          // but this isn't a good thing IMO..
          player.move(game.players).then(function(isGoodMove) {
            hadCollision = ! isGoodMove;
            if(hadCollision) {
              game.activePlayers -= 1;

              eventManager.emitPlayerLoose(player);

              // If only one player left, he's the winner !
              player.isPlaying = false;
              if(game.activePlayers <= 1) {
                self.findWinner().then(function(winner) {
                  resolve(winner);
                });
              }
            }
          });
        }
      });

      resolve(null);
    });
  };

  /**
   * Find the winner in the active player
   * @return {Promise(Player)} winner
   */
  this.findWinner = function() {

    return new Promise(function(resolve, reject) {
      _(game.players).each(function(player) {
        if(player.isPlaying) {
          resolve(player);
        }
      });

      // If no winner it's because he's playing alone or someone disconnect
      resolve(game.players[0]);
    });
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
