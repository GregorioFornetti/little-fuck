
import { addDebugEmitAfterEachEmit } from "../../../debug/addDebugEmitAfterEachEmit"

import { createServer } from 'node:http';
import { AddressInfo } from 'net';
import { io as ioc, Socket as ClientSocket } from 'socket.io-client';
import { Server, Socket as ServerSocket } from 'socket.io';
import { lobbys, players } from '../../../global';

const httpServer = createServer();
let io: Server;
let clientSocket: ClientSocket;
let serverSocket: ServerSocket;

beforeAll((done) => {
  io = new Server(httpServer);
  addDebugEmitAfterEachEmit(io)
  httpServer.listen(() => {
    const port = (httpServer.address() as AddressInfo).port;
    clientSocket = ioc(`http://localhost:${port}`);
    io.on('connection', (socket) => {
      serverSocket = socket;
    });
    clientSocket.on('connect', () => done());
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
  clientSocket.removeAllListeners('player-join');
});

afterAll(() => {
  httpServer.close();
  io.close();
  clientSocket.disconnect();
});

describe('addDebugEmitAfterEachEmit', () => {

    test('Deve emitir evento debug após cada evento emitido', (done) => {

        players[serverSocket.id] = {
            socket: serverSocket
        }

        serverSocket.emit('test')
        clientSocket.on('debug', (lobby: any) => {
            done()
        })
    })

    test('Deve emitir o evento de debug com o lobby correto', (done) => {
            
        players[serverSocket.id] = {
            socket: serverSocket,
            lobby: {
                lobbyId: '123',
                players: []
            }
        }

        serverSocket.emit('test')
        clientSocket.on('debug', (lobby: any) => {
            expect(lobby.lobbyId).toBe('123')
            expect(lobby.players).toStrictEqual([])
            done()
        })
    })
})