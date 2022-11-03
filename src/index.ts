import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/temporaryClientTesting.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected'); // eslint-disable-line no-console

  socket.on('emit', (uid: string) => {
    console.log(`received this user id: ${uid}`); // eslint-disable-line no-console

    io.emit('notification', 'a user has joined the socket');
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected'); // eslint-disable-line no-console
  });
});

server.listen(port, () => {
  console.log(`listening on port *:${port}`); // eslint-disable-line no-console
});
