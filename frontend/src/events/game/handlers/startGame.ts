import type { Game } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

const INITIAL_HEALTH = 3;
const INITIAL_WAIT_TIME = 5;
const INITIAL_MATCH_NUMBER = 1;
const INITIAL_ROUND_NUMBER = 1;

/**
 *  Evento indicando o início de um jogo completo de "Little Fuck"
 */
export function handleStartGame() {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  }

  const players = lobby.value.players as Array<{ id: string }>;
  const playersHealth = players.reduce<Record<string, number>>((playersHealth, player) => {
    playersHealth[player.id] = INITIAL_HEALTH;
    return playersHealth;
  }, {});

  const game: Game = {
    currentWaitTime: INITIAL_WAIT_TIME,
    matchNumber: INITIAL_MATCH_NUMBER,
    roundNumber: INITIAL_ROUND_NUMBER,
    playersHealth
  };

  lobby.value.game = game;
}
