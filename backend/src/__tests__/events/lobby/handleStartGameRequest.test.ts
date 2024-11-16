
import { lobbys, players } from '../../../global';
import { handleStartGameRequest } from '../../../events/lobby/handlers/startGameRequest';
import Player from '../../../interfaces/Player';

import { clientSocket, player } from '../setupTests';
import { startNewGame } from '../../../events/game/functions/startNewGame';
import { Timer } from 'easytimer.js';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';

jest.mock('../../../events/game/functions/startNewGame', () => ({
  startNewGame: jest.fn(),
}));
jest.mock('../../../events/general/functions/generateInternalServerError', () => ({
  generateInternalServerError: jest.fn()
}));

function createLobby(player: Player) {
  lobbys['123'] = {
    lobbyId: '123',
    players: [
      {
        id: player.playerId,
        name: 'player1',
        leader: true,
        ready: false
      },
      {
        id: 'player2',
        name: 'player2',
        leader: false,
        ready: true
      }
    ]
  };
  player.lobby = lobbys['123'];
  players[player.playerId] = { socket: player.socket, lobby: lobbys['123'] };
}

describe('handleStartGameRequest', () => {

  test('Tentar começar jogo sem estar em um lobby deve emitir erro', (done) => {
    clientSocket.on('start-game-error', (errorType: string) => {
      expect(errorType).toBe('not-in-lobby');
      expect(startNewGame).not.toHaveBeenCalled();
      done();
    });

    handleStartGameRequest(player);
  });

  test('Tentar começar jogo sem ser o líder deve emitir erro', (done) => {
    clientSocket.on('start-game-error', (errorType: string) => {
      expect(errorType).toBe('not-leader');
      expect(startNewGame).not.toHaveBeenCalled();
      done();
    });

    createLobby(player);
    player.lobby!.players[0].leader = false;
    handleStartGameRequest(player);
  });

  test('Tentar começar jogo que já está em jogo deve emitir erro', (done) => {
    clientSocket.on('start-game-error', (errorType: string) => {
      expect(errorType).toBe('already-in-game');
      expect(startNewGame).not.toHaveBeenCalled();
      done();
    });

    createLobby(player);
    player.lobby!.game = {
      matchNumber: 1,
      roundNumber: 1,
      currentPlayerId: player.playerId,
      status: 'starting_match',
      deadPlayersIds: [],
      numRounds: 1,
      playersHealth: {},
      timer: new Timer()
    };
    handleStartGameRequest(player);
  });

  test('Tentar começar jogo com jogadores não prontos deve emitir erro', (done) => {
    clientSocket.on('start-game-error', (errorType: string) => {
      expect(errorType).toBe('not-all-ready');
      expect(startNewGame).not.toHaveBeenCalled();
      done();
    });

    createLobby(player);
    player.lobby!.players[1].ready = false;
    handleStartGameRequest(player);
  });

  test('Começar jogo com sucesso deve chamar startNewGame', () => {
    createLobby(player);
    handleStartGameRequest(player);

    expect(startNewGame).toHaveBeenCalledWith(player.lobby);
  });

  test('Caso startNewGame gere uma exceção, deve gerar um internalServerError', () => {
    (startNewGame as jest.Mock).mockImplementation(() => {
      throw new Error('StartNewGame error');
    });

    createLobby(player);
    handleStartGameRequest(player);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      player.lobby,
      new Error('StartNewGame error')
    );
  });
});
