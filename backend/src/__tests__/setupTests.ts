
import { createServer } from "node:http";
import { AddressInfo } from "net";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import { lobbys, players } from "../global";
import Player from "../interfaces/Player";
import EventsEmitter from "../events/Emitter";

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;
let player: Player;
let eventsEmitter: EventsEmitter;

beforeAll((done) => {
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on("connection", (socket) => {
      serverSocket = socket;
      eventsEmitter = new EventsEmitter(io, serverSocket);
      player = {
        playerId: clientSocket.id as string,
        eventsEmitter: new EventsEmitter(io, serverSocket),
      };
    });
    clientSocket.on("connect", done);
  });
});

afterEach(() => {
  for (let lobby in lobbys) {
    delete lobbys[lobby];
  }
  for (let player in players) {
    delete players[player];
  }
  clientSocket.removeAllListeners();
});

afterAll(() => {
  httpServer.close()
  io.close();
  clientSocket.disconnect();
});

export { io, clientSocket, serverSocket, player, eventsEmitter };
