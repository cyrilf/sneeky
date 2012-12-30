/**************************************************
** PLAYER
**************************************************/
var Directions = require( "./Directions" ).Directions;
var Player = function( params ) {
    var id        = params.id,
        color     = params.color,
        canvas    = params.canvas,
        unit      = params.unit,
        origin    = params.origin,
        trails    = [],
        direction,
        isPlaying = false;

	// Init the player to his default options
    var init = function() {
        this.direction = Directions.inverse( origin );
        this.trails    = [];
        this.trails.unshift( getStartPosition( origin ) );
        this.isPlaying = true;
    };

    var getStartPosition = function( start ) {
		var p = { x : 0, y : 0 }, x = 0, y = 0;
        var c = canvas,
            u = unit;
        switch( start ) {
            case Directions.UP :
                p.x = Math.round( ( ( c.width / 2 ) - 2 * u ) / u ) * u;
                p.y = 5 * u;
                break;
            case Directions.RIGHT :
                p.x = c.width - ( 5 * u );
                p.y = Math.round( ( ( c.height / 2 ) - 2 * u ) / u ) * u;
               break;
            case Directions.DOWN :
                p.x = Math.round( ( ( c.width / 2 ) + 2 * u ) / u ) * u;
                p.y = c.height - ( 5 * u );
                break;
            case Directions.LEFT :
                p.x = 5 * u;
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
        trails           : trails,
        direction        : direction,
        isPlaying        : isPlaying
    };
};
exports.Player = Player;