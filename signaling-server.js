const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Mafia signaling server is running.");
});

let players = {};

io.on("connection", socket => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join", room => {
    socket.join(room);
    console.log(`🧑 ${socket.id} joined room: ${room}`);
  });

  socket.on("register", ({ id, name }) => {
    players[id] = name;
    console.log(`✅ Registered ${name} (${id})`);
    console.log("📢 Broadcasting players:", players);
    io.to("mafia-room").emit("update-player-list", players);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    delete players[socket.id];
    io.to("mafia-room").emit("update-player-list", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server listening on port ${PORT}`);
});
