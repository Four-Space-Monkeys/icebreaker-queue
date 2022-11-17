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

interface UsersInQueue {
  [uid: string]: {
    firstName: string;
    queuedInterests: number[];
    socket: Socket;
  };
}

interface Queue {
  [interestId: string]: number[];
}

// key: uid
// value: array of users queued interests
const usersInQueue: UsersInQueue = {};

// key: interestId
// value: array of userIds queued for interest
const queue: Queue = {};

function addUserToQueue(
  uid: number,
  firstName: string,
  socket: Socket,
  selectedInterestIds: number[],
) {
  usersInQueue[uid] = {
    firstName,
    queuedInterests: selectedInterestIds,
    socket,
  };

  selectedInterestIds.forEach((interestId) => {
    if (queue[interestId] === undefined) {
      queue[interestId] = [];
    }

    queue[interestId].push(uid);
  });

  console.log(usersInQueue);
  console.log(queue);
}

function removeUserFromQueue(uid: number) {
  const userQueuedInterests = usersInQueue[uid].queuedInterests;

  userQueuedInterests.forEach((interestId) => {
    queue[interestId] = queue[interestId].filter((userInQueueId) => userInQueueId !== uid);
  });

  delete usersInQueue[uid];

  console.log(usersInQueue);
  console.log(queue);
}

function matchUsers(interestId: number, uid1: number, uid2: number) {
  const channel = generateChannel();
  const token1 = generateToken(uid1, channel);
  const token2 = generateToken(uid2, channel);

  const roomInfo = {
    matchInterestId: interestId,
    channel,
  };

  io.to(usersInQueue[uid1].socket.id).emit('match-found', {
    ...roomInfo,
    token: token1,
    matchFirstName: usersInQueue[uid2].firstName,
  });
  io.to(usersInQueue[uid2].socket.id).emit('match-found', {
    ...roomInfo,
    token: token2,
    matchFirstName: usersInQueue[uid1].firstName,
  });

  usersInQueue[uid1].socket.disconnect();
  usersInQueue[uid2].socket.disconnect();
}

function findMatches() {
  Object.keys(queue).forEach((interestId) => {
    console.log('looking at interest id', interestId);
    const usersInInterestQueue = queue[interestId];
    if (usersInInterestQueue.length > 1) {
      // has to be synchronous so that users queueing for multiple interest
      // don't get matched to multiple different calls / or await this if async
      matchUsers(Number(interestId), usersInInterestQueue[0], usersInInterestQueue[1]);
    }
  });
}

io.on('connection', (socket) => {
  console.log('a client connected');

  let uid: number;

  socket.on('join-queue', (data: {
    uid: number;
    firstName: string;
    selectedInterestIds: number[];
  }) => {
    uid = data.uid;

    addUserToQueue(data.uid, data.firstName, socket, data.selectedInterestIds);

    findMatches();
  });

  socket.on('disconnect', () => {
    console.log('a client disconnected');

    removeUserFromQueue(uid);
  });
});

server.listen(port, () => {
  console.log(`listening on port *:${port}`);
});
