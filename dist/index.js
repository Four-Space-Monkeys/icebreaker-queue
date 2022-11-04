"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const port = 3000;
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
const queue = {};
function deleteFromQueueAndDisconnect(uid) {
    queue[uid].disconnect();
    delete queue[uid];
}
function match(uid1, uid2) {
    console.log(`matching ${uid1} and ${uid1}`);
    io.to(queue[uid1].id).emit('match-found', `matched with ${uid2}`);
    io.to(queue[uid2].id).emit('match-found', `matched with ${uid1}`);
    deleteFromQueueAndDisconnect(uid1);
    deleteFromQueueAndDisconnect(uid2);
}
function tryFindMatch(q) {
    const uids = Object.keys(q);
    if (uids.length >= 2) {
        match(uids[0], uids[1]);
    }
}
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/temporaryClientTesting.html'));
});
io.on('connection', (socket) => {
    console.log('a user connected'); // eslint-disable-line no-console
    socket.on('add-uid-to-queue', (uid) => {
        queue[uid] = socket;
        tryFindMatch(queue);
        console.log('queue:', Object.keys(queue));
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected'); // eslint-disable-line no-console
    });
});
server.listen(port, () => {
    console.log(`listening on port *:${port}`); // eslint-disable-line no-console
});
//# sourceMappingURL=index.js.map