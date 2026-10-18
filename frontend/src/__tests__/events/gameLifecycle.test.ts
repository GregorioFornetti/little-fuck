import './setupTests';
import type { Game, Match } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { handleEndGame } from '@/events/game/handlers/endGame';
import { handleEndMatch } from '@/events/match/handlers/endMatch';
import { handleEndRound } from '@/events/round/handlers/endRound';
import { handleStartRound } from '@/events/round/handlers/startRound';

const players = [
  { id: 'p1', name: 'One', leader: true, ready: false },
  { id: 'p2', name: 'Two', leader: false, ready: true }
];

const matchWith = (overrides: Partial<Match> = {}): Match => ({
  players: {
    p1: { numCards: 2, numWonRounds: 0 },
    p2: { numCards: 2, numWonRounds: 0 }
  },
  currentPlayerCards: [],
  numRounds: 2,
  ...overrides
});

const gameWith = (match?: Match): Game => ({
  playersHealth: { p1: 3, p2: 3 },
  currentWaitTime: 5,
  matchNumber: 1,
  roundNumber: 1,
  match
});

describe('game lifecycle handlers', () => {
  test('endGame stores the final ranking and clears the game', () => {
    lobby.value = { lobbyId: 'x', players, game: gameWith(matchWith()) };

    // Backend order: winner first, first eliminated last.
    handleEndGame(['p2', 'p1']);

    expect(lobby.value.game).toBeUndefined();
    expect(lobby.value.gameRanking).toEqual(['p2', 'p1']);
  });

  test('endMatch applies health, clears the match and advances the match number', () => {
    lobby.value = { lobbyId: 'x', players, game: gameWith(matchWith()) };

    handleEndMatch({ p1: -1, p2: 0 });

    expect(lobby.value.game?.playersHealth).toEqual({ p1: 2, p2: 3 });
    expect(lobby.value.game?.match).toBeUndefined();
    expect(lobby.value.game?.matchNumber).toBe(2);
    expect(lobby.value.game?.roundNumber).toBe(1);
  });

  test('endRound clears the round, awards points and advances the round number', () => {
    const match = matchWith({
      round: { cards: { onMatch: [], anulledCards: [] }, nextPlayerId: 'p1' }
    });
    lobby.value = { lobbyId: 'x', players, game: gameWith(match) };

    handleEndRound('p2', 1);

    expect(lobby.value.game?.match?.round).toBeUndefined();
    expect(lobby.value.game?.match?.players.p2.numWonRounds).toBe(1);
    expect(lobby.value.game?.roundNumber).toBe(2);
  });

  test('endRound keeps the final table and winner for display, startRound clears it', () => {
    const finalCards = {
      onMatch: [{ card: { type: 'common' as const, value: 9 }, playerId: 'p2' }],
      anulledCards: []
    };
    const match = matchWith({
      round: { cards: finalCards, nextPlayerId: 'p1' }
    });
    lobby.value = { lobbyId: 'x', players, game: gameWith(match) };

    handleEndRound('p2', 1);

    expect(lobby.value.game?.lastRound).toEqual({
      cards: finalCards,
      winnerId: 'p2',
      points: 1
    });

    handleStartRound('p1');

    expect(lobby.value.game?.lastRound).toBeUndefined();
    expect(lobby.value.game?.match?.round?.nextPlayerId).toBe('p1');
  });

  test('endRound resets the round number after the last round of a match', () => {
    const match = matchWith({
      round: { cards: { onMatch: [], anulledCards: [] }, nextPlayerId: 'p1' }
    });
    const game = gameWith(match);
    game.roundNumber = 2;
    lobby.value = { lobbyId: 'x', players, game };

    handleEndRound('p1', 1);

    expect(lobby.value.game?.roundNumber).toBe(1);
  });
});
