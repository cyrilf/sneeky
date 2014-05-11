'use strict';

var Game = function(ui, eventManager) {
  this.ui           = ui;
  this.eventManager = eventManager;
};

Game.prototype.init = function(data) {
  this.ui.logoAnimation();

  // data
  // socket.emit('game:init', {
      //   id       : socket.id,
      //   // canvas   : canvas,
      //   // unit     : unit,
      //   color    : infos.color,
      //   players  : infos.players,
      //   gameIsOn : infos.gameIsOn,
      //   scoreMax : infos.scoreMax
      // });

  this.ui.playerInfos(data.color);

  this.id = this.ui.id = data.id;
  this.ui.unit     = data.unit;

  // Keys to move our player
  this.keys        = [38, 39, 40, 37];

  this.localPlayer = {};
  this.isPlaying   = !data.gameIsOn;

  // Draw all the players trails on connection
  this.ui.firstDraw(data.players);

  // Start listening for events
  this.eventManager.setEventHandlers();
};

Game.prototype.newPlayer = function(data) {
  this.ui.newPlayer(data);
};

Game.prototype.playerRemoved = function(data) {
  this.ui.playerRemoved(data);
};

Game.prototype.fullRoom = function(data) {
  this.ui.fullRoom(data);
};

Game.prototype.changeDirection = function(e) {
  var newDirection;
  var d = this.localPlayer.direction;
  // Touch or click
  if(e.touches || e.type === 'click') {
    var xMouse, yMouse;
    // Touch
    if(e.touches) {
      e.preventDefault();
      xMouse = e.touches[0].pageX - this.ui.canvas.parentNode.offsetLeft;
      yMouse = e.touches[0].pageY - this.ui.canvas.parentNode.offsetTop;
    } else if(e.type == 'click') { // Click
      xMouse = e.pageX - this.ui.canvas.parentNode.offsetLeft;
      yMouse = e.pageY - this.ui.canvas.parentNode.offsetTop;
    }
    var x = this.localPlayer.trails[0].x;
    var y = this.localPlayer.trails[0].y;
    if(yMouse < y && (d != directions.UP && d != directions.DOWN)) {
      newDirection = directions.UP;
    } else if(xMouse > x && (d != directions.RIGHT && d != directions.LEFT)) {
      newDirection = directions.RIGHT;
    } else if(yMouse > y && (d != directions.UP && d != directions.DOWN)) {
      newDirection = directions.DOWN;
    } else if(xMouse < x && (d != directions.RIGHT && d != directions.LEFT)) {
      newDirection = directions.LEFT;
    }
  } else { //Keys
    for (var k in this.keys) {
      if(e.which === this.keys[k]) {
        e.preventDefault();
        if (d !== directions.inverse(k) && d !== k) {
          newDirection = k;
        }
        break;
      }
    }
  }
  if(newDirection !== undefined) {
    this.eventManager.emitPlayerMove(newDirection);
  }
};

Game.prototype.update = function(data) {
  this.players = data.players;
  var i = 0, l = this.players.length;
  var player = null;
  for(; i < l; i++) {
    player = this.players[i];
    if(player.isPlaying) {
      this.ui.drawPlayer(player);
    }

    if(player.id === this.id) {
      this.localPlayer = player;
    }

    // Update the score
    document.getElementById( 'p_' + player.id ).innerHTML = player.score;
  }

  //Warn the player that he has to wait the end of this game
  if( !Sneeky.isPlaying ) {
      Sneeky.notify('infos', 'Wait the end of this game.');
  }
  this.ui.update(data);
};

Game.prototype.playerWin = function(data) {
  this.ui.playerWin(data);
};

Game.prototype.playerLoose = function(data) {
  this.ui.playerLoose(data);
};

Game.prototype.newGame = function() {
  this.ui.newGame();
};
