const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// === Express setup ===
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this for security in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.get("/", (req, res) => {
  res.send("Mafia signaling server is running.");
});

// === Global player tracking ===
let players = {}; // { socketId: username }

// === WebSocket handling ===
io.on("connection", socket => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("join", room => {
    socket.join(room);
    console.log(`🧑 ${socket.id} joined room: ${room}`);
  });

  socket.on("register", ({ id, name }) => {
    players[id] = name;
    console.log(`✅ Registered ${name} (${id})`);
    io.to("mafia-room").emit("update-player-list", players);
  });

  socket.on("ready", () => {
    console.log(`🎥 ${socket.id} is ready`);
    // Future: handle media signaling here if needed
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    delete players[socket.id];
    io.to("mafia-room").emit("update-player-list", players);
  });
});

// === Start server ===
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Signaling server listening on port ${PORT}`);
});
