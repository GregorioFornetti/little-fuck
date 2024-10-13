
import Lobby from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';
import Timer from 'easytimer.js';
import { endMatch } from '../../match/functions/endMatch';
import { startNewRound } from './startNewRound';

/**
 *  Função que finaliza uma rodada de "little-fuck". Essa função é responsável por:
 *  - Desenstanciar o Round
 *  - Enviar mensagens para todos os jogadores que a rodada finalizou
 *  - Cadastrar um timer para o ínicio de uma nova rodada ou para o fim de uma partida (caso seja a última rodada)
 *
 *  @param lobby Objeto contendo informações do lobby
 */
export function endRound(lobby: Lobby): void {
  if (!lobby.game) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'));
  }

  if (!lobby.game.match) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH'));
  }

  if (!lobby.game.match.round) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_ROUND'));
  }

  const player = createPlayer(io, lobby.players[0].id);

  let winnerId = lobby.players[0].id;
  let points = 1;
  if (lobby.game.match.round.cards.onMatch.length > 0) {
    // Ainda existe pelo menos uma carta em jogo, então teve um vencedor nessa rodada (o que estiver primeiro rankeado)
    winnerId = lobby.game.match.round.cards.onMatch[0].playerId;
  } else {
    // Se não tiver nenhuma carta em jogo, quer dizer que todas foram anuladas (empate). Então tanto faz quem ganhou, pois este receberá 0 pontos
    points = 0;
  }

  player.eventsEmitter.Round.emitEndRound(winnerId, points);

  lobby.game.match.players[winnerId].numWonRounds += points;

  lobby.game.match.round = undefined;

  if (lobby.game.roundNumber === lobby.game.numRounds) {
    // A rodada atual foi a última, então a partida acabou
    lobby.game.timer = new Timer();
    lobby.game.timer.addEventListener('targetAchieved', () => {
      endMatch(lobby);
    });
    lobby.game.timer.start({ countdown: true, startValues: { seconds: 5 } });

    lobby.game.roundNumber = 1;

    lobby.game.status = 'ending_match';
  } else {
    // A rodada atual não foi a ultima, então deve começar uma nova
    lobby.game.timer = new Timer();
    lobby.game.timer.addEventListener('targetAchieved', () => {
      startNewRound(lobby);
    });
    lobby.game.timer.start({ countdown: true, startValues: { seconds: 5 } });

    lobby.game.roundNumber++;

    lobby.game.status = 'starting_round';
  }
}
