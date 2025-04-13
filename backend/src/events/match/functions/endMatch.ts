
import Lobby from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';
import Timer from 'easytimer.js';
import { endGame } from '../../game/functions/endGame';
import { startNewMatch } from './startNewMatch';

/**
 *  Função que finaliza uma partida de "little-fuck". Essa função é responsável por:
 *  - Desenstanciar o Match
 *  - Enviar mensagens para todos os jogadores que a partida finalizou
 *  - Cadastrar um timer para o ínicio de uma nova partida ou para o fim de um jogo
 *
 *  @param lobby Objeto contendo informações do lobby
 */
export function endMatch(lobby: Lobby): void {
  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  }

  if (!lobby.game.match) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  }

  try {
    const player = createPlayer(io, lobby.players[0].id);

    const playersHealthUpdate: { [playerId: string]: number } = {};
    for (const playerId in lobby.game.match.players) {
      const playerInfo = lobby.game.match.players[playerId];
      playersHealthUpdate[playerId] = playerInfo.numWinsNeeded === playerInfo.numWonRounds ? 0 : -1;
      lobby.game.playersHealth[playerId] += playersHealthUpdate[playerId];

      if (lobby.game.playersHealth[playerId] <= 0 && !lobby.game.deadPlayersIds.includes(playerId)) {
        lobby.game.deadPlayersIds.push(playerId);
      }
    }

    player.eventsEmitter.Match.emitEndMatch(playersHealthUpdate);

    lobby.game.match = undefined;

    lobby.game.timer.stop();
    lobby.game.timer = new Timer();

    if (lobby.game.deadPlayersIds.length >= Object.keys(lobby.game.playersHealth).length - 1) {
      // Só restou um ou nenhum jogador vivo, ou seja, o jogo acabou
      lobby.game.timer.addEventListener('targetAchieved', () => {
        endGame(lobby);
      });
      lobby.game.timer.start({ countdown: true, startValues: { seconds: 5 } });

      lobby.game.status = 'ending_game';
    } else {
      // Ainda existem mais de um jogador vivo, então uma nova partida será iniciada
      lobby.game.timer.addEventListener('targetAchieved', () => {
        startNewMatch(lobby);
      });
      lobby.game.timer.start({ countdown: true, startValues: { seconds: 5 } });

      lobby.game.matchNumber++;

      lobby.game.status = 'starting_match';
    }
  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
