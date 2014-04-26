'use strict';

var directions = require('../../common/directions').directions;

/**
 * Player class
 * @param {Object} confi configuration for the player
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

  // Init the player to his default options
  var init = function(gameIsOn) {
    this.direction = directions.inverse(origin);
    this.trails    = [];
    this.trails.unshift(getStartPosition(origin));
    // If the gameIsOn, he can't play else he join
    this.isPlaying = !gameIsOn;
  };

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

  return {
    init             : init,
    getStartPosition : getStartPosition,
    id               : id,
    color            : color,
    origin           : origin,
    trails           : trails,
    direction        : direction,
    score            : score,
    isPlaying        : isPlaying
  };
};

module.exports = Player;
