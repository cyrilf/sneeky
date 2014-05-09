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
      //

  this.ui.playerInfos(data.color);

  this.id          = data.id;
  this.unit        = data.unit;

  // Keys to move our player
  this.keys        = [ 38, 39, 40, 37 ];

  this.localPlayer = {};
  this.isPlaying = !data.gameIsOn;

  // Draw all the players trails on connection
  this.ui.firstDraw(data.players);

  // Start listening for events
  this.eventManager.setEventHandlers();
};

Game.prototype.fullRoom = function(data) {
  this.ui.fullRoom(data);
};
