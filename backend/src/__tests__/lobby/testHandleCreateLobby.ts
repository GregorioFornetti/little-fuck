
import { createServer } from "node:http";
import { AddressInfo } from "net";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { Server, Socket as ServerSocket } from "socket.io";
import { lobbys, players } from "../../global";
import { handleCreateLobby } from "../../events/lobby/eventsHandlers";
import Player from "../../interfaces/Player";
import EventsEmitter from "../../events/Emitter";
import Lobby from "../../interfaces/Lobby";


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
  });

  beforeEach(() => {
    for (let lobby in lobbys) {
      delete lobbys[lobby]
    }
    for (let player in players) {
      delete players[player]
    }
    clientSocket.removeAllListeners()
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });


  
  test("Nome vazio deve emitir erro", (done) => {
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      expect(lobbys).toEqual({});
      expect(players).toEqual({});
      done();
    })

    handleCreateLobby(player, '');
  });

  test("Nome apenas com espaços deve emitir erro", (done) => {
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('no-name');
      expect(lobbys).toEqual({});
      expect(players).toEqual({});
      done();
    })

    handleCreateLobby(player, '       ');
  });

  test("Criar lobby com nome válido", (done) => {
    clientSocket.on('join-lobby-success', (lobby: Lobby) => {
      console.log('oi2')
      // Verifica se as informações do lobby foram enviadas corretamente para o jogador
      expect(lobby.lobbyId).toBeDefined();
      expect(lobby.players).toHaveLength(1);
      expect(lobby.players[0].id).toBe(player.playerId);
      expect(lobby.players[0].name).toBe('player1');
      expect(lobby.players[0].leader).toBe(true);
      expect(lobby.players[0].ready).toBe(false);
      expect(lobby.game).toBeUndefined();

      // Verifica se as informações do lobby foram salvas corretamente no servidor
      expect(lobbys[lobby.lobbyId]).toEqual(lobby);
      expect(players[player.playerId]).toEqual(lobby);

      done();
    })

    handleCreateLobby(player, 'player1');
  });

  test("Criar lobby com jogador já em outro lobby deve emitir erro", (done) => {

    // A primeira vez chamando handleCreateLobby deve ser bem sucedida
    clientSocket.on('join-lobby-success', (lobby: Lobby) => {
      player.lobby = lobby;
      handleCreateLobby(player, 'player1');
    })

    // A segunda vez chamando handleCreateLobby deve emitir erro
    clientSocket.on('join-lobby-error', (errorType: string) => {
      expect(errorType).toBe('player-already-in-lobby');
      done();
    })

    handleCreateLobby(player, 'player1');
  });
});