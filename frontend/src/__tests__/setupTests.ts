
import { createServer } from "node:http";
import { AddressInfo } from "net";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import "../global"
import EventsEmitter from "../events/Emitter"

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;

beforeAll((done) => {
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    globalThis.player = {
      socket: clientSocket,
      eventsEmitter: EventsEmitter
    }
    clientSocket.on("connect", done);
  });
});

afterEach(() => {
  clientSocket.removeAllListeners();
});

afterAll(() => {
  httpServer.close()
  io.close();
  clientSocket.disconnect();
});

export { io, clientSocket, serverSocket };
