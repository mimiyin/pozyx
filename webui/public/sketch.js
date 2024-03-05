// Asking for permision for motion sensors on iOS 13+ devices
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  document.body.addEventListener('click', function () {
    DeviceOrientationEvent.requestPermission();
    DeviceMotionEvent.requestPermission();
  })
}

// Open and connect socket
let socket = io();
let tags = {};

// Listen for when the socket connects
socket.on('connect', function(){
  // Log a success message
  console.log("HEY I'VE CONNECTED");
});

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Listen for data coming from the server
  socket.on('message', function(message){
    // Log the data
    console.log('Received message: ', message);
    // Draw a circle at the y-position of the other user
    let id = message.id;
    let ts = message.ts;
    let x = message.x;
    let y = message.y;

    tags[id] = { ts : ts, x : x, y : y }
  });

  textSize(10);
  textAlign(RIGHT, BOTTOM);
}


function draw() {
  background('white');
  fill('red');
  noStroke();
  for(let id in tags) {
    let tag = tags[id];
    text(tag.id, tag.x, tag.y);
    ellipse(tag.x, tag.y, 10, 10);
  }
}
