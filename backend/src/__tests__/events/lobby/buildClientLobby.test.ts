import type Lobby from '../../../interfaces/Lobby';
import { buildClientLobby } from '../../../events/lobby/functions/buildClientLobby';

const baseLobby = (game?: Lobby['game']): Lobby => ({
  lobbyId: 'lobby-1',
  players: [
    { id: 'p1', name: 'One', leader: true, ready: false },
    { id: 'p2', name: 'Two', leader: false, ready: false }
  ],
  game
});

const timer = { getTimeValues: () => ({ seconds: 7 }) } as never;

describe('buildClientLobby', () => {
  test('sem jogo, devolve apenas id e jogadores', () => {
    const clientLobby = buildClientLobby(baseLobby(), 'p1');
    expect(clientLobby.lobbyId).toBe('lobby-1');
    expect(clientLobby.players).toHaveLength(2);
    expect(clientLobby.game).toBeUndefined();
  });

  test('partida normal: devolve só as próprias cartas e contadores simples', () => {
    const lobby = baseLobby({
      playersHealth: { p1: 3, p2: 2 },
      timer,
      matchNumber: 2,
      roundNumber: 1,
      currentPlayerId: 'p1',
      numRounds: 2,
      deadPlayersIds: [],
      status: 'waiting_num_win_response',
      match: {
        nextPlayerId: 'p1',
        roundFirstPlayerId: 'p1',
        players: {
          p1: { cards: [{ type: 'common', value: 5 }, { type: 'common', value: 9 }], numWonRounds: 0 },
          p2: { cards: [{ type: 'common', value: 3 }, { type: 'common', value: 16 }], numWonRounds: 1, numWinsNeeded: 1 }
        }
      }
    });

    const clientLobby = buildClientLobby(lobby, 'p2');

    expect(clientLobby.game?.currentWaitTime).toBe(7);
    expect(clientLobby.game?.match?.currentPlayerCards).toEqual([
      { type: 'common', value: 3 },
      { type: 'common', value: 16 }
    ]);
    expect(clientLobby.game?.match?.players).toEqual({
      p1: { numCards: 2, numWonRounds: 0, numWinsNeeded: undefined },
      p2: { numCards: 2, numWonRounds: 1, numWinsNeeded: 1 }
    });
    expect(clientLobby.game?.match?.round).toBeUndefined();
  });

  test('partida especial: esconde a própria carta e mostra as dos outros ordenadas', () => {
    const lobby = baseLobby({
      playersHealth: { p1: 3, p2: 2 },
      timer,
      matchNumber: 1,
      roundNumber: 1,
      currentPlayerId: 'p1',
      numRounds: 1,
      deadPlayersIds: [],
      status: 'waiting_num_win_response',
      match: {
        nextPlayerId: 'p2',
        roundFirstPlayerId: 'p2',
        players: {
          p1: { cards: [{ type: 'common', value: 4 }], numWonRounds: 0 },
          p2: { cards: [{ type: 'common', value: 14 }], numWonRounds: 0 }
        }
      }
    });

    const clientLobby = buildClientLobby(lobby, 'p2');

    expect(clientLobby.game?.match?.currentPlayerCards).toEqual([]);
    expect(clientLobby.game?.match?.round?.cards.onMatch).toEqual([
      { card: { type: 'common', value: 4 }, playerId: 'p1' }
    ]);
  });
});
