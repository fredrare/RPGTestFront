function print (msg) {
  console.log(msg);
}
// Create the canvas
$('.modal').modal();
$('#nickname').modal('open');
document.getElementById("start").autofocus = true;

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var MAP_WIDTH = $('#game').width();
var MAP_HEIGHT = 700;

canvas.width = MAP_WIDTH;
canvas.height = MAP_HEIGHT;

// Declare usable variables
// Create socket
var socket;
// Create list of players
var players = {};
// Create user
var user = {};
var id = 0;
// Create speed
var SPEED = 256;
// Create game state
var started = false;
var then;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {keysDown[e.keyCode] = true;}, false);

addEventListener("keyup", function (e) { delete keysDown[e.keyCode]; }, false);

// Create the update function
function update (modifier) {
let old = {};
  old.x = user.x;
  old.y = user.y;
  if (38 in keysDown && user.y > 0) { // Player holding up
    user.y -= SPEED * modifier;
  }
  if (40 in keysDown && user.y < MAP_HEIGHT) { // Player holding down
    user.y += SPEED * modifier;
  }
  if (37 in keysDown && user.x > 0) { // Player holding left
    user.x -= SPEED * modifier;
  }
  if (39 in keysDown && user.x < MAP_WIDTH) { // Player holding right
    user.x += SPEED * modifier;
  }
  if (old.x != user.x || old.y != user.y) {
    socket.send(JSON.stringify(user));
    players[id] = user;
  }
}

// Create the render function
function render () {
  ctx.fillStyle = "#CC2EFA";
  ctx.fillRect(0,0,MAP_WIDTH,MAP_HEIGHT);
  for (let key in players){
    if(players.hasOwnProperty(key)){
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.font = "32px Helvetica";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(players[key].username, players[key].x, players[key].y);
    }
  }
}

// Main function
function main () {
  var now = Date.now();
  var delta = now - then;
  update(delta / 1000);
  render();
  then = now;
  requestAnimationFrame(main);
}

// Generate random coordinates inside the map
function coordinates (limit) {
  return Math.floor(Math.random() * (limit));
}

// Load canvas and username
var start = document.getElementById('start');
start.onclick = function () {
  if (!started) {
    user.username = document.getElementById('username').value;
    user.x = coordinates (MAP_WIDTH);
    user.y = coordinates (MAP_HEIGHT);
    players[id] = user;
    document.getElementById("game").appendChild(canvas);
    //document.body.appendChild(canvas);
    started = true;

    // Connect to socket

    socket = io.connect('https://rpg.fredrare.com');
    socket.on('connect',
              function() {
                print('Connected.');
              });
    socket.on('message',
              function(msg) {
                let player = JSON.parse(msg);
                players[player.id] = {
                  username : player.username,
                  x : player.x,
                  y : player.y
                };
              });
    socket.on('disconnect', function (msg) {
                console.log(msg + ' disconnected');
                delete players[msg];
              });
    socket.on('restore', function (msg) {
                msg = JSON.parse(msg);
                for (key in msg) {
                  players[key] = msg[key];
                }
                console.log('Game restored.');
              });
    socket.send(JSON.stringify(user));
    then = Date.now();
    main();
  } else {
    user.username = document.getElementById('username').value;
    players[id] = user;
    socket.send(JSON.stringify(user));
  }
}
