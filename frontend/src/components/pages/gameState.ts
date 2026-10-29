import type { Game, GameOptions, Lobby, Match, MatchSummaryRow, PowerupType } from '@/interfaces/Lobby';

/** Default game options, mirroring the backend defaults. */
/** Default numbered cards of the game: four copies of 1 to 12, plus one each of 13 to 16. */
export const DEFAULT_NUMBERED_CARDS: number[] = [
  ...Array.from({ length: 12 }, (_, i) => Array(4).fill(i + 1)).flat(),
  13, 14, 15, 16
];

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  initialHealth: 3,
  playerActionTimeSeconds: 18,
  roundEndTimeSeconds: 10,
  cardType: 'numbered',
  customCards: [...DEFAULT_NUMBERED_CARDS],
  theme: 'classic',
  cardBack: 'classic',
  powerups: { enabled: [], perGrant: 1, grantTiming: 'match' }
};

/** A group of numbered cards of the same strength (value), with how many of them are in the deck. */
export interface NumberedCardGroup {
  value: number;
  count: number;
}

/** Groups a numbered deck by strength, from the weakest to the strongest. */
export function groupNumberedCards(cards: number[]): NumberedCardGroup[] {
  const groups: NumberedCardGroup[] = [];
  for (const value of cards) {
    const existing = groups.find((group) => group.value === value);
    if (existing) {
      existing.count++;
    } else {
      groups.push({ value, count: 1 });
    }
  }
  return groups.sort((a, b) => a.value - b.value);
}

/** The deck with the amount of cards of a strength set to `count`. */
export function withCardCount(cards: number[], value: number, count: number): number[] {
  const others = cards.filter((candidate) => candidate !== value);
  return [...others, ...Array(Math.max(0, count)).fill(value)].sort((a, b) => a - b);
}

/** The deck with every card of a strength changed to another strength. */
export function withRenamedCardValue(cards: number[], oldValue: number, newValue: number): number[] {
  return cards.map((value) => (value === oldValue ? newValue : value));
}
/** The lobby options, falling back to the defaults for lobbies created without them. */
/** CSS class that applies a table theme on a page root (empty for the classic green felt). */
export function getTableThemeClass(theme: string | undefined): string {
  return theme && theme !== 'classic' ? `theme-${theme}` : '';
}

/** CSS classes for the back of a hidden card: the theme color plus the chosen back design pattern. */
export function getCardBackClass(options: { cardBack?: string } | undefined): string {
  const design = options?.cardBack ?? 'classic';
  return design === 'classic' ? 'card-back' : `card-back back-${design}`;
}

export function getLobbyOptions(lobby: Lobby | null | undefined): GameOptions {
  const options = { ...DEFAULT_GAME_OPTIONS, ...lobby?.options };
  options.powerups = { ...DEFAULT_GAME_OPTIONS.powerups!, ...lobby?.options?.powerups };
  return options;
}

/** All powerup types that exist in the game, in display order. */
export const ALL_POWERUP_TYPES: PowerupType[] = [
  'swap-cards',
  'cancel-card',
  'reverse-card-strengths',
  'random-card',
  'hide-card-strength',
  'increase-card-strength',
  'decrease-card-strength',
  'peek-card',
  'shield'
];

/** True for the four manilhas of the manilha velha deck: 4 of clubs (Zap), 7 of hearts, ace of spades and 7 of diamonds. */
/** Ranks from strongest to weakest in the truco deck. */
const RANKS_STRONGEST_FIRST = ['3', '2', 'A', 'K', 'J', 'Q', '7', '6', '5', '4'];

/**
 * The manilha rank of a manilha nova match: one level above the turned card.
 * When a 3 is turned (the strongest common card), the manilhas are the 4s.
 */
export function getManilhaNovaRank(turnedCardLabel: string | undefined): string | null {
  if (!turnedCardLabel) return null;
  const index = RANKS_STRONGEST_FIRST.indexOf(turnedCardLabel);
  if (index < 0) return null;
  return index === 0 ? '4' : RANKS_STRONGEST_FIRST[index - 1];
}

/**
 * True when a card is a manilha in the current match. With a turned card
 * (manilha nova), the manilhas are every card of the rank above it. Without
 * one, the fixed manilhas of the manilha velha deck apply.
 */
export function isManilhaCardInMatch(
  card: { label?: string; suit?: string } | undefined,
  turnedCard: { label?: string; suit?: string } | undefined
): boolean {
  if (!card?.label || !card?.suit) return false;
  if (turnedCard?.label) return card.label === getManilhaNovaRank(turnedCard.label);
  return isManilhaCard(card);
}
/** One level below the given rank in truco strength, wrapping from the weakest (4) to the strongest (3). */
export function getManilhaRankBelow(turnedCardLabel: string | undefined): string | null {
  if (!turnedCardLabel) return null;
  const index = RANKS_STRONGEST_FIRST.indexOf(turnedCardLabel);
  if (index < 0) return null;
  return RANKS_STRONGEST_FIRST[(index + 1) % RANKS_STRONGEST_FIRST.length];
}

/** How manilhas are defined in a round: one level above the flipped card, one below it, or the fixed manilha velha ones. */
export type ManilhaMode = 'above' | 'below' | 'fixed';

/**
 * The manilha mode of a round. In manilha paraguaia it cycles every three
 * rounds: above the flipped card, below it, then the fixed manilhas.
 * Manilha nova is always 'above' and manilha velha always 'fixed'.
 */
export function getManilhaMode(
  cardType: string | undefined,
  turnedCard: { label?: string } | undefined,
  roundNumber: number
): ManilhaMode {
  if (cardType === 'manilha-paraguaia' && turnedCard?.label) {
    const cycle = (roundNumber - 1) % 3;
    return cycle === 0 ? 'above' : cycle === 1 ? 'below' : 'fixed';
  }
  return turnedCard?.label ? 'above' : 'fixed';
}

/** True when a card is a manilha under the mode of the given round. */
export function isManilhaInRound(
  card: { label?: string; suit?: string } | undefined,
  mode: ManilhaMode,
  turnedCard: { label?: string; suit?: string } | undefined
): boolean {
  if (!card?.label || !card?.suit) return false;
  if (mode === 'fixed') return isManilhaCard(card);
  const manilhaRank = mode === 'above'
    ? getManilhaNovaRank(turnedCard?.label)
    : getManilhaRankBelow(turnedCard?.label);
  return manilhaRank !== null && card.label === manilhaRank;
}
export function isManilhaCard(card: { label?: string; suit?: string } | undefined): boolean {
  if (!card?.label || !card?.suit) return false;
  return (card.label === '4' && card.suit === 'clubs') ||
    (card.label === '7' && (card.suit === 'hearts' || card.suit === 'diamonds')) ||
    (card.label === 'A' && card.suit === 'spades');
}

export interface RankingRow {
  position: number;
  playerId: string;
  name: string;
  emote?: string;
  color?: string;
  leader: boolean;
  isCurrentPlayer: boolean;
}

/**
 * Builds the final ranking rows from the ids sent by the backend, which
 * are already ordered: winner (last survivor) first, then the last player
 * eliminated, down to the first player eliminated in last place.
 */
export function buildRankingRows(
  players: Lobby['players'],
  ranking: string[],
  currentPlayerId: string | undefined
): RankingRow[] {
  return ranking.map((playerId, index) => {
    const player = players.find((candidate) => candidate.id === playerId);
    return {
      position: index + 1,
      playerId,
      name: player?.name ?? playerId,
      emote: player?.emote,
      color: player?.color,
      leader: player?.leader ?? false,
      isCurrentPlayer: playerId === currentPlayerId
    };
  });
}

export type GamePhase = 'waiting-match' | 'guessing' | 'round' | 'transition';

/**
 * Derives what the game page should show from the shared lobby state.
 * Guessing comes first (match.nextPlayerId set), then rounds
 * (match.round set). Between matches there is no match at all.
 */
export function getGamePhase(game: Game | undefined): GamePhase {
  if (!game || !game.match) return 'waiting-match';
  if (game.match.nextPlayerId) return 'guessing';
  if (game.match.round) return 'round';
  return 'transition';
}

/** Id of the player who must act now (guess or play a card), if any. */
export function getTurnPlayerId(game: Game | undefined): string | undefined {
  if (!game || !game.match) return undefined;
  if (game.match.nextPlayerId) return game.match.nextPlayerId;
  return game.match.round?.nextPlayerId;
}

/** Seconds the backend gives a player to guess or play a card before it acts for them. */
export const BACKEND_ACTION_TIME_SECONDS = 18;

/** Safety margin so the frontend countdown ends before the backend automatic action. */
export const TIMER_SAFETY_MARGIN_SECONDS = 3;

/** Seconds shown on the frontend countdown for a player action (backend time minus the margin). */
export const ACTION_TIME_SECONDS = BACKEND_ACTION_TIME_SECONDS - TIMER_SAFETY_MARGIN_SECONDS;

/** Seconds between phases (next match/round) before the server moves on. */
export const TRANSITION_TIME_SECONDS = 5;

/** Seconds the final table of a finished round stays shown before the next round. */
export const ROUND_END_TIME_SECONDS = 10;

/**
 * How long the current countdown window lasts, mirroring the backend
 * timers: the action window (backend time minus the safety margin) while
 * a player must guess or play a card, 5s in between.
 */
export function getCountdownSeconds(
  phase: GamePhase,
  turnPlayerId: string | undefined,
  showingFinishedRound = false,
  options: GameOptions = DEFAULT_GAME_OPTIONS
): number {
  const playerMustAct = turnPlayerId !== undefined && (phase === 'guessing' || phase === 'round');
  if (playerMustAct) {
    // Mostra alguns segundos a menos que o tempo do backend.
    // Assim o contador termina antes da ação automática (ver TIMER_SAFETY_MARGIN_SECONDS).
    return Math.max(
      1,
      (options.playerActionTimeSeconds ?? BACKEND_ACTION_TIME_SECONDS) - TIMER_SAFETY_MARGIN_SECONDS
    );
  }
  if (phase === 'transition' && showingFinishedRound) {
    return options.roundEndTimeSeconds ?? ROUND_END_TIME_SECONDS;
  }
  return TRANSITION_TIME_SECONDS;
}

/**
 * A key that changes whenever the backend restarts its timer: a new match
 * or round, a new player to act, a guess made or a card played. The game
 * page resets its countdown every time this key changes.
 */
export function getCountdownKey(game: Game | undefined): string {
  if (!game) return 'no-game';
  const match = game.match;
  const guessesMade = match
    ? Object.values(match.players).filter((player) => player.numWinsNeeded !== undefined).length
    : 0;
  const cardsOnTable = match?.round
    ? match.round.cards.onMatch.length + match.round.cards.anulledCards.length
    : 0;
  return [
    game.matchNumber,
    game.roundNumber,
    getGamePhase(game),
    getTurnPlayerId(game) ?? 'none',
    guessesMade,
    cardsOnTable
  ].join(':');
}

/** A match with a single card where your own card stays hidden. */
export function isSpecialMatch(match: Match | undefined): boolean {
  return match !== undefined && match.numRounds === 1 && match.currentPlayerCards.length === 0;
}

/**
 * The guess the current player cannot make, mirroring the backend rule:
 * the last player to guess may not make the sum of all guesses equal the
 * number of cards (rounds) in the match. Returns null when nothing is
 * forbidden (not your turn, not the last to guess, or result out of range).
 */
export function getForbiddenGuess(match: Match, currentPlayerId: string | undefined): number | null {
  if (!currentPlayerId || match.nextPlayerId !== currentPlayerId) return null;

  let guessesSum = 0;
  for (const [playerId, playerMatch] of Object.entries(match.players)) {
    if (playerId === currentPlayerId) continue;
    if (playerMatch.numWinsNeeded === undefined) return null;
    guessesSum += playerMatch.numWinsNeeded;
  }

  const forbidden = match.numRounds - guessesSum;
  return forbidden >= 0 && forbidden <= match.numRounds ? forbidden : null;
}

/** Builds the end-of-match summary rows (guess, rounds won, lives change) for every player of a match. */
export function buildMatchSummary(
  match: Match | undefined,
  healthUpdate: { [playerId: string]: number },
  playerOrder: string[] = []
): MatchSummaryRow[] {
  if (!match) return [];
  const orderedIds = Object.keys(match.players).sort(
    (a, b) => playerOrder.indexOf(a) - playerOrder.indexOf(b)
  );
  return orderedIds.map((playerId) => ({
    playerId,
    guessed: match.players[playerId].numWinsNeeded ?? 0,
    won: match.players[playerId].numWonRounds,
    healthDelta: healthUpdate[playerId] ?? 0
  }));
}