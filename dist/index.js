"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const port = 7777;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000', // client url
    },
});
const queue = {};
function match(uid1, uid2) {
    console.log(`matching ${uid1} and ${uid2}`);
    io.to(queue[uid1].id).emit('match-found', uid2);
    io.to(queue[uid2].id).emit('match-found', uid1);
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
    let clientUid;
    socket.on('add-uid-to-queue', (uid) => {
        if (clientUid)
            return; // only allow one queue slot per client
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
//# sourceMappingURL=index.js.map