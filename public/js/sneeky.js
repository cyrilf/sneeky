'use strict';

var sneeky = {
  ui           : ui,
  eventManager : eventManager,
  game         : new Game(ui, eventManager)
};

sneeky.eventManager.connect(sneeky.game);
sneeky.game.init();
