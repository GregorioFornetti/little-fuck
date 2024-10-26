import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import addEventsListeners from './events/addEventsListeners';
import { players } from './global';

dotenv.config();

const app = express();
const server = createServer(app);
const cors = process.env.NODE_ENV === 'production' ? {} : { cors: { origin: 'http://localhost:5173' } };
const io = new Server(server, {
  ...cors,
  path: process.env.SERVER_PATH ? `${process.env.SERVER_PATH}/socket.io` : '/socket.io'
});

const port = process.env.PORT || 3000;

app.use(process.env.SERVER_PATH || '/', express.static('../frontend/dist'));

io.on('connection', (socket) => {
  players[socket.id] = { socket: socket };
  addEventsListeners(io, socket);
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export { io };
