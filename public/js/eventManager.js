'use strict';

var eventManager = {
    socket: null,

    connect: function(game) {
      this.socket = io.connect(window.location.hostname);
      this.socket.on('game:init',     game.init.bind(game));
      this.socket.on('game:fullRoom', game.fullRoom.bind(game));
    }
};
