import type { Game, Lobby, Match } from '@/interfaces/Lobby';

export interface RankingRow {
  position: number;
  playerId: string;
  name: string;
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
  showingFinishedRound = false
): number {
  const playerMustAct = turnPlayerId !== undefined && (phase === 'guessing' || phase === 'round');
  if (playerMustAct) return ACTION_TIME_SECONDS;
  if (phase === 'transition' && showingFinishedRound) return ROUND_END_TIME_SECONDS;
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
