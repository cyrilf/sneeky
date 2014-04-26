'use strict';

var _ = require('lodash');
var Q = require('q');

var collisionEngine = {

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

  //Colissions with others or himself
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
