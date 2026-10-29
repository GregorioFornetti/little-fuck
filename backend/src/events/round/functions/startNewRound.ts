
import Lobby from '../../../interfaces/Lobby';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import i18n from '../../../plugins/i18n';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';
import Timer from 'easytimer.js';
import { PLAYER_ACTION_TIME_SECONDS } from '../../../global';
import { generateAutomaticSelectCard } from './generateAutomaticSelectCard';
import { scheduleBotTurn } from '../../bot/scheduleBotTurn';
import { getManilhaParaguaiaStrength } from '../../functions/getManilhaParaguaiaStrength';

/**
 *  Função que começa uma rodada de "little-fuck". Essa função é responsável por:
 *  - Criar um objeto Round
 *  - Enviar mensagens para todos os jogadores que a rodada começou
 *  - Cadastrar um timer para que o primeiro jogador selecione a carta automaticamente caso ele não selecione a tempo
 *
 *  @param lobby Objeto contendo informações do lobby
 */
export function startNewRound(lobby: Lobby): void {
  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  }

  if (!lobby.game.match) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  }

  if (!lobby.game.match.roundFirstPlayerId) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NO_FIRST_PLAYER_ID_IN_ROUND')));
  }

  try {
    const player = createPlayer(io, lobby.players[0].id);

    // Na manilha paraguaia, a força das cartas muda a cada rodada.
    // Recalcula a força das cartas que ainda estão nas mãos dos jogadores
    // seguindo o ciclo da rodada que está começando.
    if (lobby.options?.cardType === 'manilha-paraguaia' && lobby.game.match.turnedCard) {
      const turnedCard = lobby.game.match.turnedCard;
      const roundNumber = lobby.game.roundNumber;
      for (const playerId in lobby.game.match.players) {
        const matchPlayer = lobby.game.match.players[playerId];
        matchPlayer.cards = matchPlayer.cards.map((card) => ({
          ...card,
          value: getManilhaParaguaiaStrength(card, turnedCard, roundNumber)
        }));
      }
    }
    lobby.game.match.round = {
      cards: {
        onMatch: [],
        anulledCards: []
      },
      nextPlayerId: lobby.game.match.roundFirstPlayerId
    };

    lobby.game.status = 'waiting_select_card';
    lobby.game.timer.stop();
    lobby.game.timer = new Timer();
    lobby.game.timer.start({ countdown: true, startValues: { seconds: lobby.options?.playerActionTimeSeconds ?? PLAYER_ACTION_TIME_SECONDS } });
    lobby.game.timer.addEventListener('targetAchieved', () => {
      generateAutomaticSelectCard(lobby);
    });

    player.eventsEmitter.Round.emitStartRound(lobby.game.match.roundFirstPlayerId);

    scheduleBotTurn(lobby);

  } catch(error) {
    generateInternalServerError(lobby, error as Error);
  }
}
