// Load required modules
const http = require("http"); // http server core module
const path = require("path");
const express = require("express"); // web framework external module



// Set process name
process.title = "networked-aframe-server";

// Get port or default to 8080
const port = process.env.PORT || 8080;

// Setup and configure Express http server.
const app = express();


app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// Start Express http server
const webServer = http.createServer(app);
const io = require("socket.io")(webServer);

require('./socket')(io)

webServer.listen(port, () => {
  console.log("listening on port" + port);
});
