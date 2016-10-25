;(function() {
  var Game = function (canvasId){
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var gameSize = { x: canvas.width, y: canvas.height };

    this.bodies = [new Player];

    var self = this;
    var tick = function () {
      self.update();
      self.draw(screen, gameSize);
      requestAnimationFrame(tick);//browswer API call to refresh screen
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      // console.log("good day");
    },

    draw: function() {
      screen.fillRect(30, 30, 40, 40);
    }
  };

  window.onload = function() {
    new Game("screen");
  };
})();
