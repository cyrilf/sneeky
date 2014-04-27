'use strict';

var directions      = require('../../common/directions').directions;
var Q               = require('q');
var collisionEngine = require('../collisionEngine');

/**
 * Player class
 * @param {Object} config configuration for the player
 */
var Player = function(config) {
  var id        = config.id,
      color     = config.color,
      canvas    = config.canvas,
      unit      = config.unit,
      origin    = config.origin,
      trails    = [],
      direction,
      score     = 0,
      isPlaying = false;

  // TODO @remove this
  canvas = {
    width: 500,
    height: 500
  };
  unit = 3;

  /**
   * Init the player to his default option
   *   (when a new game start)
   * @param  {Boolean} gameIsOn true if the game is on
   */
  var init = function(gameIsOn) {
    this.direction = directions.inverse(origin);
    this.trails    = [];
    this.trails.unshift(getStartPosition(origin));
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
  var getStartPosition = function(start) {
    var p = { x : 0, y : 0 };
    var c = canvas,
    u = unit;
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
  var move = function(players) {
    var deferred = Q.defer();

    collisionEngine.hasCollision(this, players, this.canvas, this.unit).then(function(collision) {
      if(! collision) {
        var x = this.trails[0].x,
        y = this.trails[0].y,
        d = this.direction;

        if(d === directions.UP) {
          y -= unit;
        } else if(d === directions.RIGHT) {
          x += unit;
        } else if(d === directions.DOWN) {
          y += unit;
        } else if(d === directions.LEFT) {
          x -= unit;
        }

        var trail = { x : x, y : y };

        this.trails.unshift(trail);
        deferred.resolve(true);
      } else {
        deferred.resolve(false);
      }
    });

    return deferred.promise;
  };

  return {
    init             : init,
    getStartPosition : getStartPosition,
    move             : move,
    id               : id,
    canvas           : canvas,
    unit             : unit,
    color            : color,
    origin           : origin,
    trails           : trails,
    direction        : direction,
    score            : score,
    isPlaying        : isPlaying
  };
};

module.exports = Player;
