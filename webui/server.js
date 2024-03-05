// Load http module
let http = require("http");
let PORT = process.env.PORT || 8001;

// Load express module
let express = require("express");
let app = express();

// Create server
// Hook it up to listen to the correct PORT
let server = http.createServer(app).listen(PORT, function(){
  console.log("listening on port: ", PORT);
});

// Point my app at the public folder to serve up the index.html file
app.use(express.static("public"));

// Load the socket.io functionality
// Hook it up to the web server
let io = require("socket.io")(server);

// Listen for connections
io.on(
  "connection",
  // Callback function on connection
  // Comes back with a socket object
  function(socket) {
    console.log("HELLO", socket.id);
    
    // This connected socket listens for incoming messages called 'data'
    socket.on('data', function(data){
      
      // Log the data that came in
      console.log(data);
      
      // Send it back out to everyone
      io.emit('data', data);
    });
    
  }
);