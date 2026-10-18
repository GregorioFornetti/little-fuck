import '../setupTests';
import type { Lobby } from '@/interfaces/Lobby';
import { handleTableUpdate } from '@/events/round/handlers/tableUpdate';
import { lobby } from '@/connection';
const connectionMock = jest.requireMock('@/connection') as { playerId?: string };

describe('handleTableUpdate - descarte da carta jogada', () => {
  const me = { id: 'me', name: 'Me', leader: true, ready: false };
  const other = { id: 'other', name: 'Other', leader: false, ready: true };

  const lobbyWithTurn = (turnPlayerId: string): Lobby => ({
    lobbyId: '123',
    players: [me, other],
    game: {
      playersHealth: { me: 3, other: 3 },
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      match: {
        players: {
          me: { numCards: 3, numWonRounds: 0 },
          other: { numCards: 3, numWonRounds: 0 }
        },
        currentPlayerCards: [
          { type: 'common', value: 7 },
          { type: 'common', value: 9 },
          { type: 'common', value: 7 }
        ],
        numRounds: 3,
        round: {
          cards: { onMatch: [], anulledCards: [] },
          nextPlayerId: turnPlayerId
        }
      }
    }
  });

  beforeEach(() => {
    connectionMock.playerId = me.id;
  });

  afterAll(() => {
    connectionMock.playerId = undefined;
  });

  test('a carta que eu joguei sai da minha mão (apenas uma cópia) e da minha contagem', () => {
    lobby.value = lobbyWithTurn(me.id);

    handleTableUpdate(
      { onMatch: [{ card: { type: 'common', value: 7 }, playerId: me.id }], anulledCards: [] },
      other.id
    );

    expect(lobby.value.game?.match?.currentPlayerCards).toEqual([
      { type: 'common', value: 9 },
      { type: 'common', value: 7 }
    ]);
    expect(lobby.value.game?.match?.players.me.numCards).toBe(2);
    expect(lobby.value.game?.match?.players.other.numCards).toBe(3);
  });

  test('a carta jogada por outro jogador não sai da minha mão, mas sai da contagem dele', () => {
    lobby.value = lobbyWithTurn(other.id);

    handleTableUpdate(
      { onMatch: [{ card: { type: 'common', value: 7 }, playerId: other.id }], anulledCards: [] },
      me.id
    );

    expect(lobby.value.game?.match?.currentPlayerCards).toHaveLength(3);
    expect(lobby.value.game?.match?.players.other.numCards).toBe(2);
    expect(lobby.value.game?.match?.players.me.numCards).toBe(3);
  });

  test('carta jogada que empata (anulada) também é descartada', () => {
    lobby.value = lobbyWithTurn(me.id);

    handleTableUpdate(
      {
        onMatch: [],
        anulledCards: [
          { card: { type: 'common', value: 9 }, playerId: other.id },
          { card: { type: 'common', value: 9 }, playerId: me.id }
        ]
      },
      other.id
    );

    expect(lobby.value.game?.match?.currentPlayerCards).toEqual([
      { type: 'common', value: 7 },
      { type: 'common', value: 7 }
    ]);
    expect(lobby.value.game?.match?.players.me.numCards).toBe(2);
  });
});
