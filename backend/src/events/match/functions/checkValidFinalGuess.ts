
import Lobby from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';
import { getNextPlayerId } from '../../functions/getNextPlayerId';

/**
 *  Irá retornar `false` caso seja o último jogador a palpitar e o palpite irá fazer com que o somatório de todos palpite
 *  resulte exatamente na quantidade atual de cartas. Caso contrário, irá retornar `true`.
 *
 *  @param lobby informações da sala
 *  @param currentGuess palpite atual do jogador
 *  @returns `true` caso o palpite seja válido, `false` caso contrário
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function checkValidFinalGuess(lobby: Lobby, currentGuess: number): boolean {
  if (!lobby.game) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'));
  }

  if (!lobby.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH'));
  }

  if (!lobby.game.match.nextPlayerId) {
    throw new Error(i18n.t('COMMON.ERROR.NO_NEXT_PLAYER_IN_MATCH'));
  }

  const currentPlayerId = lobby.game.match.nextPlayerId;
  const nextPlayerId = getNextPlayerId(currentPlayerId, lobby);
  const isCurrentPlayerLast = nextPlayerId === lobby.game.match.roundFirstPlayerId;

  let totalWinGuesses = 0;
  for (const playerId in lobby.game.match.players) {
    if (lobby.game.match.players[playerId].numWinsNeeded) {
      totalWinGuesses += lobby.game.match.players[playerId].numWinsNeeded;
    }
  }
  totalWinGuesses += currentGuess;
  const isGuessesSumEqualToCurrentNumCards = totalWinGuesses === lobby.game.numRounds;

  return isCurrentPlayerLast && isGuessesSumEqualToCurrentNumCards;
}
