'use strict';

var ui = {

  logoColor: 'rgba(155, 89, 182,1.0)',
  fillColor: 'rgba(255, 255, 255, 0)',

  canvas:  document.getElementById('canvas'),
  context: canvas.getContext('2d'),

  logoAnimation: function() {
    this.context.lineCap = 'round';
    this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
    this.context.font      = '70px verdana';
    this.context.fillStyle = this.fillColor;
    this.context.fillRect( 0, 0, this.canvas.width, this.canvas.height );
    this.context.fillStyle = this.logoColor;
    this.context.fillText( 'sneeky', (( this.canvas.width/2 ) - (this.context.measureText('sneeky').width / 2 )), (this.canvas.height/2 ));
  },

  playerInfos: function(color) {
    var element = document.getElementById('localPlayerInfos');
    element.style.backgroundColor = color;
    element.innerHTML             = color;
  },

  firstDraw: function(players) {
    var playersElmt = document.getElementById('playersInfos');
    var i = 0, length = players.length;
    var j = 0;

    for(; i < l; i++ ) {
        var player = players[i];
        for(lTrails = player.trails.length; j < (lTrails - 1); j++ ) {
            var pTmp = {
                color : player.color,
                trails : [player.trails[j], player.trails[j + 1]]
            };
            this.drawPlayer( pTmp );
        }
        playersElmt.innerHTML += '<div class="playerInfos" id="p_' + player.id + '" style="border-left: 50px ' + player.color + ' solid">' + player.score + '</div>';
    }
  },

  fullRoom: function(data) {
    var element = document.getElementById('localPlayerInfos');
    element.style.backgroundColor = 'Firebrick';
    element.style.height = '100px';
    element.innerHTML    = "The room is full (" + data.inGamePlayers + "/" + data.inGamePlayers + ") <br> Refresh this page later.";
  }
};
