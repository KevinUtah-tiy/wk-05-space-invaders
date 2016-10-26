;(function() { //creates an iife - place all code within local scope
  var Game = function (canvasId){//constructor function for the game that will hold all of the game code
    var canvas = document.getElementById(canvasId);//links to the id on the html width and height set at 310 each
    var screen = canvas.getContext('2d');//creates a drawing context on the screen
    var gameSize = { x: canvas.width, y: canvas.height };//stores width and height for later use

    this.bodies = createInvaders(this).concat(new Player(this, gameSize));//bodies are all of the players and their respective bullets

    var self = this;
    loadSound("shoot.wav", function(shootSound) {
      self.shootSound = shootSound;//shooting sound to play passing in the callback function
      var tick = function(shootSound) {//make a tick function which is ran ~60 times / second; responsible for running main game logic
        self.update();//calling an update function
        self.draw(screen, gameSize);//calling a draw function with the screen and the gamesize
        requestAnimationFrame(tick);//browser API call to refresh screen to use tick the 60 times per second
      };

      tick();
    });
  };


  Game.prototype = {
    update: function() {//what happens with each tick
      var bodies = this.bodies;//new bodies are where the old bodies were
      var notCollidingWithAnything = function(b1) {
        return bodies.filter(function(b2) { return colliding(b1, b2); }).length === 0;//filter the ones that are colliding, lenght = 0 then b1 and b2 aren't colliding
      };

      this.bodies = this.bodies.filter(notCollidingWithAnything);//what happens with each tick

      for (var i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();//updates the entities
      }
    },

    draw: function(screen, gameSize) {
      screen.clearRect(0, 0, gameSize.x, gameSize.y);//makes the black square move without the smearing effect; clears from top-left to bottom-right
      for (var i = 0; i < this.bodies.length; i++) {
        drawRect(screen, this.bodies[i]);//all individuals are black rectangles
      }
    },

    addBody: function(body){//method pushes onto bodies array
      this.bodies.push(body);
    },
    invadersBelow: function(invader) {
      return this.bodies.filter(function(b) {
        return b instanceof Invader &&//keeps the body
        b.center.y > invader.center.y &&//they are somewhere below
        b.center.x - invader.center.x < invader.size.x;//find all invaders directly below any invaders current position
      }).length > 0;//there are invaders below
    }
  };

  var Player = function(game, gameSize) {//player constructor function
    this.game = game;
    this.size = { x: 15, y: 15 };//size of the player
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x}//where the game is at that moment
    this.keyboarder = new Keyboarder();//instantiates the keyboarder
  };

Player.prototype = {//player with their own update function...call update and draw 60 times/sec and this function delegates to the other functions for them to update automatically
  update: function () {
    if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
      this.center.x -= 2; }//left key is down moving the player left
    else if  (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
      this.center.x += 2;//right key is down moving the player right
    }

    if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE))//the space bar is pressed firing the players gun {
      var bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.x / 2},//bullet passed from the center above the player so they don't shoot themselves in the face with a velocity
      { x: 0, y: -6 });//velocity of the bullet
      this.game.addBody(bullet);//passed in from the computer
      this.game.shootSound.load();//loads the sound file
      this.game.shootSound.play();//plays the sound file
    }
  }
};

var Invader = function(game, center) {//boilerplate code
  this.game = game;
  this.size = { x: 15, y: 15 };
  this.center = center;
  this.patrolX = 0;
  this.speedX = 0.3;//spped of space invaders
};

Invader.prototype = {//object function
  update: function () {
    if (this.patrolX < 0 || this.patrolX > 40) {//relative positions to track where they are on the screen
      this.speedX = -this.speedX;//resets the direction once the patrol gets to one side of the canvas
    }

    this.center.x += this.speedX;//moves player right/left
    this.patrolX += this.speedX;//moves invaders right/left

    if (Math.random() > 0.995 &&//randomly generates the invaders firing
    !this.game.invadersBelow(this)) {//don't shoot if there is an invader below you...for obvious reasons
      var bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.x / 2},
      { x: Math.random() - 0.5 , y: 2 });//bullet shoots down with some random drift
      this.game.addBody(bullet);
    }
  }
};

var createInvaders = function(game) {
  var invaders = [];//creates all the invaders the game begins with
  for (var i = 0; i < 24; i++) {//total invaders
    var x = 30 + (i % 8) * 30;//number across each row; mod 8
    var y = 30 + (i % 3) * 30;//number of rows; mod 3
    invaders.push(new Invader(game, { x: x, y: y }));//passes in invader and center
  }

  return invaders;//final result
};

var Bullet = function(center, velocity) {
  this.size = { x: 3, y: 3 };
  this.center = center;
  this.velocity = velocity;
};

Bullet.prototype = {
update: function () {
  this.center.x += this.velocity.x;//x-component of center
  this.center.y += this.velocity.y;//y-component of center

  }
};


var drawRect = function(screen, body) {//draws to the screen a black rectangle as well as bullets and invaders
  screen.fillRect(body.center.x - body.size.x / 2,
                body.center.y - body.size.y / 2,
                body.size.x, body.size.y);//fill rect begins at the top left
  };

  var Keyboarder = function () {//module to handle keyboard input
    var keyState = {};//records whether any key that has ever been pressed is down or up right now

    window.onkeydown = function (e) {//update the keyState
      keyState[e.keyCode] = true;//e-identifies which key was pressed
    };
    window.onkeyup = function (e) {//update the keyState
      keyState[e.keyCode] = false;//identifies which key was released
    };

  this.isDown = function(keyCode) {
    return keyState[keyCode] === true;
  };

  this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 }
};//makes the key code readable to humans from ascii code

  var colliding = function(b1, b2) {//collision detection; body1 and body2, 5 conditions to determine if any of them are true then the bodies are definitely not colliding
    return !(b1 === b2 ||//b1 is not on top of b2 -- if b1 is to the left of b2 ...
      b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||//if b1 is left of b2 and b1 is to the left of b2
      b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||//if b1 is above b2 and the bottom of b1 is above the top of b2
      b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||//reciprocal of second condition
      b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);//reciprocal of 3rd condition
  };

  var loadSound = function(url, callback) {//add a sound for effects; url is where the sound lives; callback runs the sound when it is ready and loaded
    var loaded = function() {
      callback(sound);//passes back the sound
      sound.removeEventListener('canplaythrough', loaded);
    };//unbounds the sound


    var sound = new Audio(url);//makes a new sound with the new url
    sound.addEventListener('canplaythrough', loaded);//binds to a specific event...when loaded and fully ready to play
    sound.load();
  };

  window.onload = function() {//instantiates the game once the DOM is ready; canvas and script loaded
    new Game("screen");//id of canvas element passed to Game at top; var is at the top of the page
  };
})();
