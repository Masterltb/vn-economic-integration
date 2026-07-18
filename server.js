import fs from 'fs';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let activeUsers = 0;
let totalVisits = 0;
let quizCompleted = 0;

const DATA_FILE = './stats.json';
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    totalVisits = data.totalVisits || 0;
    quizCompleted = data.quizCompleted || 0;
  } catch (e) {
    console.error("Error reading stats.json", e);
  }
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ totalVisits, quizCompleted }));
}

io.on('connection', (socket) => {
  activeUsers++;
  totalVisits++;
  saveData();
  
  console.log(`User connected. Active: ${activeUsers}, Total: ${totalVisits}, Quizzes: ${quizCompleted}`);
  io.emit('stats', { activeUsers, totalVisits, quizCompleted });

  socket.on('quiz_completed', () => {
    quizCompleted++;
    saveData();
    console.log(`Quiz completed! Total quizzes: ${quizCompleted}`);
    io.emit('stats', { activeUsers, totalVisits, quizCompleted });
  });

  socket.on('disconnect', () => {
    activeUsers--;
    console.log(`User disconnected. Active: ${activeUsers}`);
    io.emit('stats', { activeUsers, totalVisits, quizCompleted });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Real-time tracking server running on port ${PORT}`);
});
