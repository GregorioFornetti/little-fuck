
import { createServer } from 'node:http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket as ServerSocket } from 'socket.io';
import { lobbys, players } from '../../global';
import Player from '../../interfaces/Player';
import EventsEmitter from '../../events/Emitter';

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;
let player: Player;
let eventsEmitter: EventsEmitter;
const lobbyClientsSockets: ClientSocket[] = [];
const lobbyServerSockets: ServerSocket[] = [];

beforeAll((done) => {
  io = new Server(httpServer);
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on('connection', (socket) => {
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
      lobbyClientsSockets[lobbyClientsSockets.length - 1].on('connect', handleConnect);
    };
    clientSocket.on('connect', handleConnect);
  });
});

afterEach(() => {
  for (const lobby in lobbys) {
    delete lobbys[lobby];
  }
  for (const player in players) {
    delete players[player];
  }
  clientSocket.removeAllListeners();
  for (const socket of lobbyClientsSockets) {
    socket.removeAllListeners();
  }
  clientSocket.removeAllListeners('player-join');
  lobbyClientsSockets[0].removeAllListeners('player-join');

  player.lobby = undefined;
  player.eventsEmitter = new EventsEmitter(io, player.socket);
});

afterAll(() => {
  httpServer.close();
  io.close();
  clientSocket.disconnect();
  for (const socket of lobbyClientsSockets) {
    socket.disconnect();
  }
});

function createLobby() {
  lobbys['123'] = {
    lobbyId: '123',
    players: [
      {
        id: player.playerId,
        name: 'player1',
        leader: true,
        ready: true,
      },
      {
        id: lobbyServerSockets[0].id!,
        name: 'player2',
        leader: false,
        ready: true
      }
    ]
  };
  player.lobby = lobbys['123'];
  player.eventsEmitter = new EventsEmitter(io, player.socket, '123');
  players[player.playerId] = { socket: player.socket, lobby: lobbys['123'] };
  players[lobbyServerSockets[0].id!] = { socket: lobbyServerSockets[0], lobby: lobbys['123'] };
}

export { io, clientSocket, serverSocket, player, eventsEmitter, lobbyClientsSockets, lobbyServerSockets, createLobby };
