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
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '/temporaryClientTesting.html'));
});
io.on('connection', (socket) => {
    console.log('a user connected'); // eslint-disable-line no-console
    socket.on('emit', (uid) => {
        console.log(`recieved this user id: ${uid}`); // eslint-disable-line no-console
        io.emit('notification', 'a user has joined the socket');
    });
    socket.on('disconnect', () => {
        console.log('a user disconnected'); // eslint-disable-line no-console
    });
});
server.listen(port, () => {
    console.log(`listening on port *:${port}`); // eslint-disable-line no-console
});
//# sourceMappingURL=index.js.map