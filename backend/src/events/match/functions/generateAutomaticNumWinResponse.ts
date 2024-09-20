
import i18n from '../../../plugins/i18n';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import { handleWinRoundsNumberResponse } from '../handlers/winRoundsNumberResponse';
import { checkValidFinalGuess } from './checkValidFinalGuess';
import Lobby from '../../../interfaces/Lobby';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';

/**
 *  Gera uma resposta automática para o palpite de um usuário. Isso deve acontecer quando o usuário demora muito para palpitar.
 *  Sempre palpitará 0 vitórias quando for possível. Caso contrário, será palpitado o valor 1.
 *  Além disso, essa função também pode gerar erros internos, caso o lobby não possua as informações necessárias.
 *
 *  @param lobby informações do lobby atual
 */
export function generateAutomaticNumWinResponse(lobby: Lobby): void {
  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')), );
  }

  if (!lobby.game.match) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  }

  if (!lobby.game.match.nextPlayerId) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NO_NEXT_PLAYER_IN_MATCH')));
  }

  if (!lobby.players.map((player) => player.id).includes(lobby.game.match.nextPlayerId)) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.INVALID_NEXT_PLAYER_ID_IN_MATCH')));
  }

  try {
    const player = createPlayer(io, lobby.game.match.nextPlayerId);

    if (checkValidFinalGuess(lobby, 0)) {
      handleWinRoundsNumberResponse(player, 0);
    } else {
      handleWinRoundsNumberResponse(player, 1);
    }
  }
  catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
