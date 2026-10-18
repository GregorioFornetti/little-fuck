import type { Game, Match } from '@/interfaces/Lobby';
import {
  ACTION_TIME_SECONDS,
  BACKEND_ACTION_TIME_SECONDS,
  TIMER_SAFETY_MARGIN_SECONDS,
  buildRankingRows,
  getCountdownKey,
  getCountdownSeconds,
  getForbiddenGuess,
  getGamePhase,
  getTurnPlayerId,
  isSpecialMatch,
  ROUND_END_TIME_SECONDS,
  TRANSITION_TIME_SECONDS
} from '@/components/pages/gameState';

const baseMatch: Match = {
  players: {
    p1: { numCards: 3, numWonRounds: 0 },
    p2: { numCards: 3, numWonRounds: 0 }
  },
  currentPlayerCards: [{ type: 'common', value: 5 }],
  numRounds: 3,
  nextPlayerId: 'p1'
};

const gameWith = (match?: Match): Game => ({
  playersHealth: { p1: 3, p2: 3 },
  currentWaitTime: 5,
  matchNumber: 1,
  roundNumber: 1,
  match
});

describe('gameState', () => {
  test('phase is waiting-match without a match, guessing while someone must guess', () => {
    expect(getGamePhase(undefined)).toBe('waiting-match');
    expect(getGamePhase(gameWith(undefined))).toBe('waiting-match');
    expect(getGamePhase(gameWith(baseMatch))).toBe('guessing');
  });

  test('phase is round while a round is being played and transition in between', () => {
    const roundMatch: Match = {
      ...baseMatch,
      nextPlayerId: undefined,
      round: { cards: { onMatch: [], anulledCards: [] }, nextPlayerId: 'p2' }
    };
    expect(getGamePhase(gameWith(roundMatch))).toBe('round');
    expect(getGamePhase(gameWith({ ...baseMatch, nextPlayerId: undefined }))).toBe('transition');
  });

  test('turn player is the guesser first, then the card player', () => {
    expect(getTurnPlayerId(gameWith(baseMatch))).toBe('p1');
    const roundMatch: Match = {
      ...baseMatch,
      nextPlayerId: undefined,
      round: { cards: { onMatch: [], anulledCards: [] }, nextPlayerId: 'p2' }
    };
    expect(getTurnPlayerId(gameWith(roundMatch))).toBe('p2');
    expect(getTurnPlayerId(gameWith(undefined))).toBeUndefined();
  });

  test('special match is a one-card match with a hidden own card', () => {
    expect(isSpecialMatch({ ...baseMatch, numRounds: 1, currentPlayerCards: [] })).toBe(true);
    expect(isSpecialMatch(baseMatch)).toBe(false);
    expect(isSpecialMatch(undefined)).toBe(false);
  });

  test('frontend countdown is the 18s backend action time minus a 3s safety margin', () => {
    expect(BACKEND_ACTION_TIME_SECONDS).toBe(18);
    expect(TIMER_SAFETY_MARGIN_SECONDS).toBe(3);
    expect(ACTION_TIME_SECONDS).toBe(BACKEND_ACTION_TIME_SECONDS - TIMER_SAFETY_MARGIN_SECONDS);
    expect(ACTION_TIME_SECONDS).toBe(15);
  });

  test('countdown is the action window while a player must act and 5s between phases', () => {
    expect(getCountdownSeconds('guessing', 'p1')).toBe(ACTION_TIME_SECONDS);
    expect(getCountdownSeconds('round', 'p2')).toBe(ACTION_TIME_SECONDS);
    expect(getCountdownSeconds('round', undefined)).toBe(TRANSITION_TIME_SECONDS);
    expect(getCountdownSeconds('transition', undefined)).toBe(TRANSITION_TIME_SECONDS);
    expect(getCountdownSeconds('waiting-match', undefined)).toBe(TRANSITION_TIME_SECONDS);
  });

  test('countdown over a finished round is 10s so the final table can be seen', () => {
    expect(ROUND_END_TIME_SECONDS).toBe(10);
    expect(getCountdownSeconds('transition', undefined, true)).toBe(ROUND_END_TIME_SECONDS);
    expect(getCountdownSeconds('transition', undefined, false)).toBe(TRANSITION_TIME_SECONDS);
    // The finished round only stretches the round-to-round pause, not the wait for a new match.
    expect(getCountdownSeconds('waiting-match', undefined, true)).toBe(TRANSITION_TIME_SECONDS);
  });

  test('countdown key changes when the turn, a guess or a card changes', () => {
    const initial = getCountdownKey(gameWith(baseMatch));
    const nextGuesser = getCountdownKey(gameWith({ ...baseMatch, nextPlayerId: 'p2' }));
    expect(nextGuesser).not.toBe(initial);

    const guessed: Match = {
      ...baseMatch,
      nextPlayerId: 'p2',
      players: {
        p1: { numCards: 3, numWonRounds: 0, numWinsNeeded: 1 },
        p2: { numCards: 3, numWonRounds: 0 }
      }
    };
    expect(getCountdownKey(gameWith(guessed))).not.toBe(nextGuesser);

    const roundMatch: Match = {
      ...baseMatch,
      nextPlayerId: undefined,
      round: { cards: { onMatch: [], anulledCards: [] }, nextPlayerId: 'p1' }
    };
    const cardPlayed: Match = {
      ...roundMatch,
      round: {
        cards: { onMatch: [{ card: { type: 'common', value: 5 }, playerId: 'p1' }], anulledCards: [] },
        nextPlayerId: 'p2'
      }
    };
    expect(getCountdownKey(gameWith(cardPlayed))).not.toBe(getCountdownKey(gameWith(roundMatch)));
    expect(getCountdownKey(undefined)).toBe('no-game');
  });

  test('ranking puts the survivor first and the first eliminated last', () => {
    const players = [
      { id: 'first-out', name: 'First Out', leader: false, ready: false },
      { id: 'winner', name: 'Winner', leader: true, ready: false },
      { id: 'second-out', name: 'Second Out', leader: false, ready: false }
    ];
    // Backend order: winner, last eliminated, first eliminated.
    const rows = buildRankingRows(players, ['winner', 'second-out', 'first-out'], 'first-out');

    expect(rows.map((row) => [row.position, row.name])).toEqual([
      [1, 'Winner'],
      [2, 'Second Out'],
      [3, 'First Out']
    ]);
    expect(rows[0].leader).toBe(true);
    expect(rows[2].isCurrentPlayer).toBe(true);
    expect(rows[0].isCurrentPlayer).toBe(false);
  });

  test('ranking falls back to the id for a player no longer in the lobby', () => {
    const rows = buildRankingRows([], ['ghost'], undefined);
    expect(rows).toEqual([
      { position: 1, playerId: 'ghost', name: 'ghost', leader: false, isCurrentPlayer: false }
    ]);
  });

  test('only the last guesser has a forbidden guess', () => {
    const match: Match = {
      ...baseMatch,
      nextPlayerId: 'p2',
      players: {
        p1: { numCards: 3, numWonRounds: 0, numWinsNeeded: 2 },
        p2: { numCards: 3, numWonRounds: 0 }
      }
    };
    // 3 rounds, others guessed 2 in total -> guessing 1 would tie the sum.
    expect(getForbiddenGuess(match, 'p2')).toBe(1);
    // Not your turn / not the last to guess.
    expect(getForbiddenGuess(match, 'p1')).toBe(null);
    expect(getForbiddenGuess(baseMatch, 'p1')).toBe(null);
    expect(getForbiddenGuess(match, undefined)).toBe(null);
  });
});
