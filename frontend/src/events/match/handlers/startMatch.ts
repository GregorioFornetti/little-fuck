import type { Card, Match, PlayerMatch } from "@/interfaces/Lobby";
import { lobby } from '@/connection'
import { i18n } from "@/plugins/i18n";

/**
 *  Evento enviado para indicar o início da partida.
 * 
 *  @param cards cartas que o jogador atual possui
 *  @param firstPlayerId id do jogador que deve começar a partida
 */
export function handleStartMatch(cards: Card[], firstPlayerId: string) {
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
      numCards: cards.length,
      numWonRounds: 0
    }

    return playersMatch;
  }, {});

  const match: Match = {
    players: playersMatch,
    currentPlayerCards: cards,
    numRounds: cards.length,
    nextPlayerId: firstPlayerId
  }

  lobby.value.game.match = match;
}
