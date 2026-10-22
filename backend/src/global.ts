import { Socket } from 'socket.io';
import Lobby, { GameOptions } from './interfaces/Lobby';

export const lobbys: { [lobbyId: string]: Lobby } = {};
export const players: { [playerId: string]: {
    socket: Socket,
    lobby?: Lobby,
    /** Momento (Date.now) em que o jogador ficou offline. Undefined se estiver conectado */
    offlineSince?: number
} } = {};

/** Tempo máximo (ms) que um jogador pode ficar offline antes de ser removido da sala (10 minutos) */
export const OFFLINE_LIMIT_MS = 10 * 60 * 1000;

/** Seconds a player has to guess or play a card before the server acts for them. The frontend countdown shows 3 seconds less, so it ends before this automatic action. */
export const PLAYER_ACTION_TIME_SECONDS = 18;

/** Seconds the final table of a round stays visible before the next round (or the match end). */
export const ROUND_END_TIME_SECONDS = 10;

/** Valores padrão das opções de jogo (vidas e tempos atuais) */
export const DEFAULT_GAME_OPTIONS: GameOptions = {
  initialHealth: 3,
  playerActionTimeSeconds: PLAYER_ACTION_TIME_SECONDS,
  roundEndTimeSeconds: ROUND_END_TIME_SECONDS,
  cardType: 'numbered'
};
