var sneeky = function() {

    var canvas = document.getElementById( 'canvas' );
    var ctx = canvas.getContext( '2d' );
    var unit = 1;

    var tock = true;
    var tickSpeed = 5;

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

    var mainColor = '#2186ed';
    var trailColor = 'rgba(103, 228, 252, 1)';

    function randomCoords() {
        var x = Math.round( Math.round( Math.random() * ( canvas.width  - ( unit ) ) ) / unit ) * unit;
        var y = Math.round( Math.round( Math.random() * ( canvas.height - ( unit ) ) ) / unit ) * unit;

        return { x : x, y : y };
    }

    function changeDirection( e ) {
        //prevent default function of the keys
        for( i = 0, k = keys.length; i < k; i++ ) {
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

    function updateCoords() {
        var coords = trails[0];
        switch (direction) {
            case directions.RIGHT: coords.x++; break;
            case directions.LEFT: coords.x--; break;
            case directions.UP: coords.y--; break;
            case directions.DOWN: coords.y++; break;
        }
        trails.unshift( { x : coords.x, y : coords.y } );
    }

    function drawTrail() {
        if (trails.length > 2) {
            ctx.shadowBlur = 5;
            ctx.shadowColor = trailColor;
            ctx.strokeStyle = trailColor;
            ctx.beginPath();
            ctx.moveTo(trails[0].x, trails[0].y);
            ctx.lineTo(trails[2].x, trails[2].y);
            ctx.closePath();
            ctx.stroke();
        }
    }

    function tick() {
        //just one direction per loopGame
        tock = true;

        document.onkeydown = function( e ) {
            changeDirection( e );
        };
        updateCoords();
        drawTrail();
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