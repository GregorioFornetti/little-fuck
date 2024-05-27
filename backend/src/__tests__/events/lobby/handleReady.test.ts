import { clientSocket, player, io, serverSocket } from "../setupTests";
import type Lobby from "../../../interfaces/Lobby";
import { Game } from "../../../interfaces/Lobby";
import Player from "../../../interfaces/Player";
import { lobbys, players } from "../../../global";
import { handleReady } from "../../../events/lobby/handlers/ready";
import EventsEmitter from "../../../events/Emitter";

describe("handleReady", () => {
  const leaderPlayer = {
    id: '12345',
    name: 'leader player',
    leader: true,
    ready: true
  };
  
  const anotherPlayer = {
    id: '123',
    name: 'John joe',
    leader: false,
    ready: false
  };

  function createLobby(player: Player, lobby: Lobby) {
    player.lobby = lobby;
    player.eventsEmitter = new EventsEmitter(io, serverSocket, lobby.lobbyId);
    lobbys[lobby.lobbyId] = lobby;
    players[player.playerId] = lobby;
  }

  test("Deve atualizar os valores do jogador para preparado", (done) => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        currentPlayer,
        anotherPlayer
      ]
    };

    createLobby(player, lobby);

    clientSocket.on('player-ready', (playerId) => {
      expect(playerId).toBe(player.playerId);
      expect(player.lobby?.players).toEqual([
        { ...currentPlayer, ready: true },
        anotherPlayer
      ]);

      done();
    });
 
    handleReady(player);
  });

  test("Deve emitir um erro caso o jogador atual não esteja em um lobby", (done) => {
    clientSocket.on('player-ready-error', (type) => {
      expect(type).toBe('not-in-lobby');
      done();
    });

    handleReady(player);
  });

  test("Deve emitir um erro caso o jogador atual seja o líder", (done) => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        { ...currentPlayer, leader: true },
        anotherPlayer
      ]
    };
  
    createLobby(player, lobby);

    clientSocket.on('player-ready-error', (type) => {
      expect(type).toBe('leader');
      done();
    });

    handleReady(player);
  });

  test("Deve emitir um erro caso o jogador atual já esteja em jogo", (done) => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        leaderPlayer,
        currentPlayer
      ]
    };
  
    createLobby(player, lobby);

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {}
    };

    (player.lobby as Lobby).game = game;

    clientSocket.on('player-ready-error', (type) => {
      expect(type).toBe('in-game');
      done();
    });

    handleReady(player);
  });
});
