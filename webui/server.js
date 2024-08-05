// Load http module
let http = require("http");
let PORT = process.env.PORT || 8001;

// Load express module
let express = require("express");
let app = express();

// Create server
// Hook it up to listen to the correct PORT
let server = http.createServer(app).listen(PORT, function(){
  console.log("Server listening on port: ", PORT)
});

// Point my app at the public folder to serve up the index.html file
app.use(express.static("public"));

// Load the socket.io functionality
// Create socket server
let io = require('socket.io')(server, {
  cors: {
    origin: true
  },
  allowEIO3: true
});

// Listen for connections
io.on(
  "connection",
  // Callback function on connection
  // Comes back with a socket object
  function(socket) {
    console.log("HELLO", socket.id);
  }
);

const mqtt = require("mqtt");
const client = mqtt.connect("tcp://10.0.0.254:1883");

client.on("connect", () => {
  client.subscribe("tags", (err) => {
    if (!err) {
      console.log("Hello mqtt");
    }
  });
});

client.on("message", (topic, message) => {
  // message is Buffer
  //console.log(message.toString());
  io.emit("pozyx", JSON.parse(message.toString()));
  //client.end();
});
