
import { createServer } from 'node:http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket as ServerSocket } from 'socket.io';
import EventsEmitter from '../../events/EventsEmitter';
import EventsListenersAdder from '../../events/EventsListenersAdder';
import { lobby } from '@/connection';

jest.mock('@/connection', () => ({
  lobby: { value: null },
  socket: {}
}));

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;
let eventsEmitter: EventsEmitter;
let eventsListenersAdder: EventsListenersAdder;

beforeEach(() => {
  lobby.value = null;
});

beforeAll((done) => {
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on('connection', (socket) => {
      serverSocket = socket;
    });
    clientSocket.on('connect', done);
    eventsEmitter = new EventsEmitter(clientSocket);
    eventsListenersAdder = new EventsListenersAdder(clientSocket);
  });
});

afterEach(() => {
  clientSocket.removeAllListeners();
});

afterAll(() => {
  httpServer.close();
  io.close();
  clientSocket.disconnect();
});

export { io, clientSocket, serverSocket, eventsEmitter, eventsListenersAdder };
