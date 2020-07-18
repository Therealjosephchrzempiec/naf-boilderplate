const db = require("./db");
const { uuid } = require('uuidv4');

function socket(io){
  
const rooms = {};

io.on("connection", socket => {
  
  console.log("user connected", socket.id);

  let curRoom = null;

  socket.on("joinRoom", data => {
    const { room } = data;

    if (!rooms[room]) {
      rooms[room] = {
        name: room,
        occupants: {},
      };
    }

    const joinedTime = Date.now();
    rooms[room].occupants[socket.id] = joinedTime;
    curRoom = room;

    console.log(`${socket.id} joined room ${room}`);
    socket.join(room);

    socket.emit("connectSuccess", { joinedTime });
    const occupants = rooms[room].occupants;
    io.in(curRoom).emit("occupantsChanged", { occupants });
  });

  socket.on("send", data => {
    io.to(data.to).emit("send", data);
  });

  socket.on("broadcast", data => {
    socket.to(curRoom).broadcast.emit("broadcast", data);
  });

  socket.on("disconnect", () => {
    
    db.get("users")
              .find({ name: socket.name })
              .assign({ isPlaying: false })
              .write();
    
    console.log('disconnected: ', socket.id, curRoom);
    
    if (rooms[curRoom]) {
      console.log("user disconnected", socket.id);

      delete rooms[curRoom].occupants[socket.id];
      const occupants = rooms[curRoom].occupants;
      socket.to(curRoom).broadcast.emit("occupantsChanged", { occupants });

      if (occupants == {}) {
        console.log("everybody left room");
        delete rooms[curRoom];
      }
    }
    
    
  });
  
  socket.on("login", function(data) {
      console.log(
        `User attempting to login with name: ${data.name} and password: ${data.pw}`
      );
      let user = db.get("users").find({ name: data.name, pw: data.pw });

      if (user.value()) {
        if (user.value().isPlaying) {
          socket.emit("login-results", {
            success: false,
            name: "cheater",
            msg: "You are already logged in!"
          });
          console.log(
            `${
              user.value().name
            } has provided valid login credentials but is already playing. :(`
          );
          return;
        }
        console.log(
          `${user.value().name} has provided valid login credentials.`
        );
        socket.auth = true;
        socket.name = data.name;
        user.assign({ isPlaying: true }).write();
        socket.dbid = user.value().id;
        socket.emit("login-results", { success: true, name: data.name });
      } else {
        console.log(
          "Failed login attempt. 30 seconds before socket is disconnected."
        );
        socket.emit("login-results", {
          success: false,
          msg: "Invalid credentials!"
        });
        setTimeout(() => {
          if (!socket.auth) socket.disconnect(true);
        }, 30000);
      }
    });
  
  socket.on("add-user", function(data, cb) {
      const adminKey = db
        .get("users")
        .find({ name: "admin" })
        .value().pw;
      if (data.key == adminKey) {
        if (
          db
            .get("users")
            .find({ name: data.name })
            .value()
        ) {
          let msg = "User cannot be added. Name already exists in database.";
          console.log(msg);
          if (typeof cb == "function") cb("fail");
          return;
        }
        let result = db
          .get("users")
          .push({
            id: uuid(),
            name: data.name,
            pw: data.pw,
            isPlaying: false
          })
          .write();
        if (result) {
          let msg = "User successfully added to database";
          console.log(msg);
          if (typeof cb == "function") cb("success");
        } else {
          let msg = "Error adding user to database";
          console.log(msg);
          if (typeof cb == "function") cb("fail");
        }
      } else {
        socket.emit("log", "Invalid key submitted.");
        if (typeof cb == "function") cb("fail");
      }
    });
  
});
   
  
}

module.exports = socket