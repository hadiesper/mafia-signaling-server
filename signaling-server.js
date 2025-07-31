
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", socket => {
  console.log("User connected: " + socket.id);

  socket.on("join", room => {
    socket.join(room);
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", {
      from: socket.id,
      offer: data.offer
    });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", {
      from: socket.id,
      answer: data.answer
    });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", {
      from: socket.id,
      candidate: data.candidate
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Signaling server running on port " + PORT));
