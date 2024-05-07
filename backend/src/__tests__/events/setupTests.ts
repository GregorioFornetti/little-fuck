
import { createServer } from "node:http";
import { AddressInfo } from "net";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import { lobbys, players } from "../../global";
import Player from "../../interfaces/Player";
import EventsEmitter from "../../events/Emitter";

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;
let player: Player;
let eventsEmitter: EventsEmitter;
let lobbyClientsSockets: ClientSocket[] = [];
let lobbyServerSockets: ServerSocket[] = [];

beforeAll((done) => {
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on("connection", (socket) => {
      if (serverSocket) {
        lobbyServerSockets.push(socket);
        return;
      }
      serverSocket = socket;
      eventsEmitter = new EventsEmitter(io, serverSocket);
      player = {
        playerId: clientSocket.id as string,
        socket: serverSocket,
        io: io,
        eventsEmitter: new EventsEmitter(io, serverSocket),
      };
    });
    const handleConnect = () => {
      if (lobbyClientsSockets.length === 2) {
        done();
        return;
      }
      player = {
        playerId: clientSocket.id as string,
        socket: serverSocket,
        io: io,
        eventsEmitter: new EventsEmitter(io, serverSocket),
      };
      lobbyClientsSockets.push(ioc(`http://localhost:${port}`));
      lobbyClientsSockets[lobbyClientsSockets.length - 1].on("connect", handleConnect);
    }
    clientSocket.on("connect", handleConnect);
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
  for (let socket of lobbyClientsSockets) {
    socket.removeAllListeners();
  }
  clientSocket.removeAllListeners('player-join');
  lobbyClientsSockets[0].removeAllListeners('player-join');
});

afterAll(() => {
  httpServer.close()
  io.close();
  clientSocket.disconnect();
  for (let socket of lobbyClientsSockets) {
    socket.disconnect()
  }
});

export { io, clientSocket, serverSocket, player, eventsEmitter, lobbyClientsSockets, lobbyServerSockets };
