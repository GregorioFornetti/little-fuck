
import { serverSocket, eventsListenersAdder, clientSocket } from './setupTests';
import { Lobby, Card, RoundCards, SpecialMatchCards } from '@/interfaces/Lobby';

import { handleJoinLobbySuccess } from '@/events/lobby/handlers/joinLobbySuccess';
import { handleJoinLobbyError } from '@/events/lobby/handlers/joinLobbyError';
import { handlePlayerJoin } from '@/events/lobby/handlers/playerJoin';
import { handlePlayerReady } from '@/events/lobby/handlers/playerReady';
import { handlePlayerReadyError } from '@/events/lobby/handlers/playerReadyError';
import { handlePlayerUnready } from '@/events/lobby/handlers/playerUnready';
import { handlePlayerUnreadyError } from '@/events/lobby/handlers/playerUnreadyError';
import { handleReconnect } from '@/events/lobby/handlers/reconnect';
import { handleStartGameError } from '@/events/lobby/handlers/startGameError';

import { handleStartGame } from '@/events/game/handlers/startGame';
import { handleEndGame } from '@/events/game/handlers/endGame';

import { handleStartMatch } from '@/events/match/handlers/startMatch';
import { handleWinRoundsNumberUpdate } from '@/events/match/handlers/winRoundsNumberUpdate';
import { handleWinRoundsNumberError } from '@/events/match/handlers/winRoundsNumberError';
import { handleEndMatch } from '@/events/match/handlers/endMatch';
import { handleStartSpecialMatch } from '@/events/match/handlers/startSpecialMatch';

import { handleStartRound } from '@/events/round/handlers/startRound';
import { handleTableUpdate } from '@/events/round/handlers/tableUpdate';
import { handleSelectCardError } from '@/events/round/handlers/selectCardError';
import { handleEndRound } from '@/events/round/handlers/endRound';

import { handlePlayerLogout } from '@/events/general/handlers/playerLogout';
import { handlePlayerLogoutError } from '@/events/general/handlers/playerLogoutError';
import { handleInternalServerError } from '@/events/general/handlers/internalServerError';
import { handleDebug } from '@/events/general/handlers/debug';

import addDefaultEventsListeners from '@/events/addDefaultEventsListeners';

jest.mock('../../events/lobby/handlers/joinLobbySuccess');
jest.mock('../../events/lobby/handlers/joinLobbyError');
jest.mock('../../events/lobby/handlers/playerJoin');
jest.mock('../../events/lobby/handlers/playerReady');
jest.mock('../../events/lobby/handlers/playerReadyError');
jest.mock('../../events/lobby/handlers/playerUnready');
jest.mock('../../events/lobby/handlers/playerUnreadyError');
jest.mock('../../events/lobby/handlers/reconnect');
jest.mock('../../events/lobby/handlers/startGameError');

jest.mock('../../events/game/handlers/startGame');
jest.mock('../../events/game/handlers/endGame');

jest.mock('../../events/match/handlers/startMatch');
jest.mock('../../events/match/handlers/winRoundsNumberUpdate');
jest.mock('../../events/match/handlers/winRoundsNumberError');
jest.mock('../../events/match/handlers/endMatch');
jest.mock('../../events/match/handlers/startSpecialMatch');

jest.mock('../../events/round/handlers/startRound');
jest.mock('../../events/round/handlers/tableUpdate');
jest.mock('../../events/round/handlers/selectCardError');
jest.mock('../../events/round/handlers/endRound');

jest.mock('../../events/general/handlers/playerLogout');
jest.mock('../../events/general/handlers/playerLogoutError');
jest.mock('../../events/general/handlers/internalServerError');
jest.mock('../../events/general/handlers/debug');

describe('Testes de recebimento de mensagem / eventos pelo servidor', () => {

  describe('Lobby events', () => {
    test('join-lobby-success', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.joinLobbySuccess((lobby: Lobby) => {
        expect(handleJoinLobbySuccess).toHaveBeenCalledWith(lobby);
        done();
      });

      serverSocket.emit('join-lobby-success', {
        id: 'Lobby1',
        name: 'Lobby 1',
        players: []
      });
    });

    test('join-lobby-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.joinLobbyError((error: string) => {
        expect(handleJoinLobbyError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('join-lobby-error', 'lobby-in-game');
    });

    test('player-join', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.playerJoin((id: string, name: string) => {
        expect(handlePlayerJoin).toHaveBeenCalledWith(id, name);
        done();
      });

      serverSocket.emit('player-join', 'Lobby1', 'Player1');
    });

    test('player-ready', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.playerReady((id: string) => {
        expect(handlePlayerReady).toHaveBeenCalledWith(id);
        done();
      });

      serverSocket.emit('player-ready', 'Player1');
    });

    test('player-ready-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.playerReadyError((error: string) => {
        expect(handlePlayerReadyError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('player-ready-error', 'not-in-lobby');
    });

    test('player-unready', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.playerUnready((id: string) => {
        expect(handlePlayerUnready).toHaveBeenCalledWith(id);
        done();
      });

      serverSocket.emit('player-unready', 'Player1');
    });

    test('player-unready-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.playerUnreadyError((error: string) => {
        expect(handlePlayerUnreadyError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('player-unready-error', 'not-in-lobby');
    });

    test('start-game-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.startGameError((error: string) => {
        expect(handleStartGameError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('start-game-error', 'not-in-lobby');
    });

    test('reconnect', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.lobby.reconnect((lobby: Lobby) => {
        expect(handleReconnect).toHaveBeenCalledWith(lobby);
        done();
      });

      serverSocket.emit('reconnect', {
        id: 'Lobby1',
        name: 'Lobby 1',
        players: []
      });
    });
  });

  describe('Game events', () => {
    test('start-game', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.game.startGame(() => {
        expect(handleStartGame).toHaveBeenCalled();
        done();
      });

      serverSocket.emit('start-game');
    });

    test('end-game', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.game.endGame((playersRanks: string[]) => {
        expect(handleEndGame).toHaveBeenCalledWith(playersRanks);
        done();
      });

      serverSocket.emit('end-game', ['Player1', 'Player2']);
    });
  });

  describe('Match events', () => {
    test('start-match', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.match.startMatch((cards: Card[], firstPlayerId: string) => {
        expect(handleStartMatch).toHaveBeenCalledWith(cards, firstPlayerId);
        done();
      });

      serverSocket.emit('start-match', {
        type: 'common',
        value: 1
      }, 'Player1');
    });

    test('win-rounds-number-update', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.match.winRoundsNumberUpdate((numWinRounds: number, nextPlayerId?: string) => {
        expect(handleWinRoundsNumberUpdate).toHaveBeenCalledWith(numWinRounds, nextPlayerId);
        done();
      });

      serverSocket.emit('win-rounds-number-update', 3, 'Player1');
    });

    test('win-rounds-number-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.match.winRoundsNumberError((error: string) => {
        expect(handleWinRoundsNumberError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('win-rounds-number-error', 'not-your-turn');
    });

    test('end-match', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.match.endMatch((playerHealthUpdate: {
                [playerId: string]: number;
            }) => {
        expect(handleEndMatch).toHaveBeenCalledWith(playerHealthUpdate);
        done();
      });

      serverSocket.emit('end-match', {
        Player1: 10,
        Player2: 0
      });
    });

    test('start-special-match', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.match.startSpecialMatch((cards: SpecialMatchCards, firstPlayerId: string) => {
        expect(handleStartSpecialMatch).toHaveBeenCalledWith(cards, firstPlayerId);
        done();
      });

      serverSocket.emit('start-special-match', {
        onMatch: [{
          card: {
            type: 'common',
            value: 1
          },
          playerId: 'Player1'
        }],
        anulledCards: []
      }, 'Player1');
    });
  });

  describe('Round events', () => {
    test('start-round', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.round.startRound((nextPlayerId: string) => {
        expect(handleStartRound).toHaveBeenCalledWith(nextPlayerId);
        done();
      });

      serverSocket.emit('start-round', 'Player1');
    });

    test('table-update', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.round.tableUpdate((cards: RoundCards, nextPlayerId?: string) => {
        expect(handleTableUpdate).toHaveBeenCalledWith(cards, nextPlayerId);
        done();
      });

      serverSocket.emit('table-update', {
        onMatch: [{
          card: {
            type: 'common',
            value: 1
          },
          playerId: 'Player1'
        }],
        anulledCards: []
      }, 'Player1');
    });

    test('select-card-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.round.selectCardError((error: string) => {
        expect(handleSelectCardError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('select-card-error', 'not-your-turn');
    });

    test('end-round', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.round.endRound((winnerId: string, points: number) => {
        expect(handleEndRound).toHaveBeenCalledWith(winnerId, points);
        done();
      });

      serverSocket.emit('end-round', 'Player1', 10);
    });
  });

  describe('General events', () => {
    test('player-logout', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.general.playerLogout((id: string) => {
        expect(handlePlayerLogout).toHaveBeenCalledWith(id);
        done();
      });

      serverSocket.emit('player-logout', 'Player1');
    });

    test('player-logout-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.general.playerLogoutError((error: string) => {
        expect(handlePlayerLogoutError).toHaveBeenCalledWith(error);
        done();
      });

      serverSocket.emit('player-logout-error', 'not-in-lobby');
    });

    test('internal-server-error', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.general.internalServerError(() => {
        expect(handleInternalServerError).toHaveBeenCalled();
        done();
      });

      serverSocket.emit('internal-server-error');
    });

    test('debug', (done) => {
      addDefaultEventsListeners(clientSocket);

      eventsListenersAdder.general.debug((lobby: any) => {
        expect(handleDebug).toHaveBeenCalledWith(lobby);
        done();
      });

      serverSocket.emit('debug', { lobbyId: 'Lobby1', players: [] });
    });
  });
});
