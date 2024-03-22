
import { createServer } from "node:http";
import { AddressInfo } from "net";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import { lobbys, players } from "../../global";
import { handleCreateLobby } from "../../events/lobby/eventsHandlers";
import Player from "../../interfaces/Player";
import EventsEmitter from "../../events/Emitter";


function waitFor(socket: ServerSocket | ClientSocket, event: string) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}


describe("handleCreateLobby", () => {
  let io: Server
  let clientSocket: ClientSocket
  let serverSocket: ServerSocket
  let player: Player

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = ioc(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
        player = {
          playerId: clientSocket.id as string,
          eventsEmitter: new EventsEmitter(io, serverSocket),
        }
      });
      clientSocket.on("connect", done);
    });

    for (let lobby in lobbys) {
      delete lobbys[lobby]
    }
    for (let player in players) {
      delete players[player]
    }
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });


  
  test("Nome vazio deve emitir erro", (done) => {
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      done();
    })

    handleCreateLobby(player, '');
  });
});