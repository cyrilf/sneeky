'use strict';

var _ = require('lodash');
var Q = require('q');

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
    var deferred = Q.defer();

    this.hasCollisionWithBorder(player, canvas, unit).then(function(result) {
      if(result === true) {
        return true;
      } else {
        return this.hasCollisionWithAPlayer(player, players, canvas, unit);
      }
    }).then(function(result) {
      deferred.resolve(result);
    });

    // No colissions, well done !
    deferred.resolve(false);

    return deferred.promise;
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
    var deferred = Q.defer();

    var head = player.trails[0];
    if(head.x < 0 || (head.x + unit > canvas.width) ||
       head.y < 0 || (head.y + unit > canvas.height)) {
        deferred.resolve(true);
    } else {
      deferred.resolve(false);
    }

    return deferred.promise;
  },

  /**
   * Check if there is a collision with himself or another player
   * @param  {Player}    player  the player we want to check for collision
   * @param  {[Player]}  players the players (including the current one)
   * @param  {[type]}    canvas  the canvas size (to be removed)
   * @param  {[type]}    unit    the unit of the canvas (to be removed)
   * @return {promise(Boolean)}  true if there is a collision
   *                             false otherwise
   */
  hasCollisionWithAPlayer: function(player, players, canvas, unit ) {
    var deferred = Q.defer();

    var head = player.trails[0];
    var headC = { xpos : { begin : head.x, end : head.x + unit }, ypos : { begin : head.y, end : head.y + unit } };
    var x, y, trailPosition, hitX, hitY;

    // For each players
    _(players).each(function(p) {
      if(p.isPlaying) {
        _(p.trails).each(function(trail, key) {
          // Can't hit with his own head --'
          if(p !== player || key !== 0) {
            x = trail.x;
            y = trail.y;
            trailPosition = { xpos : { begin : x, end : x + unit }, ypos : { begin : y, end : y + unit } };

            hitX = this.hitCheck(headC.xpos, trailPosition.xpos);
            hitY = this.hitCheck(headC.ypos, trailPosition.ypos);

            if(hitX && hitY) {
              // The player who make him loose, win 1 point
              if(p !== player) {
                p.score += 1;
              }
              deferred.resolve(true);
            }
          }
        });
      }
    });

    deferred.resolve(false);

    return deferred.promise;
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
    if( head.begin < segment.begin ) {
        a = head;
        b = segment;
    } else {
        a = segment;
        b = head;
    }

    if( a.end > b.begin ) {
        return true;
    } else {
        return false;
    }
  }
};

module.exports = collisionEngine;
