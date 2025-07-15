
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = new Set();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('setUsername', (name) => {
    socket.username = name;
    users.add(name);
    io.emit('userList', Array.from(users));
  });

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', { user: socket.username || 'Anônimo', text: msg });
  });

  socket.on('disconnect', () => {
    users.delete(socket.username);
    io.emit('userList', Array.from(users));
    socket.broadcast.emit('user-disconnected', socket.id);
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', { id: socket.id, ...data });
  });

  socket.on('answer', (data) => {
    socket.to(data.to).emit('answer', { id: socket.id, sdp: data.sdp });
  });

  socket.on('candidate', (data) => {
    socket.to(data.to).emit('candidate', { id: socket.id, candidate: data.candidate });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
