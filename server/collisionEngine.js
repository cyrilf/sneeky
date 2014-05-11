'use strict';

var _ = require('lodash');

/**
 * collisionEngine is here to deals with every collisions tests
 * @type {Object}
 */
var collisionEngine = {

  /**
   * Check if a collision occured
   * @param  {Player}    player  the player we want to check for collision
   * @param  {[Player]}  players the players (including the current one)
   * @param  {[type]}    canvas  the canvas size (to be removed)
   * @param  {[type]}    unit    the unit of the canvas (to be removed)
   * @return {promise(Boolean)}  true if there is a collision
   *                             false otherwise
   */
  hasCollision: function(player, players, canvas, unit) {

    return this.hasCollisionWithBorder(player, canvas, unit).then(function(result) {
      return result || this.hasCollisionWithAPlayer(player, players, canvas, unit);
    });
  },

  /**
   * Check if there is a collision with a game boundary
   * @param  {[type]}  player   the player we want to check for collision
   * @param  {[type]}  canvas   the canvas size (to be removed)
   * @param  {[type]}  unit     the unit of the canvas (to be removed)
   * @return {promise(Boolean)} true if there is a collision
   *                            false otherwise
   */
  hasCollisionWithBorder: function(player, canvas, unit) {
    return new Promise(function(resolve, reject) {

      var head = player.trails[0];
      if(head.x < 0 || (head.x + unit > canvas.width) ||
         head.y < 0 || (head.y + unit > canvas.height)) {
          resolve(true);
      } else {
        resolve(false);
      }
    });
  },

  /**
   * Check if there is a collision with himself or another player
   * @param  {Player}    currentPlayer the player we want to check for collision
   * @param  {[Player]}  players       the players (including the current one)
   * @param  {[type]}    canvas        the canvas size (to be removed)
   * @param  {[type]}    unit          the unit of the canvas (to be removed)
   * @return {promise(Boolean)}        true if there is a collision
         *                             false otherwise
   */
  hasCollisionWithAPlayer: function(currentPlayer, players, canvas, unit ) {
    var self = this;
    var head = currentPlayer.trails[0];
    var headC = { xpos : { begin : head.x, end : head.x + unit }, ypos : { begin : head.y, end : head.y + unit } };
    var x, y, trailPosition, hitX, hitY;

    players = players.filter(function(player) {
      return player.isPlaying;
    });

    return Promise.all(players.map(function(player) {
      return Promise.all(players.trails.map(function(trail, key) {
        // Can't hit with his own head --'
        if(player !== currentPlayer || key !== 0) {
          x = trail.x;
          y = trail.y;
          trailPosition = { xpos : { begin : x, end : x + unit }, ypos : { begin : y, end : y + unit } };

          return Promise.all([
            self.hitCheck(headC.xpos, trailPosition.xpos),
            self.hitCheck(headC.ypos, trailPosition.ypos)
          ]).then(function(values) {
            // consider array.some function ES6
            if(values[0] && values[1]) {
              // The player who make him loose, win 1 point
              if(player !== currentPlayer) {
                player.score += 1;
              }

              return Promise.resolve(true);
            }
          });
        };
      }));
    }));
  },

  /**
   * Helper function for collision check between two elements
   * @param  {Object}  head (first element)
   * @param  {Object}  segment (second element)
   * @return {Boolean} true if collision
   *                   false otherwise
   */
  hitCheck: function(head, segment) {
    var a,b;
    if(head.begin < segment.begin) {
        a = head;
        b = segment;
    } else {
        a = segment;
        b = head;
    }

    return Promise.resolve(a.end > b.begin);
  }
};

module.exports = collisionEngine;
