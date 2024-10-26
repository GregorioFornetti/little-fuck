import { player } from "../setupTests";
import type Lobby from "../../../interfaces/Lobby";
import { Game } from "../../../interfaces/Lobby";
import { lobbys, players } from "../../../global";
import { handleReady } from "../../../events/lobby/handlers/ready";

const emitPlayerReady = jest.fn();
const emitPlayerReadyError = jest.fn();

describe("handleReady", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  function createLobby(player: any, lobby: Lobby) {
    player.lobby = lobby;
    player.eventsEmitter = {
      Lobby: {
        emitPlayerReady: emitPlayerReady,
        emitPlayerReadyError: emitPlayerReadyError
      }
    }
    lobbys[lobby.lobbyId] = lobby;
    players[player.playerId] = lobby;
  }

  test("Deve atualizar os valores do jogador para preparado caso este não estivesse preparado. Deve emitir para os outros essa troca de status", () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        currentPlayer,
        anotherPlayer
      ]
    };

    createLobby(player, lobby);

    handleReady(player);

    expect(emitPlayerReady).toHaveBeenCalledWith(player.playerId);

    expect(lobby).toEqual({
      lobbyId: '123',
      players: [
        { ...currentPlayer, ready: true },
        anotherPlayer
      ]
     })
  });

  test("Deve manter o jogador como preparado caso este já estivesse preparado. Não deve emitir para os outros que este jogador se preparou (não mudou nada)", () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId, ready: true };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        currentPlayer,
        anotherPlayer
      ]
    };

    createLobby(player, lobby);

    handleReady(player);

    expect(emitPlayerReady).not.toHaveBeenCalled();

    expect(lobby).toEqual({
      lobbyId: '123',
      players: [
        { ...currentPlayer, ready: true },
        anotherPlayer
      ]
     })
  });

  test("Deve emitir um erro caso o jogador atual não esteja em um lobby", () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId, ready: true };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        currentPlayer,
        anotherPlayer
      ]
    };

    createLobby(player, lobby);
    player.lobby = undefined;

    handleReady(player);

    expect(emitPlayerReadyError).toHaveBeenCalledWith('not-in-lobby');
  });

  test("Deve emitir um erro caso o jogador atual seja o líder", () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId };
    const lobby: Lobby = { 
      lobbyId: '123',
      players: [
        { ...currentPlayer, leader: true },
        anotherPlayer
      ]
    };
  
    createLobby(player, lobby);

    handleReady(player);

    expect(emitPlayerReadyError).toHaveBeenCalledWith('leader');
  });

  test("Deve emitir um erro caso o jogador atual já esteja em jogo", () => {
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

    handleReady(player);

    expect(emitPlayerReadyError).toHaveBeenCalledWith('in-game');
  });
});
