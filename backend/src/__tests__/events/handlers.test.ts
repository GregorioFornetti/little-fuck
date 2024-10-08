
import { io, clientSocket, serverSocket } from './setupTests';
import addEventsListeners from '../../events/addEventsListeners';

import { handleCreateLobby } from '../../events/lobby/handlers/createLobby';
import { handleJoinLobby } from '../../events/lobby/handlers/joinLobby';
import { handleReady } from '../../events/lobby/handlers/ready';
import { handleStartGameRequest } from '../../events/lobby/handlers/startGameRequest';
import { handleUnready } from '../../events/lobby/handlers/unready';

import { handleWinRoundsNumberResponse } from '../../events/match/handlers/winRoundsNumberResponse';

import { handleSelectCard } from '../../events/round/handlers/selectCard';

import { handleLogout } from '../../events/general/handlers/logout';

import { createPlayer } from '../../events/functions/createPlayer';

jest.mock('../../events/lobby/handlers/createLobby');
jest.mock('../../events/lobby/handlers/joinLobby');
jest.mock('../../events/lobby/handlers/ready');
jest.mock('../../events/lobby/handlers/startGameRequest');
jest.mock('../../events/lobby/handlers/unready');

jest.mock('../../events/match/handlers/winRoundsNumberResponse');

jest.mock('../../events/round/handlers/selectCard');

jest.mock('../../events/general/handlers/logout');

jest.mock('../../events/functions/createPlayer.ts');

jest.mock('../../events/game/functions/startNewGame.ts', () => ({
  startNewGame: jest.fn(),
}));
jest.mock('../../events/match/functions/startNewMatch.ts', () => ({
  startNewMatch: jest.fn(),
}));
jest.mock('../../events/general/functions/generateInternalServerError.ts');
jest.mock('../../index.ts', () => ({
  io: 'mocked io',
}));

describe('Testes de recebimento de mensagem / eventos pelo servidor', () => {

  describe('Lobby events', () => {
    test('create-lobby', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('create-lobby', (name: string) => {
        expect(handleCreateLobby).toHaveBeenCalledWith(createPlayer(io, serverSocket.id), name);
        done();
      });

      clientSocket.emit('create-lobby', 'Player1');
    });

    test('join-lobby', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('join-lobby', (lobbyId: string, name: string) => {
        expect(handleJoinLobby).toHaveBeenCalledWith(createPlayer(io, serverSocket.id), lobbyId, name);
        done();
      });

      clientSocket.emit('join-lobby', 'Lobby1', 'Player1');
    });

    test('ready', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('ready', () => {
        expect(handleReady).toHaveBeenCalledWith(createPlayer(io, serverSocket.id));
        done();
      });

      clientSocket.emit('ready');
    });

    test('start-game-request', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('start-game-request', () => {
        expect(handleStartGameRequest).toHaveBeenCalledWith(createPlayer(io, serverSocket.id));
        done();
      });

      clientSocket.emit('start-game-request');
    });

    test('unready', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('unready', () => {
        expect(handleUnready).toHaveBeenCalledWith(createPlayer(io, serverSocket.id));
        done();
      });

      clientSocket.emit('unready');
    });
  });

  describe('Game events', () => {

  });

  describe('Match events', () => {
    test('win-rounds-number-response', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('win-rounds-number-response', (winRoundsNumber: number) => {
        expect(handleWinRoundsNumberResponse).toHaveBeenCalledWith(createPlayer(io, serverSocket.id), winRoundsNumber);
        done();
      });

      clientSocket.emit('win-rounds-number-response', 3);
    });
  });

  describe('Round events', () => {
    test('select-card', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('select-card', (card: number) => {
        expect(handleSelectCard).toHaveBeenCalledWith(createPlayer(io, serverSocket.id), card);
        done();
      });

      clientSocket.emit('select-card', 3);
    });
  });

  describe('General events', () => {
    test('logout', (done) => {
      addEventsListeners(io, serverSocket);

      serverSocket.on('logout', () => {
        expect(handleLogout).toHaveBeenCalledWith(createPlayer(io, serverSocket.id));
        done();
      });

      clientSocket.emit('logout');
    });
  });
});
