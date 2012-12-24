var sneeky = function() {

    var canvas = document.getElementById( 'canvas' );
    var ctx = canvas.getContext( '2d' );
    var unit = 11;
    var trailUnit = 2;
    var trailOffset = Math.floor(unit / 2);

    var tock = true;
    var tickSpeed = 40;

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
    var trailColor = 'rgba(103, 228, 252, 0.7)';

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

        if( direction === directions.UP ) {
            coords.y -= unit;
        } else if( direction === directions.RIGHT ) {
            coords.x += unit;
        } else if( direction === directions.DOWN ) {
            coords.y += unit;
        } else if( direction === directions.LEFT ) {
            coords.x -= unit;
        }

        if( coords.x < 0 ) {
            coords.x = canvas.width - unit;
        } else if( coords.x + unit > canvas.width ) {
            coords.x = 0;
        }

        if( coords.y < 0 ) {
            coords.y = canvas.height - unit;
        } else if( coords.y + unit > canvas.height ) {
            coords.y = 0;
        }
        //console.log(coords );
        //The following bug
        //trails.unshift( coords );
        //But this one works ! WTF ? #answer ?
        trails.unshift( { x : coords.x, y : coords.y } );
    }

    function drawTrail () {
        //Draw the trails
        if (trails.length > 2) {
            ctx.clearRect(trails[2].x, trails[2].y, unit, unit);
            ctx.strokeStyle = trailColor;
            if (Math.abs(trails[0].x - trails[2].x) <= 20 && Math.abs(trails[0].y - trails[2].y) <= 20 && trails[0].x != 0 && trails[0].y != 0) {
                ctx.moveTo(trails[0].x + trailOffset, trails[0].y + trailOffset);
                ctx.lineTo(trails[2].x + trailOffset, trails[2].y + trailOffset);
            } else if (Math.abs(trails[0].x - trails[2].x) > 20) {
                if (trails[0].x == 0) {
                    ctx.moveTo(canvas.width, trails[0].y + trailOffset);
                    ctx.lineTo(trails[2].x + trailOffset, trails[2].y + trailOffset);
                    ctx.moveTo(trails[0].x + trailOffset, trails[0].y + trailOffset);
                    ctx.lineTo(0, trails[2].y + trailOffset);
                } else {
                    ctx.moveTo(trails[2].x + trailOffset + unit, trails[2].y + trailOffset);
                    ctx.lineTo(0, trails[2].y + trailOffset);
                    ctx.moveTo(trails[0].x + trailOffset, trails[0].y + trailOffset);
                    ctx.lineTo(canvas.width, trails[2].y + trailOffset);
                }
            } else if (Math.abs(trails[0].y - trails[2].y) > 20) {
                if (trails[0].y == 0) {
                    ctx.moveTo(trails[0].x + trailOffset, canvas.height);
                    ctx.lineTo(trails[2].x + trailOffset, trails[2].y + trailOffset);
                    ctx.moveTo(trails[0].x + trailOffset, trails[0].y + trailOffset);
                    ctx.lineTo(trails[2].x + trailOffset, 0);
                } else {
                    ctx.moveTo(trails[2].x + trailOffset, trails[2].y + trailOffset + unit);
                    ctx.lineTo(trails[2].x + trailOffset, 0);
                    ctx.moveTo(trails[0].x + trailOffset, trails[0].y + trailOffset);
                    ctx.lineTo(trails[2].x + trailOffset, canvas.height);
                }
            }
            ctx.stroke();
        }
        //Draw the "head"
        ctx.fillStyle = mainColor;
        ctx.fillRect(trails[0].x, trails[0].y, unit, unit);
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