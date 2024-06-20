import type { Match, PlayerMatch, SpecialMatchCards } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Iniciará a partida especial, quando todos os jogadores possuem apenas uma carta.
 *  Todos os jogadores poderão ver as cartas dos outros, porém, não poderão ver a própria carta.
 *
 *  Após todos os jogadores palpitarem, será acionado o evento table-update, mostrando o estado final da mesa para todos os jogadores
 *  e logo em seguida o evento `end-round` será também acionado. Depois de um tempo, será acionado o evento `end-match`.
 *
 *  @param cards cartas de todos os outros jogadores, menos a própria carta
 *  @param firstPlayerId id do jogador que deve começar palpitando
 */
export function handleStartSpecialMatch(cards: SpecialMatchCards, firstPlayerId: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  if (lobby.value.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.MATCH_ALREADY_STARTED'));
  }

  const players = lobby.value.players;
  const playersMatch = players.reduce<Record<string, PlayerMatch>>((playersMatch, player) => {
    playersMatch[player.id] = {
      numCards: 1,
      numWonRounds: 0
    };

    return playersMatch;
  }, {});

  const specialMatch: Match = {
    players: playersMatch,
    currentPlayerCards: [],
    numRounds: 1,
    nextPlayerId: firstPlayerId,
    round: {
      cards
    }
  };

  lobby.value.game.match = specialMatch;
}
