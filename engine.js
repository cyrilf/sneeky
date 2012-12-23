var sneeky = function() {

    var canvas = document.getElementById( 'canvas' );
    var ctx = canvas.getContext( '2d' );
    var unit = 20;

    var tock = true;
    var tickSpeed = 100;

    var keys = [ [ 87, 38 ], [ 39, 68 ], [ 40, 83 ], [ 37, 65 ] ];
    var directions = {
        UP : 0,
        RIGHT : 1,
        DOWN : 2,
        LEFT : 3
    };
    var direction = directions.RIGHT;


    var trails = [];
    trails.unshift( randomCoords() );

    var mainColor = 'black';
    var trailColor = 'rgba( 130, 241, 103, 0.7)';

    function randomCoords() {
        var x = Math.round( Math.round( Math.random() * ( canvas.width  - ( unit ) ) ) / unit ) * unit;
        var y = Math.round( Math.round( Math.random() * ( canvas.height - ( unit ) ) ) / unit ) * unit;

        return [ x, y ];
    }

    function changeDirection( e ) {
        //prevent default function of the keys
        for( i = 0; i < keys.length; i++ ) {
            if( e.which == keys[i][0] || e.which == keys[i][1] ) {
                e.preventDefault();
            }
        }

        if( tock ) {
            if( e.which == keys[0][0] || e.which == keys[0][1] ) { // Up
                direction = directions.UP;
            } else if( e.which == keys[1][0] || e.which == keys[1][1] ) { // Left
                direction = directions.RIGHT;
            } else if( e.which == keys[2][0] || e.which == keys[2][1] ) { // Down
                direction = directions.DOWN;
            } else if( e.which == keys[3][0] || e.which == keys[3][1] ) { // Right
                direction = directions.LEFT;
            }
            tock = false;
        }
    }

    function updateCoords( coords ) {
        if( direction == directions.UP ) {
            coords[1] -= unit;
        } else if( direction == directions.RIGHT ) {
            coords[0] += unit;
        } else if( direction == directions.DOWN ) {
            coords[1] += unit;
        } else if( direction == directions.LEFT ) {
            coords[0] -= unit;
        }

        if( coords[0] < 0 ) {
            coords[0] = canvas.width - unit;
        } else if( coords[0] + unit > canvas.width ) {
            coords[0] = 0;
        }

        if( coords[1] < 0 ) {
            coords[1] = canvas.height - unit;
        } else if( coords[1] + unit > canvas.height ) {
            coords[1] = 0;
        }
        trails.unshift( coords );
    }

    function drawTrail ( coords ) {
        ctx.fillStyle = mainColor;
        ctx.fillRect( coords[0], coords[1], unit, unit );
        ctx.fillStyle = trailColor;
        var l = trails.length;
        for( var i = 1; i < l; i++ ) {
            console.log(i);
            ctx.fillRect( trails[i][0], trails[i][1], unit, unit );
        }
    }

    function tick() {
        //clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //just one direction per loopGame
        tock = true;

        document.onkeydown = function( e ) {
            changeDirection( e );
        };
        updateCoords( trails[0] );
        drawTrail( trails[0] );
        // collisionCheck();

        setTimeout( function() { tick(); }, tickSpeed );
    }

    return {
        init : function() {
            tick();
        }
    };
}();

sneeky.init();