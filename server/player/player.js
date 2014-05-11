'use strict';

var directions      = require('../../common/directions').directions;
var collisionEngine = require('../collisionEngine');

/**
 * Player class
 * @param {Object} config configuration for the player
 */
var Player = function(config) {
  this.id        = config.id;
  this.color     = config.color;
  this.canvas    = config.canvas;
  this.unit      = config.unit;
  this.origin    = config.origin;
  this.direction = directions.inverse(this.origin);
  this.trails    = [];
  this.score     = 0;
  this.isPlaying = false;

  // TODO @remove this
  this.canvas = {
    width: 500,
    height: 500
  };
  this.unit = 3;
};

/**
 * Init the player to his default option
 *   (when a new game start)
 * @param  {Boolean} gameIsOn true if the game is on
 */
Player.prototype.init = function(gameIsOn) {
  this.direction = directions.inverse(this.origin);
  this.trails    = [];
  this.trails.unshift(this.getStartPosition(this.origin));
  // This player is not playing if the game is on
  // (occurs when a new player join a game already on,
  //  he have to wait for the end of it)
  this.isPlaying = !gameIsOn;
};

/**
 * get the player start position on the grid
 * @param  {Int} start  a directions.ENUM
 * @return {Object}     the start position (x and y)
 */
Player.prototype.getStartPosition = function(start) {
  var p = { x : 0, y : 0 };
  var c = this.canvas,
  u = this.unit;
  switch( start ) {
    case directions.UP :
      p.x = Math.round( ( ( c.width / 2 ) - 2 * u ) / u ) * u;
      p.y = 10 * u;
      break;
    case directions.RIGHT :
      p.x = c.width - ( 10 * u );
      p.y = Math.round( ( ( c.height / 2 ) - 2 * u ) / u ) * u;
      break;
    case directions.DOWN :
      p.x = Math.round( ( ( c.width / 2 ) + 2 * u ) / u ) * u;
      p.y = c.height - ( 10 * u );
      break;
    case directions.LEFT :
      p.x = 10 * u;
      p.y = Math.round( ( ( c.height / 2 ) + 2 * u ) / u ) * u;
      break;
    }

    return p;
};

/**
 * Move a player if necessary (if no collision)
 * @param  {[Player]} players list of all player (for check collision) (to removed)
 * @return {Promise(Boolean)} true if no collision occured
 *                            false otherwise
 */
Player.prototype.move = function(players) {
  var self = this;
  return new Promise(function(resolve) {
    collisionEngine.hasCollision(self, players, self.canvas, self.unit).then(function(collision) {
      if(! collision) {
        var x = self.trails[0].x,
        y = self.trails[0].y,
        d = self.direction;

        if(d === directions.UP) {
          y -= self.unit;
        } else if(d === directions.RIGHT) {
          x += self.unit;
        } else if(d === directions.DOWN) {
          y += self.unit;
        } else if(d === directions.LEFT) {
          x -= self.unit;
        }

        var trail = { x : x, y : y };

        self.trails.unshift(trail);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

module.exports = Player;
