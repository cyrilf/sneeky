'use strict';

var eventManager = {
  socket: null,
  game: null,

  connect: function(game) {
    this.socket = io.connect(window.location.hostname);
    this.socket.on('game:init',     game.init.bind(game));
    this.socket.on('game:fullRoom', game.fullRoom.bind(game));
    this.game = game;
  },

  setEventHandlers: function() {
    var self = this;
    document.onkeydown = function(e) {
      self.game.changeDirection(e);
    };

    this.game.ui.canvas.onclick = function(e) {
      self.game.changeDirection(e);
    };

    this.game.ui.canvas.ontouchstart = function(e) {
      self.game.changeDirection(e);
    };

    // Socket disconnection
    this.socket.on('disconnect', this.onSocketDisconnect);

    // Someone join the game
    this.socket.on('player:new' , this.game.newPlayer.bind(this.game));

    // Someone left the game
    this.socket.on('player:remove', this.game.playerRemoved.bind(this.game));

    // Launch a new game
    this.socket.on('game:new', this.game.newGame.bind(this.game));

    // Update the positions of all current players
    this.socket.on('game:update', this.game.update.bind(this.game));

    // A player win
    this.socket.on('player:win', this.game.playerWin.bind(this.game));

    // A player loose
    this.socket.on('player:loose', this.game.playerLoose.bind(this.game));
  },

  emitPlayerMove: function(direction) {
    this.socket.emit("player:move", {
      direction: direction
    });
  },

  // Socket disconnected
  onSocketDisconnect: function() {
    console.log('Disconnected from socket server');
  }
};
