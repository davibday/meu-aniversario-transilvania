
// servidor.js
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
  let username = '';

  socket.on('setUsername', (name) => {
    username = name;
    users.add(name);
    io.emit('userList', Array.from(users));
  });

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', { user: username, text: msg });
  });

  socket.on('disconnect', () => {
    users.delete(username);
    io.emit('userList', Array.from(users));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
