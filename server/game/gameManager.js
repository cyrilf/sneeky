'use strict';

var Game = require('./game');
var Q    = require('q');

/**
 * gameManager is an helper allowing us to easily work with the game collection
 * and do operations on it
 * @type {Object}
 */
var gameManager = {
  games: [],

  /**
   * Create a new Game instance
   * @return {Game} Game instance
   */
  newGame: function() {
    var deferred = Q.defer();

    var game = new Game();
    this.addGame(game);
    deferred.resolve(game);

    return deferred.promise;
  },

  /**
   * Add a game to the array games
   * @param {Game} game The fresh new game created
   */
  addGame: function(game) {
      this.games.push(game);
  }
};

module.exports = gameManager;
