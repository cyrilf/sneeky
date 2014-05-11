'use strict';

var Game = require('./game');

/**
 * gameManager is an helper allowing us to easily work with the game collection
 * and do operations on it
 * @type {Object}
 */
var gameManager = {
  games: [],

  /**
   * Create a new Game instance
   * @return {Promise(Game)} Game instance
   */
  newGame: function() {
    var self = this;

    return new Promise(function(resolve) {
      var game = new Game();
      self.addGame(game);
      resolve(game);
    });
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
