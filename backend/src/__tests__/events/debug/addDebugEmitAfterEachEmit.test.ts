import Lobby from '../../../interfaces/Lobby';

import { addDebugEmitAfterEachEmit } from '../../../debug/addDebugEmitAfterEachEmit';

import { createServer } from 'node:http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket as ServerSocket } from 'socket.io';
import { lobbys, players } from '../../../global';

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;

function instancianteSockets(onDone: () => void, useAddDebug: boolean) {
  io = new Server(httpServer);
  if (useAddDebug) {
    addDebugEmitAfterEachEmit(io); // Essa função adiciona um middleware que emite um evento 'debug' após cada evento emitido. Por isso precisa ser chamada antes de instanciar os sockets.
  }
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on('connection', (socket) => {
      serverSocket = socket;
      onDone();
    });
    clientSocket.on('connect', () => {});
  });
}

afterEach(() => {
  for (const lobby in lobbys) {
    delete lobbys[lobby];
  }
  for (const player in players) {
    delete players[player];
  }
  clientSocket.removeAllListeners();
  clientSocket.removeAllListeners('player-join');

  httpServer.close();
  io.close();
  clientSocket.disconnect();
});

describe('addDebugEmitAfterEachEmit', () => {

  test('Deve emitir evento debug após cada evento emitido', (done) => {
    instancianteSockets(() => {
      players[serverSocket.id] = {
        socket: serverSocket
      };

      serverSocket.emit('test');
      clientSocket.on('debug', (_lobby: Lobby) => {
        done();
      });

    }, true);
  });

  test('Deve emitir o evento de debug com o lobby correto', (done) => {

    instancianteSockets(() => {
      players[serverSocket.id] = {
        socket: serverSocket,
        lobby: {
          lobbyId: '123',
          players: []
        }
      };

      serverSocket.emit('test');
      clientSocket.on('debug', (lobby: Lobby) => {
        expect(lobby.lobbyId).toBe('123');
        expect(lobby.players).toStrictEqual([]);
        done();
      });
    }, true);
  });

  test('Não deve emitir o evento de debug se não for cadastrado o middleware', (done) => {
    instancianteSockets(() => {
      players[serverSocket.id] = {
        socket: serverSocket
      };

      serverSocket.emit('test');
      clientSocket.on('debug', (_lobby: Lobby) => {
        fail('Não deveria ter emitido o evento debug');
      });

      setTimeout(() => {
        done();
      }, 1000);
    }, false);
  });
});
