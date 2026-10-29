import type { RoundCards } from '@/interfaces/Lobby';
import { lobby, playerId } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala atualizem
 *  o status da mesa e saibam qual é o próximo jogador que deve jogar
 *
 *  @param cards cartas jogadas até o momento
 *  @param nextPlayerId id do próximo jogador que deve jogar. Pode ser undefined caso todos os jogadores já tenham jogado
 */
export function handleTableUpdate(cards: RoundCards, nextPlayerId?: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  if (!lobby.value.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.MATCH_NOT_STARTED'));
  }

  const match = lobby.value.game.match;

  if (!match.round) {
    throw new Error(i18n.t('COMMON.ERROR.ROUND_NOT_STARTED'));
  }

  const round = match.round;

  // O jogador que acabou de jogar é o que deveria jogar antes dessa atualização.
  // A carta jogada por ele é descartada: sai da contagem de cartas dele.
  // Se for o jogador atual, a carta também sai da sua mão.
  const playedCard = [...cards.onMatch, ...cards.anulledCards]
    .find((roundCard) => roundCard.playerId === round.nextPlayerId);

  if (playedCard) {
    // A carta jogada consome qualquer modificador de força pendente daquele jogador
    if (match.pendingStrength) {
      delete match.pendingStrength[playedCard.playerId];
    }

    const playerMatch = match.players[playedCard.playerId];
    if (playerMatch && playerMatch.numCards > 0) {
      playerMatch.numCards -= 1;
    }

    if (playedCard.playerId === playerId) {
      const cardIndex = match.currentPlayerCards.findIndex(
        (card) => card.type === playedCard.card.type && card.value === playedCard.card.value
      );
      if (cardIndex !== -1) {
        match.currentPlayerCards.splice(cardIndex, 1);
      }
    }
  }

  round.cards = cards;
  round.nextPlayerId = nextPlayerId;
}
