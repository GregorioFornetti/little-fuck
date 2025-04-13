
import Lobby from '../../../interfaces/Lobby';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import i18n from '../../../plugins/i18n';
import { io } from '../../..';
import { createPlayer } from '../../functions/createPlayer';
import { insertCard } from '../../round/functions/insertCard';
import { endRound } from '../../round/functions/endRound';

/**
 *  Função que inicia a finalização de uma partida especial de "little-fuck". Essa função é responsável por:
 *  - Enviar mensagem para todos jogadores sobre a situação final da mesa (`table-update`)
 *  - Iniciar a finalização da partida especial (pela função `endRound`)
 *
 *  @param lobby Objeto contendo informações do lobby
 */
export function endSpecialMatch(lobby: Lobby): void {
  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  }

  if (!lobby.game.match) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  }

  try {
    const player = createPlayer(io, lobby.players[0].id);

    lobby.game.match.round = {
      cards: {
        onMatch: [],
        anulledCards: []
      }
    };

    for (const playerId in lobby.game.match.players) {
      lobby.game.match.round.cards = insertCard(
        lobby.game.match.round.cards,
        { card: lobby.game.match.players[playerId].cards[0], playerId: playerId }
      );
    }

    player.eventsEmitter.Round.emitTableUpdate(lobby.game.match.round.cards);

    endRound(lobby);
  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
