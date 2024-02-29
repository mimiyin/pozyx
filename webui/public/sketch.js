// Asking for permision for motion sensors on iOS 13+ devices
if (typeof DeviceOrientationEvent.requestPermission === 'function') {
  document.body.addEventListener('click', function () {
    DeviceOrientationEvent.requestPermission();
    DeviceMotionEvent.requestPermission();
  })
}

// Open and connect socket
let socket = io();
let y = 0;

// Listen for when the socket connects
socket.on('connect', function(){
  // Log a success message
  console.log("HEY I'VE CONNECTED");
});

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Listen for data coming from the server
  socket.on('data', function(data){
    // Log the data
    console.log('Received data: ', data);
    // Draw a circle at the y-position of the other user
    ellipse(width/2, y, 10, 10);    
  })
}


function draw() {
  background('white');
  // Get the left-right rotation of the phone
  // Map it to the width of the canvas
  let x = map(rotationY, -90, 90, 0, width);
  
  // Get the top-bottom rotation of the phone
  // Map it to the height of the canvas
  y = map(rotationX, -90, 90, 0, height);
  
  // Draw an ellipse at x,y
  // ellipse(x, y, 50, 50);  
  
  // Send data to the server
  socket.emit('data', 300);
}




