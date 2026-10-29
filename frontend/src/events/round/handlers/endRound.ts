
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.
 *
 *  @param winnerId Id do jogador que venceu a rodada. Se for empate, esse valor será um id qualquer dentro do lobby.
 *  @param points número de pontos que o jogador vencedor ganhou. Se for um empate, esse valor será 0.
 */
export function handleEndRound(winnerId: string, points: number) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  if (!lobby.value.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED'));
  }

  if (!lobby.value.game.match.round) {
    throw new Error(i18n.t('COMMON.ERROR.ROUND_NOT_STARTED'));
  }

  const isLastRound = lobby.value.game.roundNumber >= lobby.value.game.match.numRounds;

  // Guarda a mesa final e o vencedor para serem exibidos antes da próxima rodada
  // A mesa final é revelada: cartas escondidas por poderes voltam a aparecer
  const anyHidden = [...lobby.value.game.match.round.cards.onMatch, ...lobby.value.game.match.round.cards.anulledCards].some((roundCard) => roundCard.hidden);
  const revealedCards = !anyHidden ? lobby.value.game.match.round.cards : {
    onMatch: lobby.value.game.match.round.cards.onMatch.map((roundCard) => ({ ...roundCard, hidden: false })),
    anulledCards: lobby.value.game.match.round.cards.anulledCards.map((roundCard) => ({ ...roundCard, hidden: false }))
  };
  lobby.value.game.lastRound = {
    cards: revealedCards,
    winnerId,
    points
  };

  lobby.value.game.currentRounds = [
    ...(lobby.value.game.currentRounds ?? []),
    { cards: lobby.value.game.match.round.cards, winnerId, points }
  ];
  lobby.value.game.currentRoundWinners = [
    ...(lobby.value.game.currentRoundWinners ?? []),
    { winnerId, points }
  ];

  lobby.value.game.match.round = undefined;
  lobby.value.game.match.players[winnerId].numWonRounds += points;
  lobby.value.game.roundNumber = isLastRound ? 1 : lobby.value.game.roundNumber + 1;
}
