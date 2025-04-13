
import { player } from '../setupTests';
import type Lobby from '../../../interfaces/Lobby';
import { Game } from '../../../interfaces/Lobby';
import { lobbys, players } from '../../../global';
import { handleUnready } from '../../../events/lobby/handlers/unready';
import Timer from 'easytimer.js';

const emitPlayerUnready = jest.fn();
const emitPlayerUnreadyError = jest.fn();

describe('handleUnready', () => {

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
        emitPlayerUnready: emitPlayerUnready,
        emitPlayerUnreadyError: emitPlayerUnreadyError
      }
    };
    lobbys[lobby.lobbyId] = lobby;
    players[player.playerId] = {
      ...player,
    };
  }

  test('Deve atualizar os valores do jogador para preparado caso este estivesse preparado. Deve emitir para os outros essa troca de status', () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId, ready: true };
    const lobby: Lobby = {
      lobbyId: '123',
      players: [
        currentPlayer,
        anotherPlayer
      ]
    };

    createLobby(player, lobby);

    handleUnready(player);

    expect(emitPlayerUnready).toHaveBeenCalledWith(player.playerId);

    expect(lobby).toEqual({
      lobbyId: '123',
      players: [
        { ...currentPlayer, ready: false },
        anotherPlayer
      ]
    });
  });

  test('Deve manter o jogador como não preparado caso este já estivesse não preparado. Não deve emitir para os outros que este jogador se despreparou (não mudou nada)', () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId, ready: false };
    const lobby: Lobby = {
      lobbyId: '123',
      players: [
        currentPlayer,
        anotherPlayer
      ]
    };

    createLobby(player, lobby);

    handleUnready(player);

    expect(emitPlayerUnready).not.toHaveBeenCalled();

    expect(lobby).toEqual({
      lobbyId: '123',
      players: [
        { ...currentPlayer, ready: false },
        anotherPlayer
      ]
    });
  });

  test('Deve emitir um erro caso o jogador atual não esteja em um lobby', () => {
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

    handleUnready(player);

    expect(emitPlayerUnreadyError).toHaveBeenCalledWith('not-in-lobby');
  });

  test('Deve emitir um erro caso o jogador atual seja o líder', () => {
    const currentPlayer = { ...anotherPlayer, id: player.playerId };
    const lobby: Lobby = {
      lobbyId: '123',
      players: [
        { ...currentPlayer, leader: true },
        anotherPlayer
      ]
    };

    createLobby(player, lobby);

    handleUnready(player);

    expect(emitPlayerUnreadyError).toHaveBeenCalledWith('leader');
  });

  test('Deve emitir um erro caso o jogador atual já esteja em jogo', () => {
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
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
      numRounds: 1,
      currentPlayerId: '123',
      deadPlayersIds: [],
      status: 'starting_match',
      timer: new Timer()
    };

    (player.lobby as Lobby).game = game;

    handleUnready(player);

    expect(emitPlayerUnreadyError).toHaveBeenCalledWith('in-game');
  });
});
