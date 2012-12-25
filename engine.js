//Enum of the directions
var directions = {
    UP : 0,
    RIGHT : 1,
    DOWN : 2,
    LEFT : 3,

    inverse : function( d ) {
        if( d == this.UP )
            return this.DOWN;
        else if( d == this.RIGHT )
            return this.LEFT;
        else if( d == this.DOWN )
            return this.UP;
        else
            return this.RIGHT;
    }
};

//Class Player
function Player ( params ) {
    this.name = params.name;
    this.mainColor = params.mainColor;
    this.trailColor = params.trailColor;
    this.origin = params.origin;
    this.trails = [];

    this.loose = function() {
        console.log(this.name + ' LOOSE...');
    };

    this.win = function() {
        console.log(this.name + ' WIN !!!');
    };

    this.reset = function() {
        this.direction = directions.inverse( this.origin );
        this.trails = [];
        this.trails.unshift( Sneeky.getStartPosition( this.origin ) );
    };
}

//Class Sneeky
var Sneeky = {

    randomCoords : function() {
        var x = Math.round( Math.random() * ( this.canvas.width  - ( this.unit ) ) / this.unit ) * this.unit;
        var y = Math.round( Math.random() * ( this.canavs.height - ( this.unit ) ) / this.unit ) * this.unit;
        return { x : x, y : y };
    },

    getStartPosition : function( start ) {
        var p = { x : 0, y : 0 }, x = 0, y = 0;
        switch( start ) {
            case directions.UP :
                p.x = Math.round( ( ( this.canvas.width / 2 ) - 2 * this.unit ) / this.unit ) * this.unit;
                p.y = this.unit;
                break;
            case directions.RIGHT :
                p.x = this.canvas.width - ( 2 * this.unit );
                p.y = Math.round( ( ( this.canvas.height / 2 ) - 2 * this.unit ) / this.unit ) * this.unit;
               break;
            case directions.DOWN :
                p.x = Math.round( ( ( this.canvas.width / 2 ) + 2 * this.unit ) / this.unit ) * this.unit;
                p.y = this.canvas.height - ( 2 * this.unit );
                break;
            case directions.LEFT :
                p.x = this.unit;
                p.y = Math.round( ( ( this.canvas.height / 2 ) + 2 * this.unit ) / this.unit ) * this.unit;
                break;
        }
        return p;
    },

    setStartPosition : function() {
        var l = this.players.length;
        for( var i = 0; i < l; i++ ) {
            this.players[i].reset();
        }
    },

    changeDirection : function( e ) {
        //prevent default function of the keys
        for( var i = 0, l = this.keys.length; i < l; i++ ) {
            if( e.which == this.keys[i][0] || e.which == this.keys[i][1] ) {
                e.preventDefault();
            }
        }

        //Manage up to two players (more will need to play with a server)
        var p = null;
        for ( var j = 0; j < 4; j++ ) {
            if( e.which == this.keys[j][0] ) {
                p = 0;
            } else if( e.which == this.keys[j][1] ) {
                p = 1;
            }
            if(p !== null ) {
                var d = this.players[p].direction;
                switch( j ) {
                    case 0 :
                        if( d != directions.DOWN )
                            this.players[p].direction = directions.UP;
                        break;
                    case 1 :
                        if( d != directions.LEFT )
                            this.players[p].direction = directions.RIGHT;
                        break;
                    case 2 :
                        if( d != directions.UP )
                            this.players[p].direction = directions.DOWN;
                        break;
                    case 3 :
                        if( d != directions.RIGHT )
                            this.players[p].direction = directions.LEFT;
                        break;
                }
                p = null;
            }
        }
    },

    updateTrails : function( player ) {
        var head = player.trails[0];

        if( player.direction === directions.UP ) {
            head.y -= this.unit;
        } else if( player.direction === directions.RIGHT ) {
            head.x += this.unit;
        } else if( player.direction === directions.DOWN ) {
            head.y += this.unit;
        } else if( player.direction === directions.LEFT ) {
            head.x -= this.unit;
        }

        //Test for colissions
        var state = this.collisionCheck( player );
        if (state == 'loose' || state == 'only_one' ) {
            return state;
        } else {
            //The following is bugging
            //player.trails.unshift( head );
            //But this one works ! WTF ? #answer ?
            player.trails.unshift( { x : head.x, y : head.y } );
            return 'good'; //everything's fine
        }
    },

    drawTrail : function( player ) {
        //Draw the trails
        if ( player.trails.length > 2 ) {
            //this.ctx.shadowBlur = 5;
            //this.ctx.shadowColor = player.trailColor;
            this.ctx.strokeStyle = player.trailColor;
            this.ctx.beginPath();
            this.ctx.moveTo(player.trails[0].x, player.trails[0].y);
            this.ctx.lineTo(player.trails[2].x, player.trails[2].y);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    },

    clearTrail : function( player ) {
        var x, y;
        for( var i = 2, l = player.trails.length; i < l; i++ ) {
            x = player.trails[i].x;
            y = player.trails[i].y;
            this.ctx.clearRect( x-this.unit, y-this.unit, 2*this.unit, 2*this.unit );
        }
    },

    collisionCheck : function( player ) {
        var head = player.trails[0];
        //Colissions with borders
        if( head.x < 0 || ( head.x + this.unit > this.canvas.width ) || head.y < 0 || ( head.y + this.unit > this.canvas.height ) ) {
            return this.loose( player );
        }
        //Colissions with others or himself
        var headC = { xpos : { begin : head.x, end : head.x + this.unit }, ypos : { begin : head.y, end : head.y + this.unit } };
        var lp = this.players.length;
        //For each players
        for( var i = 0; i < lp; i ++) {
            var p = this.players[i];
            var lt = p.trails.length;
            //for each trails in this player
            for( var j = 1; j < lt; j++ ) {
                //don't hit with his own head --'
                if( p == player && j <= 1)
                    continue;
                var x = p.trails[j].x;
                var y = p.trails[j].y;
                var trail = { xpos : { begin : x, end : x + this.unit }, ypos : { begin : y, end : y + this.unit } };

                var hitX = this.hitCheck( headC.xpos, trail.xpos );
                var hitY = this.hitCheck( headC.ypos, trail.ypos );

                if( hitX && hitY ) {
                    return this.loose( player );
                }
            }
        }
        //no colissions
        return false;
    },

    hitCheck : function( head, segment ) {
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
    },

    loose : function( player ) {
        //play an animation for loosing --> TODO!
        player.loose();

        //Remove him from the player
        this.players.splice( this.players.indexOf( player ), 1 );
        //Clear his trail
        this.clearTrail( player );
        //Add him to the loosers
        this.loosers.push( player );

        //If only one player left, he's the winner !
        if( this.players.length == 1) {
            this.win( this.players[0] );
            return 'only_one';
        } else {
            return 'loose';
        }
    },

    win : function( player ) {
        player.win();
    },

    reset : function() {
        var c = this.canvas;
        var ctx = this.ctx;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.font="40px verdana";
        var p = this.players[0];
        ctx.fillStyle = p.mainColor;
        ctx.fillRect( 0, 0, c.width, c.height );
        ctx.fillStyle = 'white';
        ctx.fillText( p.name, ( ( c.width/2 ) - ( ctx.measureText( p.name ).width / 2 ) ), ( c.height/2 ) );

        //WTF ? this.originPlayers depends on this.players who's depending on the first array Oo'
        //Sad to add the winner to the looser.. #todo
        this.loosers.unshift(p);
        this.players = this.loosers;
        this.setStartPosition();
        this.loosers = [];

        var self = this;
        setTimeout( function() { ctx.clearRect(0, 0, c.width, c.height); self.tick(); }, 2500 );
    },

    tick : function() {
        //For each player we update his position, etc..
        var player, state;
        for( var i = 0, l = this.players.length; i < l; i++) {
            player = this.players[i];
            state = this.updateTrails( player );
            if( state == 'good' ) {
                this.drawTrail( player );
            } else if( state == 'loose' ) {
                //someone fails so we recalculate the length
                l = this.players.length;
            } else if( state == 'only_one' ) {
                this.reset();
                return;
            }
        }

        var self = this;
        setTimeout( function() { self.tick(); }, this.tickSpeed );
    },

    startAnimation : function() {
        var c = this.canvas;
        var ctx = this.ctx;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.font = "70px verdana";
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect( 0, 0, c.width, c.height );
        ctx.fillStyle = 'rgba(103, 228, 252, 1)';
        ctx.fillText( 'Sneeky', ( ( c.width/2 ) - ( ctx.measureText( 'Sneeky' ).width / 2 ) ), ( c.height/2 ) );

        //launch the game loop
        var self = this;
        setTimeout( function() { ctx.clearRect(0, 0, c.width, c.height); self.tick(); }, 2000 );
    },

    init : function( params ) {
        //Params
        this.unit = params.unit;
        this.tickSpeed = params.tickSpeed;
        this.players = params.players;
        //usefull for the reset
        //OBJECT REFERENCE !!!! TODO
        this.originPlayers = params.player;
        this.loosers = [];

        //Canvas + styles
        this.canvas = params.canvas;
        this.ctx    = this.canvas.getContext( '2d' );

        this.setStartPosition();

        //Moving
        this.keys = [ [ 38, 90 ], [ 39, 68 ], [ 40, 83 ], [ 37, 81 ] ];
        var self = this;
        document.onkeydown = function( e ) {
            self.changeDirection( e );
        };

        this.startAnimation();
    }
};

var ezio = new Player({
    name : 'Ezio',
    mainColor : 'red',
    trailColor : 'firebrick',
    origin : directions.UP
});

var green = new Player({
    name : 'Green',
    mainColor : 'olivedrab',
    trailColor : 'yellowgreen',
    origin : directions.RIGHT
});

var blue = new Player({
    name : 'Blue',
    mainColor : '#2186ed',
    trailColor : 'rgba(103, 228, 252, 1)',
    origin : directions.DOWN
});

var yellow = new Player({
    name : 'Yellow',
    mainColor : 'goldenrod',
    trailColor : 'gold',
    origin : directions.LEFT
});
var players = [ ezio, green, blue, yellow ];

Sneeky.init({
    canvas : document.getElementById( 'canvas' ),
    unit : 1,
    tickSpeed : 5,
    players : players
});