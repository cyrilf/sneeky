/**************************************************
** SNEEKY
**************************************************/
var Sneeky = {

    init : function( params ) {
        // Params
        // Id to retrieve the local player
        this.id          = params.id;
        this.unit        = params.unit;

        // Canvas + styles
        this.canvas      = params.canvas;
        this.ctx         = this.canvas.getContext( '2d' );
        this.ctx.lineCap = 'round';

        this.playerInfos = params.playerInfos;

        // Keys to move our player
        this.keys        = [ 38, 39, 40, 37 ];

        // Socket connection
        this.socket      = params.socket;

        //this.startAnimation();
        this.localPlayer = {};

        this.isPlaying = !params.gameIsOn;

        // Draw all the players trails on connection
        this.firstDraw( params.players );

        // Start listening for events
        this.setEventHandlers();
    },

    setEventHandlers : function() {
        // Moving
        var self = this;
        document.onkeydown = function( e ) {
            self.changeDirection( e );
        };

        this.canvas.onclick = function ( e ) {
            self.changeDirection( e );
        };

        this.canvas.ontouchstart = function( e ) {
          self.changeDirection( e );
        };

        // Socket disconnection
        this.socket.on( "disconnect", this.onSocketDisconnect );

        // Someone left the game
        this.socket.on( "removePlayer", this.onRemovePlayer );


        // Launch a new game
        this.socket.on( "newGame", this.newGame );

        // Update the positions of all current players
        this.socket.on( "update", this.update );

        // A player win
        this.socket.on( "playerWin", this.playerWin );

        // A player loose
        this.socket.on( "playerLoose", this.playerLoose );
    },

    // Change the direction of the current player
    changeDirection : function( e ) {
        var newD;
        var d = this.localPlayer.direction;
        // Touch or click
        if ( e.touches || e.type == 'click' ) {
            var xMouse, yMouse;
            // Touch
            if( e.touches ) {
                e.preventDefault();
                xMouse = e.touches[0].pageX - this.canvas.parentNode.offsetLeft;
                yMouse = e.touches[0].pageY - this.canvas.parentNode.offsetTop;
            } else if( e.type == 'click' ) { // Click
                xMouse = e.pageX - this.canvas.parentNode.offsetLeft;
                yMouse = e.pageY - this.canvas.parentNode.offsetTop;
            }
            var x = this.localPlayer.trails[0].x;
            var y = this.localPlayer.trails[0].y;
            if( yMouse < y && ( d != Directions.UP && d != Directions.DOWN ) )
                newD = Directions.UP;
            else if( xMouse > x && ( d != Directions.RIGHT && d != Directions.LEFT ) )
                newD = Directions.RIGHT;
            else if( yMouse > y && ( d != Directions.UP && d != Directions.DOWN ) )
                newD = Directions.DOWN;
            else if( xMouse < x && ( d != Directions.RIGHT && d != Directions.LEFT ) )
                newD = Directions.LEFT;
        } else { //Keys
            for ( var k in this.keys ) {
                if( e.which == this.keys[k] ) {
                    e.preventDefault();
                    if ( d != Directions.inverse( k ) && d != k )
                        newD = k;
                    break;
                }
            }
        }
        if( newD !== undefined ) {
            this.socket.emit( "movePlayer", {
                direction: newD
            } );
        }
    },

    // Socket disconnected
    onSocketDisconnect : function() {
        console.log( "Disconnected from socket server" );
    },

    // Remove player
    onRemovePlayer : function( data ) {
        console.log( data.id + 'removed' );
    },

    // On a new game
    newGame : function() {
        Sneeky.ctx.clearRect( 0, 0, Sneeky.canvas.width, Sneeky.canvas.height );
        Sneeky.playerInfos.elmt.innerHTML = Sneeky.playerInfos.color;
    },

    // Update the position
    update : function( data ) {
        Sneeky.players = data.players;
        for( var i = 0, l = Sneeky.players.length; i < l; i++) {
            if( Sneeky.players[i].isPlaying )
                Sneeky.drawPlayer( Sneeky.players[i] );
            if( Sneeky.players[i].id == Sneeky.id )
                Sneeky.localPlayer = Sneeky.players[i];
        }

        //Warn the player that he has to wait the end of this game
        if( !Sneeky.isPlaying ) {
            Sneeky.notify('infos', 'Wait the end of this game.');
        }
    },

    // Draw all the players when the client connect
    firstDraw : function( players ) {
        for( var i = 0, l = players.length; i < l; i++ ) {
            var player = players[i];
            for( var j = 0, lTrails = player.trails.length; j < ( lTrails - 1 ); j++ ) {
                var pTmp = {
                    color : player.color,
                    trails : [ player.trails[j], player.trails[j + 1] ]
                };
                this.drawPlayer( pTmp );
            }
        }
    },

    // Draw a player in the canvas
    drawPlayer : function( player ) {
        var ctx = this.ctx;
        ctx.beginPath();
        //ctx.shadowBlur  = this.unit;
        //ctx.shadowColor = player.color;
        ctx.strokeStyle = player.color;
        ctx.lineWidth   = this.unit;
        ctx.moveTo( player.trails[0].x, player.trails[0].y );
        ctx.lineTo( player.trails[1].x, player.trails[1].y );
        ctx.stroke();
        ctx.closePath();
    },

    // A player win
    playerWin : function( data ) {
        var c         = Sneeky.canvas,
            ctx       = Sneeky.ctx;
        ctx.font      = "40px verdana";
        ctx.fillStyle = data.color;
        ctx.clearRect( 0, 0, c.width, c.height );
        ctx.fillRect( 0, ( c.height / 3 ), c.width, ( c.height / 3 ) - 30 );
        ctx.fillStyle = 'white';
        ctx.fillText( data.color, ( ( c.width / 2 ) - ( ctx.measureText( data.color ).width / 2 ) ), ( c.height / 2 ) );
        if( Sneeky.id == data.id )
            Sneeky.playerInfos.elmt.innerHTML = 'You win !!!';
        console.log( data.color + ' WIN !!!' );
        Sneeky.isPlaying = true;
    },

    // A player loose
    playerLoose : function( data ) {
        var looser = data.player;
        var x, y;
        for( var i = 0, l = looser.trails.length; i < l; i++ ) {
            x = looser.trails[i].x;
            y = looser.trails[i].y;
            Sneeky.ctx.clearRect( x - Sneeky.unit, y - Sneeky.unit, 2 * Sneeky.unit, 2 * Sneeky.unit );
        }
        if( Sneeky.id == looser.id )
            Sneeky.playerInfos.elmt.innerHTML = 'You loose..';
        console.log( looser.color + ' LOOSE...' );
    },


    // First animation
    startAnimation : function() {
        var c    = this.canvas;
        var ctx  = this.ctx;
        ctx.clearRect( 0, 0, c.width, c.height );
        ctx.font = "70px verdana";
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect( 0, 0, c.width, c.height );
        ctx.fillStyle = 'rgba(103, 228, 252, 1)';
        ctx.fillText( 'Sneeky', ( ( c.width/2 ) - ( ctx.measureText( 'Sneeky' ).width / 2 ) ), ( c.height/2 ) );
    },

    //Draw a notification (error / infos / success ) on the canvas
    notify : function( type, message ) {
        var color = 'grey';
        if( type == 'success' ) {
            color = 'yellowgreen';
        } else if( type == 'error' ) {
            color = 'firebrick';
        } else if( type == 'infos' ) {
            color = 'grey';
        } else {
            color = type;
        }
        var c         = Sneeky.canvas,
            ctx       = Sneeky.ctx;
        ctx.font      = "40px verdana";
        ctx.fillStyle = color;
        //ctx.fillRect( 0, ( c.height / 3 ), c.width, ( c.height / 3 ) - 30 );
        ctx.fillStyle = color;
        ctx.fillText( message, ( ( c.width / 2 ) - ( ctx.measureText( message ).width / 2 ) ), ( c.height / 2 ) );
    }
};

/**************************************************
** INIT THE CONNECTION AND THE GAME
**************************************************/
// Initialize socket connection
var socket = io.connect( window.location.hostname, { port: 2377, transports: ["websocket"] } );
socket.on("initSneeky", initSneeky);
socket.on("fullRoom", fullRoom);

function initSneeky( data ) {
    console.log("Connected to socket server");
    var canvas    = document.getElementById( 'canvas' );
    canvas.width  = data.canvas.width;
    canvas.height = data.canvas.height;

    //Show who's playing
    var playerInfos = {
        elmt: document.getElementById( 'playerInfos' ),
        color: data.color
    };
    playerInfos.elmt.style.backgroundColor = data.color;
    playerInfos.elmt.innerHTML = data.color;

    Sneeky.init({
        canvas      : canvas,
        playerInfos : playerInfos,
        unit        : data.unit,
        socket      : socket,
        id          : data.id,
        players     : data.players,
        gameIsOn    : data.gameIsOn
    });
}

// If the romm is full.. you can't play
function fullRoom( data ) {
    var elmt = document.getElementById( 'playerInfos' );
    elmt.style.backgroundColor = 'Firebrick';
    elmt.style.height = '100px';
    elmt.innerHTML = "The room is full (" + data.playersLength + "/" + data.playersLength + ") <br> Refresh this page later.";
}