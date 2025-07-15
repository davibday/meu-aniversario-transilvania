
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

app.use(express.static(path.join(__dirname, '/')));

io.on('connection', (socket) => {
  socket.on('setUsername', (name) => {
    users[socket.id] = name;
    io.emit('userList', Object.values(users));
  });

  socket.on('chatMessage', (msg) => {
    // msg deve ter formato { user, text }
    io.emit('chatMessage', msg);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('userList', Object.values(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
