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

function broadcastPlayerList() {
  io.to("mafia-room").emit("update-player-list", players);
  if (Object.keys(players).length === 3) {
    console.log("🟢 3 players joined. Starting countdown.");
    io.to("mafia-room").emit("start-countdown");
  }
}

io.on("connection", socket => {
  console.log("🔌 Connected:", socket.id);

  socket.on("join", room => {
    socket.join(room);
    console.log(`🧑 ${socket.id} joined ${room}`);
  });

  socket.on("register", ({ id, name }) => {
    players[id] = name;
    broadcastPlayerList();
  });

  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.id);
    delete players[socket.id];
    broadcastPlayerList();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
