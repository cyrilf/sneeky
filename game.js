/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util       = require( "util" ),					// Utility resources (logging, object inspection, etc)
    io         = require( "socket.io" ),			// Socket.IO
    Player     = require( "./Player" ).Player,      // Player class
    Directions = require( "./Player" ).Directions;  // Directions enum

/**************************************************
** GAME VARIABLES
**************************************************/
var socket,         // Socket controller
    players = [];   // Array of connected players

var canvas,
    colors,
    origins,
    gameIsOn,
    playerInGame = 0,
    unit,
    refreshTime;

/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
    canvas = {
        width : 800,
        height : 800
    };
    unit        = 1;
    refreshTime = 5;

    colors  = [ 'firebrick', 'yellowgreen', 'DodgerBlue ', 'goldenrod', 'purple', 'orange' ];
    origins = [ Directions.UP, Directions.DOWN, Directions.LEFT, Directions.RIGHT ];

	// Set up Socket.IO to listen on port 2323
	io = io.listen( 2323 );

	// Configure Socket.IO
	io.configure( function() {
		// Only use WebSockets
		io.set( "transports", ["websocket"] );
		// Restrict log output
		io.set( "log level", 2 );
	} );

    gameIsOn = true;

	// Start listening for events
	setEventHandlers();

    // Launch the game
    gameLoop();
}

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
    io.sockets.on( "connection", onSocketConnection );
};

// New socket connection
function onSocketConnection( client ) {
    util.log( "New player has connected: " + client.id );

    // Add the player to our list
    var infos = addPlayer( client.id );
    // Say to the client that it can launch the game, we're ready !
    client.emit( "initSneeky", {
        id     : client.id,
        canvas : canvas,
        unit   : unit,
        color  : infos.color
    } );

    // Listen for a player move
    client.on( "movePlayer", onMovePlayer );

    // Listen for client disconnected
    client.on( "disconnect", onClientDisconnect );
}

function addPlayer( id ) {
    // Choose a random color
    var color = colors.shift();
    // Choose a origin
    var origin = origins.shift();

    // Create a new player
    var newPlayer = new Player( {
        id     : id,
        color  : color,
        origin : origin,
        canvas : canvas,
        unit   : unit
    } );
    newPlayer.init();
    // Increment the number of player
    playerInGame += 1;
    // Add him to our list
    players.push( newPlayer );

    return { color: color };
}

// Player has moved
function onMovePlayer( data ) {
    // Find player in array
    var movePlayer = playerById( this.id );
    // Player not found
    if ( !movePlayer ) {
        util.log( "Player not found (err move): " + this.id );
        return;
    }
    // Lock this if he try to move in the opposite direction
    if( movePlayer.direction != Directions.inverse( data.direction ) )
        movePlayer.direction = data.direction;
}

// Socket client has disconnected
function onClientDisconnect() {
    util.log( "Player has disconnected: " + this.id );
    var removePlayer = playerById( this.id );

    // Player not found
    if ( !removePlayer ) {
        util.log( "Player not found (err disconnect): " + this.id );
        return;
    }

    // Remove player from players array
    players.splice( players.indexOf( removePlayer ), 1 );

    // Broadcast removed player to connected socket clients
    this.broadcast.emit( "removePlayer", { id: this.id } );
}


/**************************************************
** GAME LOOP AND UPDATES
**************************************************/
var gameLoop = function() {
    // If the game is ready
    if( gameIsOn ) {
        var bool = false;
        var i;
        // For each player
        for( i = 0, l = players.length; i < l; i++ ) {
            // If he's playing
            if( players[i].isPlaying ) {
                // We update him
               if( !update( players[i] ) ) {
                    bool = true;
                    break;
               }
           }
        }

        // If only one player is in game, he's the winner
        if( bool ) {
            var winner;
            for ( i = 0, players.length; i < l; i++) {
                if( players[i].isPlaying )
                    winner = players[i];
                // Init the players
                players[i].init();
            }
            // If no winner it's because he's playing alone
            // OR
            // Someone deconnect
            if( !winner )
                winner = players[0];

            // Say to the client who won
            io.sockets.emit( "playerWin", {
                name : winner.name,
                color : winner.color
            } );
            // The game is over
            gameIsOn = false;
            // Wait for 1.5 sec ( animation on the client ) and relaunch the game
            setTimeout( function() { newGame(); }, 1500 );
        }
        // Send infos to the client
        io.sockets.emit( "update", {
            players: players
        } );
    }
    // Wait for a refresh time and call himself
    setTimeout( function() { gameLoop(); }, refreshTime );
};

// Update the player position
var update = function( player ) {
    var x = player.trails[0].x,
        y = player.trails[0].y,
        d = player.direction;

    if( d == Directions.UP ) {
        y -= unit;
    } else if( d == Directions.RIGHT ) {
        x += unit;
    } else if( d == Directions.DOWN ) {
        y += unit;
    } else if( d == Directions.LEFT ) {
        x -= unit;
    }

    var trail = { x : x, y : y };

    // If no collisions update him to his new position
    if ( !collisionCheck( player ) ) {
        player.trails.unshift( trail );
    } else {
        // Else he loose
        playerInGame -=1 ;
        player.isPlaying = false;

        // Say it to the client
        io.sockets.emit( "playerLoose", {
            player: player
        } );

        // If only one player left, he's the winner !
        if( playerInGame <= 1) {
            return false;
        }
    }
    // Everything's fine, next player to update
    return true;
};

// Launch a new game
var newGame = function() {
    playerInGame = players.length;
    io.sockets.emit( "newGame" );
    gameIsOn = true;
};




/**************************************************
** COLLISIONS FUNCTIONS
**************************************************/

function collisionCheck ( player ) {
    var head = player.trails[0];

    // Colissions with borders
    if( head.x < 0 || ( head.x + unit > canvas.width ) || head.y < 0 || ( head.y + unit > canvas.height ) ) {
        return true;
    }
    //Colissions with others or himself
    var headC = { xpos : { begin : head.x, end : head.x + unit }, ypos : { begin : head.y, end : head.y + unit } };
    var lp = players.length;
    // For each players
    for( var i = 0; i < lp; i ++) {
        var p = players[i];
        if( p.isPlaying ) {
            var lt = p.trails.length;
            // For each trails in this player
            for( var j = 0; j < lt; j++ ) {
                // Don't hit with his own head --'
                if( p == player && j === 0 )
                    continue;
                var x = p.trails[j].x;
                var y = p.trails[j].y;
                var trail = { xpos : { begin : x, end : x + unit }, ypos : { begin : y, end : y + unit } };

                var hitX = hitCheck( headC.xpos, trail.xpos );
                var hitY = hitCheck( headC.ypos, trail.ypos );

                if( hitX && hitY ) {
                    return true;
                }
            }
        }
    }
    // No colissions, well done !
    return false;
}

function hitCheck ( head, segment ) {
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
}


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById( id ) {
	var i;
	for (i = 0, l = players.length; i < l; i++) {
		if ( players[i].id == id )
			return players[i];
	}
	return false;
}


/**************************************************
** RUN THE GAME
**************************************************/
init();