
import { lobby } from '@/connection'
import type { Game } from '@/interfaces/Lobby';

const INITIAL_HEALTH = 3;
const INITIAL_WAIT_TIME = 5;
const INITIAL_MATCH_NUMBER = 1;
const INITIAL_ROUND_NUMBER = 1;

/**
 *  Evento indicando o início de um jogo completo de "Little Fuck"
 */
export function handleStartGame() {
  if (lobby.value === null) {
    throw new Error('Você não está em um lobby !');
  }

  if (lobby.value.game) {
    throw new Error('Não foi possível iniciar o jogo: O jogo já começou !');
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
