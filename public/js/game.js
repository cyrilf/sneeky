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

        // Keys to move our player
        this.keys        = [ 38, 39, 40, 37 ];

        // Socket connection
        this.socket      = params.socket;

        //this.startAnimation();

        // Start listening for events
        this.setEventHandlers();
    },

    setEventHandlers : function() {
        // Moving
        var self = this;
        document.onkeydown = function( e ) {
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
        for ( var k in this.keys ) {
            if( e.which == this.keys[k] ) {
                e.preventDefault();
                this.socket.emit( "movePlayer", {
                    direction: k
                } );
                break;
            }
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
    },

    // Update the position
    update : function( data ) {
        Sneeky.players = data.players;
        for( var i = 0, l = Sneeky.players.length; i < l; i++) {
            if( Sneeky.players[i].isPlaying )
                Sneeky.drawPlayer( Sneeky.players[i] );
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
        ctx.fillRect( 0, 0, c.width, c.height );
        ctx.fillStyle = 'white';
        ctx.fillText( data.color, ( ( c.width / 2 ) - ( ctx.measureText( data.color ).width / 2 ) ), ( c.height / 2 ) );
        console.log( data.color + ' WIN !!!' );
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
    }
};

/**************************************************
** INIT THE CONNECTION AND THE GAME
**************************************************/
// Initialize socket connection
var socket = io.connect( "http://localhost", { port: 2323, transports: ["websocket"] } );
socket.on("initSneeky", initSneeky);

function initSneeky( data ) {
    console.log("Connected to socket server");
    var canvas    = document.getElementById( 'canvas' );
    canvas.width  = data.canvas.width;
    canvas.height = data.canvas.height;

    Sneeky.init({
        canvas  : document.getElementById( 'canvas' ),
        unit    : data.unit,
        socket  : socket,
        id      : data.id
    });
}