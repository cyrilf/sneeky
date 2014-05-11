'use strict';

var ui = {

  logoColor: 'rgba(155, 89, 182,1.0)',
  fillColor: 'rgba(255, 255, 255, 0)',

  canvas:  document.getElementById('canvas'),
  context: canvas.getContext('2d'),

  id: null,
  unit: 3,

  localPlayerInfosElement: document.getElementById('localPlayerInfos'),
  playersInfosElement: document.getElementById('playersInfos'),

  color: 'Firebrick',

  logoAnimation: function() {
    this.context.lineCap = 'round';
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.font      = '70px verdana';
    this.context.fillStyle = this.fillColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.logoColor;
    this.context.fillText('sneeky', ((this.canvas.width/2) - (this.context.measureText('sneeky').width / 2)), (this.canvas.height/2));
  },

  playerInfos: function(color) {
    this.localPlayerInfosElement.style.backgroundColor = color;
    this.localPlayerInfosElement.innerHTML             = color;
    this.color = color;
  },

  firstDraw: function(players) {
    var i = 0,
        length = players.length,
        player = null,
        j = 0,
        lTrails = 0,
        pTmp = null;

    for(; i < length; i++) {
        player = players[i];
        lTrails = player.trails.length
        for(; j < (lTrails - 1); j++ ) {
            pTmp = {
                color : player.color,
                trails : [player.trails[j], player.trails[j + 1]]
            };
            this.drawPlayer( pTmp );
        }
        this.playersInfosElement.innerHTML += '<div class="playerInfos" id="p_' + player.id + '" style="border-left: 50px ' + player.color + ' solid">' + player.score + '</div>';
    }
  },

  newPlayer: function(data) {
    this.playersInfosElement.innerHTML += '<div class="playerInfos" id="p_' + data.id + '" style="border-left: 50px ' + data.color + ' solid">0</div>';
  },

  playerRemoved: function(data) {
    var element = document.getElementById('p_' + data.id);
    element.parentNode.removeChild(element);
  },

  fullRoom: function(data) {
    this.localPlayerInfosElement.style.backgroundColor = 'Firebrick';
    this.localPlayerInfosElement.style.height = '100px';
    this.localPlayerInfosElement.innerHTML    = "The room is full (" + data.inGamePlayers + "/" + data.inGamePlayers + ") <br> Refresh this page later.";
  },

  drawPlayer: function(player) {
    var ctx = this.context;
    ctx.beginPath();
    //ctx.shadowBlur  = this.unit;
    //ctx.shadowColor = player.color;
    ctx.strokeStyle = player.color;
    ctx.lineWidth   = this.unit;
    ctx.moveTo(player.trails[0].x, player.trails[0].y);
    ctx.lineTo(player.trails[1].x, player.trails[1].y);
    ctx.stroke();
    ctx.closePath();
  },

  playerWin: function(data) {
    this.context.fillStyle = data.color;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillRect(0, (this.canvas.height/3), this.canvas.width, (this.canvas.height/3) - 30);
    this.context.fillStyle = 'white';
    this.context.fillText(data.color + " : " + data.score, ((c.width/2) - (ctx.measureText(data.color + " : " + data.score).width/2)), (c.height/2));
    if(this.id === data.id ) {
      this.localPlayerInfosElement.innerHTML = 'You win';
    }
    //@TODO
    //Sneeky.isPlaying = true;
  },

  playerLoose: function(data) {
    var looser = data.player;
    var x, y, i = 0,
        l = looser.trails.length;
    for(; i < l; i++) {
      x = looser.trails[i].x;
      y = looser.trails[i].y;
      this.context.clearRect(x - this.unit, y - this.unit, 2 * this.unit, 2 * this.unit);
    }

    if(this.id === looser.id) {
      this.localPlayerInfosElement.innerHTML = 'You loose';
    }
  },

  newGame: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    localPlayerInfosElement.innerHTML = this.color;
  }
};
