import express from 'express';
import http from 'http';
import path from 'path';
import { Server, Socket } from 'socket.io';

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server);

type Queue = { [uid: string]: Socket };

const queue: Queue = {};

function deleteFromQueueAndDisconnect(uid: string) {
  queue[uid].disconnect();
  delete queue[uid];
}

function match(uid1: string, uid2: string) {
  console.log(`matching ${uid1} and ${uid1}`);
  io.to(queue[uid1].id).emit('match-found', `matched with ${uid2}`);
  io.to(queue[uid2].id).emit('match-found', `matched with ${uid1}`);
  deleteFromQueueAndDisconnect(uid1);
  deleteFromQueueAndDisconnect(uid2);
}

function tryFindMatch(q: Queue) {
  const uids = Object.keys(q);
  if (uids.length >= 2) {
    match(uids[0], uids[1]);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/temporaryClientTesting.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected'); // eslint-disable-line no-console

  socket.on('add-uid-to-queue', (uid: string) => {
    queue[uid] = socket;
    tryFindMatch(queue);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected'); // eslint-disable-line no-console
  });
});

server.listen(port, () => {
  console.log(`listening on port *:${port}`); // eslint-disable-line no-console
});
