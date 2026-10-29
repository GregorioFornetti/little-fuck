import type { Game, Match } from '@/interfaces/Lobby';
import {
  ACTION_TIME_SECONDS,
  BACKEND_ACTION_TIME_SECONDS,
  TIMER_SAFETY_MARGIN_SECONDS,
  buildRankingRows,
  DEFAULT_GAME_OPTIONS,
  DEFAULT_NUMBERED_CARDS,
  groupNumberedCards,
  getCardBackClass,
  withCardCount,
  withRenamedCardValue,
  getCountdownKey,
  getCountdownSeconds,
  getForbiddenGuess,
  getLobbyOptions,
  getGamePhase,
  isManilhaCard,
  isManilhaCardInMatch,
  getManilhaNovaRank,
  getManilhaRankBelow,
  getManilhaMode,
  isManilhaInRound,
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

  test('countdown follows the lobby options for action time and round pause', () => {
    const options = { initialHealth: 5, playerActionTimeSeconds: 30, roundEndTimeSeconds: 20, cardType: 'manilha-velha' as const };
    // 30s no backend, menos a margem de segurança de 3s no frontend
    expect(getCountdownSeconds('guessing', 'p1', false, options)).toBe(27);
    expect(getCountdownSeconds('round', 'p2', false, options)).toBe(27);
    expect(getCountdownSeconds('transition', undefined, true, options)).toBe(20);
    expect(getLobbyOptions(null)).toEqual(DEFAULT_GAME_OPTIONS);
    expect(getLobbyOptions({ lobbyId: 'x', players: [], options }))
      .toEqual({ ...options, customCards: DEFAULT_NUMBERED_CARDS, theme: 'classic', cardBack: 'classic', powerups: { enabled: [], perGrant: 1, grantTiming: 'match' } });
  });

  test('lobby options fall back to numbered cards for lobbies without a card type', () => {
    const legacyOptions = { initialHealth: 5, playerActionTimeSeconds: 30, roundEndTimeSeconds: 20 };
    expect(getLobbyOptions({ lobbyId: 'x', players: [], options: legacyOptions as never }))
      .toEqual({ ...legacyOptions, cardType: 'numbered', customCards: DEFAULT_NUMBERED_CARDS, theme: 'classic', cardBack: 'classic', powerups: { enabled: [], perGrant: 1, grantTiming: 'match' } });
    expect(DEFAULT_GAME_OPTIONS.cardType).toBe('numbered');
  });

  test('default numbered cards are four copies of 1 to 12 plus one each of 13 to 16', () => {
    expect(DEFAULT_NUMBERED_CARDS).toHaveLength(52);
    expect(DEFAULT_NUMBERED_CARDS.filter((value) => value === 1)).toHaveLength(4);
    expect(DEFAULT_NUMBERED_CARDS.filter((value) => value === 12)).toHaveLength(4);
    expect(DEFAULT_NUMBERED_CARDS.filter((value) => value >= 13)).toEqual([13, 14, 15, 16]);
    expect(DEFAULT_GAME_OPTIONS.customCards).toEqual(DEFAULT_NUMBERED_CARDS);
  });

  test('numbered cards are grouped by strength with their counts', () => {
    expect(groupNumberedCards([5, 1, 5, 13, 1, 5])).toEqual([
      { value: 1, count: 2 },
      { value: 5, count: 3 },
      { value: 13, count: 1 }
    ]);
    const groups = groupNumberedCards(DEFAULT_NUMBERED_CARDS);
    expect(groups).toHaveLength(16);
    expect(groups[0]).toEqual({ value: 1, count: 4 });
    expect(groups[15]).toEqual({ value: 16, count: 1 });

    expect(withCardCount([1, 1, 5], 1, 4)).toEqual([1, 1, 1, 1, 5]);
    expect(withCardCount([1, 1, 5], 5, 1)).toEqual([1, 1, 5]);
    expect(withRenamedCardValue([1, 1, 5], 1, 5)).toEqual([5, 5, 5]);
  });

  test('card back classes combine the design pattern', () => {
    expect(getCardBackClass(undefined)).toBe('card-back');
    expect(getCardBackClass({ cardBack: 'classic' })).toBe('card-back');
    expect(getCardBackClass({ cardBack: 'stripes' })).toBe('card-back back-stripes');
    expect(getCardBackClass({ cardBack: 'dots' })).toBe('card-back back-dots');
  });

  test('isManilhaCard only matches the four manilhas', () => {
    expect(isManilhaCard({ label: '4', suit: 'clubs' })).toBe(true); // Zap
    expect(isManilhaCard({ label: '7', suit: 'hearts' })).toBe(true);
    expect(isManilhaCard({ label: 'A', suit: 'spades' })).toBe(true);
    expect(isManilhaCard({ label: '7', suit: 'diamonds' })).toBe(true);
    expect(isManilhaCard({ label: '7', suit: 'clubs' })).toBe(false);
    expect(isManilhaCard({ label: '4', suit: 'hearts' })).toBe(false);
    expect(isManilhaCard({ label: '3', suit: 'clubs' })).toBe(false);
    expect(isManilhaCard({ value: 14 } as never)).toBe(false);
    expect(isManilhaCard(undefined)).toBe(false);
  });

  test('manilha rank is one level above the turned card, wrapping from 3 to 4', () => {
    expect(getManilhaNovaRank('2')).toBe('3');
    expect(getManilhaNovaRank('3')).toBe('4');
    expect(getManilhaNovaRank('K')).toBe('A');
    expect(getManilhaNovaRank('Q')).toBe('J');
    expect(getManilhaNovaRank('4')).toBe('5');
    expect(getManilhaNovaRank(undefined)).toBeNull();
  });

  test('isManilhaCardInMatch follows the turned card when there is one', () => {
    const turned = { label: '2', suit: 'spades' };
    expect(isManilhaCardInMatch({ label: '3', suit: 'diamonds' }, turned)).toBe(true);
    expect(isManilhaCardInMatch({ label: '3', suit: 'clubs' }, turned)).toBe(true);
    expect(isManilhaCardInMatch({ label: '2', suit: 'clubs' }, turned)).toBe(false);
    // The fixed manilhas of the manilha velha deck do not apply here
    expect(isManilhaCardInMatch({ label: '4', suit: 'clubs' }, turned)).toBe(false);
    expect(isManilhaCardInMatch({ label: '7', suit: 'hearts' }, turned)).toBe(false);
    // Without a turned card, the fixed manilhas apply
    expect(isManilhaCardInMatch({ label: '4', suit: 'clubs' }, undefined)).toBe(true);
    expect(isManilhaCardInMatch({ label: '3', suit: 'clubs' }, undefined)).toBe(false);
  });

  test('manilha paraguaia rotates the manilhas every round in a three-round cycle', () => {
    const turned = { label: '2', suit: 'spades' };
    const paraguaia = (card: { label: string; suit: string }, round: number) =>
      isManilhaInRound(card, getManilhaMode('manilha-paraguaia', turned, round), turned);

    // Round 1: above the flipped card (3s), like manilha nova
    expect(paraguaia({ label: '3', suit: 'diamonds' }, 1)).toBe(true);
    expect(paraguaia({ label: 'A', suit: 'clubs' }, 1)).toBe(false);
    // Round 2: below the flipped card (aces)
    expect(paraguaia({ label: 'A', suit: 'diamonds' }, 2)).toBe(true);
    expect(paraguaia({ label: '3', suit: 'clubs' }, 2)).toBe(false);
    // Round 3: fixed manilhas of manilha velha
    expect(paraguaia({ label: '4', suit: 'clubs' }, 3)).toBe(true);
    expect(paraguaia({ label: '7', suit: 'hearts' }, 3)).toBe(true);
    expect(paraguaia({ label: 'A', suit: 'clubs' }, 3)).toBe(false);
    // The cycle repeats
    expect(paraguaia({ label: '3', suit: 'clubs' }, 4)).toBe(true);
    expect(paraguaia({ label: 'A', suit: 'clubs' }, 5)).toBe(true);
    expect(paraguaia({ label: '4', suit: 'clubs' }, 6)).toBe(true);

    expect(getManilhaMode('manilha-nova', turned, 2)).toBe('above');
    expect(getManilhaMode('manilha-velha', undefined, 2)).toBe('fixed');
    expect(getManilhaRankBelow('4')).toBe('3');
    expect(getManilhaRankBelow('2')).toBe('A');
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
