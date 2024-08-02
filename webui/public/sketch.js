// Open and connect socket
let socket = io();
let tags = {};

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
const osc = audioCtx.createOscillator();

// Base frequency
let base = 200;

// Ratios for diatonic scale
let ratios = [{
  num: 1,
  den: 1
}, {
  num: 9,
  den: 8
}, {
  num: 5,
  den: 4
}, {
  num: 4,
  den: 3
}, {
  num: 3,
  den: 2
}, {
  num: 5,
  den: 3
}, {
  num: 15,
  den: 8
}, {
  num: 2,
  den: 1
}, ]

let angles = [ 0, 45, 90, 120, 180, 240, 315]

// Remembering where we are
let o = 0;
let po = 0;
let a;
let pr = 1;
let rate = 1;
let prate = 1;

let crossedCW = false;
let crossedCCW = false;



// Listen for when the socket connects
socket.on('connect', function() {
  // Log a success message
  console.log("HEY I'VE CONNECTED");
});

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Listen for data coming from the server
  socket.on('message', function(message) {
    // Log the data
    //console.log('Received message: ', message);
    // Draw a circle at the y-position of the other user
    let id = message.id;
    let ts = message.ts;
    let x = message.x / 10;
    let y = message.y / 10;

    console.log(message);

    tags[id] = {
      ts: ts,
      x: x,
      y: y
    }
  });

  textSize(10);
  textAlign(RIGHT, BOTTOM);

  a = createVector(0, 1);

  //osc = new p5.Oscillator('sine');
}


function mousePressed() {

  osc.type = "sine";
  osc.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
  osc.connect(audioCtx.destination);
  osc.start();

  // osc.freq(440);
  // osc.amp(1);
  // osc.start();
}

function draw() {
  background(255);
  rotate(0);
  translate(width / 2, height);
  scale(1, -1);
  let count = 0;
  let pair = [];
  for (let id in tags) {
    let tag = tags[id];
    let x = tag.x;
    let y = tag.y;
    stroke('black');
    fill('black');
    text(tag.id, tag.x, tag.y);
    fill(count == 0 ? 'red' : 'blue');
    pair[count] = {
      x: x,
      y: y
    };
    push();
    translate(x,y);
    noStroke();
    ellipse(0, 0, 30, 30);
    pop();
    count++;
  }
  if (pair.length > 1) {
    stroke(0);
    line(pair[0].x, pair[0].y, pair[1].x, pair[1].y)

    let ox = (pair[0].x - pair[1].x);
    let oy = (pair[0].y - pair[1].y);

    o = createVector(ox, oy).heading();
    push();
    translate(pair[0].x, pair[0].y);
    rotate(o-PI/4);
    strokeWeight(3);
    line(0, 0, 30, 30);
    pop();
    o-=PI;
    updateRate();
    //console.log(o, rate);
    osc.frequency.setValueAtTime(rate, audioCtx.currentTime); // value in hertz
    //console.log(o);
  }

  // let center = createVector(width/2, height/2);
  // let mouse = createVector(mouseX, mouseY);
  // let v = mouse.sub(center);
  //
  // line(center.x, center.y, mouseX, mouseY);
  // o = v.heading();
  // updateRate();
  // console.log(o, rate);
  // osc.frequency.setValueAtTime(rate, audioCtx.currentTime); // value in hertz
}

function mapRate(o) {
  // Map pitch
  let r = map(o, 0, 360, 1, 2);

  // Snap to closest diatonic note
  let closest = 10;
  let nr = r;
  for (let ratio of ratios) {
    let _r = ratio.num / ratio.den;
    let dr = abs(r - _r);
    if (dr < closest) {
      nr = _r;
      closest = dr;
    }
  }
  // Snap to closest r
  return nr;
}

function updateRate() {

  // Remap orientation from board
  o = map(o, -PI, PI, 360, 0);

  // Wrap around
  if (o > 360) o = o - 360;

  // Remember for next time
  po = o;

  // Calculate change in orientation
  let b = createVector(sin(o), cos(o));
  let ab = b.angleBetween(a);
  a = b;

  // Ignore minor changes
  if (abs(ab) < 0.0175) {
    //console.log("Did not rotate enough.");
    return false;
  }

  // Shifted
  //console.log("TURNED");

  // Calculate direction
  // -1 is CCW, 1 is CW
  let dir = ab / abs(ab);

  //console.log("DIR", dir, "AB", ab);

  let r = mapRate(o);

  // Ignore no change in note
  if (r == pr) {
    //console.log("Did not change notes.");
    return false;
  }

  // // New note
  // //console.log("NEW NOTE");
  // // Going right and rate gets lower
  // let crossedCW = dir > 0 && r < pr;
  // // Going left and rate gets higher
  // let crossedCCW = dir < 0 && r > pr;
  //
  //
  // if (crossedCCW) {
  //   console.log("Crossed CCW");
  //   base /= 2;
  // }
  // else if (crossedCW) {
  //   console.log("Crossed CCW");
  //   base *= 2;
  // }
  //
  // // cross CCW
  // // true, true, 2, 1
  // console.log("CROSSED", dir, r, pr);

  // Remember for next time
  pr = r;

  // Calculate rate
  rate = base * r;
  //console.log("BASE | RATE | O ", nfs(this.base, 0, 2), nfs(this.rate, 0, 2), nfs(o, 0, 2));

  if (abs(rate - prate) < 0.01) return false;

  // Remember rate for next time
  prate = rate;

  return true;

}
