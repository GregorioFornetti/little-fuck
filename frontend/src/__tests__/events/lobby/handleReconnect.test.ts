import '../setupTests';
import type { Lobby } from '@/interfaces/Lobby';
import { handleReconnect } from '@/events/lobby/handlers/reconnect';
import { lobby } from '@/connection';

describe('handleReconnect', () => {
  const players = [
    { id: 'p1', name: 'One', leader: true, ready: false },
    { id: 'p2', name: 'Two', leader: false, ready: false }
  ];

  test('restaura a sala recebida ao reconectar (ex: após recarregar a página)', () => {
    lobby.value = null;

    const snapshot: Lobby = {
      lobbyId: 'lobby-1',
      players,
      game: {
        playersHealth: { p1: 3, p2: 2 },
        currentWaitTime: 5,
        matchNumber: 1,
        roundNumber: 1,
        match: {
          players: {
            p1: { numCards: 1, numWonRounds: 0 },
            p2: { numCards: 1, numWonRounds: 0 }
          },
          currentPlayerCards: [],
          numRounds: 1,
          nextPlayerId: 'p1',
          round: {
            cards: {
              onMatch: [{ card: { type: 'common', value: 9 }, playerId: 'p2' }],
              anulledCards: []
            }
          }
        }
      }
    };

    handleReconnect(snapshot);

    expect(lobby.value).toEqual(snapshot);
    expect((lobby.value as unknown as Lobby).game?.match?.nextPlayerId).toBe('p1');
  });

  test('mantém a classificação do jogo anterior se reconectar após o fim do jogo', () => {
    lobby.value = { lobbyId: 'lobby-1', players, gameRanking: ['p1', 'p2'] };

    handleReconnect({ lobbyId: 'lobby-1', players });

    expect(lobby.value?.game).toBeUndefined();
    expect(lobby.value?.gameRanking).toEqual(['p1', 'p2']);
  });

  test('descarta a classificação antiga se já houver um novo jogo em andamento', () => {
    lobby.value = { lobbyId: 'lobby-1', players, gameRanking: ['p1', 'p2'] };

    handleReconnect({
      lobbyId: 'lobby-1',
      players,
      game: {
        playersHealth: { p1: 3, p2: 3 },
        currentWaitTime: 5,
        matchNumber: 1,
        roundNumber: 1
      }
    });

    expect(lobby.value?.gameRanking).toBeUndefined();
  });
});
