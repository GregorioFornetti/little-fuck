import Lobby from '../../../interfaces/Lobby';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import i18n from '../../../plugins/i18n';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';
import { handleSelectCard } from '../handlers/selectCard';

/**
 *  Gera uma resposta automática para a escolha de carta do usuário.
 *  No caso, sempre escolherá a primeira carta que o jogador possui (índice 0).
 *  Além disso, essa função também pode gerar erros internos, caso o lobby não possua as informações necessárias.
 *
 *  @param lobby informações da sala
 */
export function generateAutomaticSelectCard(lobby: Lobby): void {

  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  }

  if (!lobby.game.match) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  }

  if (!lobby.game.match.round) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_ROUND')));
  }

  if (!lobby.game.match.round.nextPlayerId) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NO_NEXT_PLAYER_IN_ROUND')));
  }

  if (!lobby.players.map((player) => player.id).includes(lobby.game.match.round.nextPlayerId)) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.INVALID_NEXT_PLAYER_ID_IN_ROUND')));
  }

  try {
    const player = createPlayer(io, lobby.game.match.round.nextPlayerId);

    handleSelectCard(player, 0);
  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
