
import { io } from '../../..';
import Lobby from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';
import { createPlayer } from '../../functions/createPlayer';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';

/**
 *  Função que finaliza uma jogo de "little-fuck". Essa função é responsável por:
 *  - Desenstanciar o Game
 *  - Enviar mensagens para todos os jogadores que o jogo finalizou
 *
 *  OBS: essa função só deve ser chamada caso tenha 1 ou nenhum jogador vivo !
 *
 *  @param lobby Objeto contendo informações do lobby
 */
export function endGame(lobby: Lobby): void {
  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  }

  const player = createPlayer(io, lobby.players[0].id);
  const playersRanks: string[] = lobby.game.deadPlayersIds;

  for (const playerId in lobby.game?.playersHealth) {
    if (lobby.game?.playersHealth[playerId] > 0) {
      playersRanks.push(playerId); // Se tiver um jogador vivo este será colocado na lista de ranking na ultima posição (que será invertida e ele ficará em primeiro, o vencedor)
      break;
    }
  }

  player.eventsEmitter.Game.emitEndGame(playersRanks);

  lobby.game = undefined;
}
