/* eslint-disable no-console */
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import generateChannel from './generateChannel';
import generateToken from './generateToken';

const app = express();
const port = 7777;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // client url
  },
});

const queue: { [uid: string]: Socket } = {};

function match(uid1: string, uid2: string) {
  console.log(`matching ${uid1} and ${uid2}`);
  const channel = generateChannel();
  io.to(queue[uid1].id).emit('match-found', JSON.stringify({
    channel,
    token: generateToken(Number(uid1), channel),
  }));
  io.to(queue[uid2].id).emit('match-found', JSON.stringify({
    channel,
    token: generateToken(Number(uid2), channel),
  }));
  queue[uid1].disconnect();
  queue[uid2].disconnect();
}

function tryFindMatch() {
  const uids = Object.keys(queue);
  if (uids.length >= 2) {
    match(uids[0], uids[1]);
  }
}

io.on('connection', (socket) => {
  console.log('a client connected');

  let clientUid: string;

  socket.on('add-uid-to-queue', (uid: string) => {
    if (clientUid) return; // only allow one queue slot per connection - just to make sure
    console.log(`${uid} joined the queue`);
    queue[uid] = socket;
    console.log('new queue:', Object.keys(queue));
    clientUid = uid;
    tryFindMatch();
  });

  socket.on('disconnect', () => {
    console.log('a client disconnected');
    delete queue[clientUid];
    console.log('new queue:', Object.keys(queue));
  });
});

server.listen(port, () => {
  console.log(`listening on port *:${port}`);
});
