
import Lobby, { SpecialMatchCards } from '../../../interfaces/Lobby';
import i18n from '../../../plugins/i18n';
import { getAlivePlayersIds } from '../../functions/getAlivePlayersIds';
import { getNextPlayerId } from '../../functions/getNextPlayerId';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import { getNextMatchNumCards } from './getNextMatchNumCards';
import { getDefaultCards } from '../../functions/getDefaultCards';
import { getPlayersCards } from './getPlayersCards';
import { Match } from '../../../interfaces/Lobby';
import { createPlayer } from '../../functions/createPlayer';
import { io } from '../../..';
import { insertCard } from '../../round/functions/insertCard';
import Timer from 'easytimer.js';
import { generateAutomaticNumWinResponse } from './generateAutomaticNumWinResponse';

/**
 *  Função que começa uma partida de "little-fuck". Essa função é responsável por:
 *  - Criar um objeto Match (de forma in-place, ou seja, modifica o objeto `player.lobby` diretamente)
 *  - Enviar mensagens para todos os jogadores que a partida começou
 *  - Cadastrar um timer para que o primeiro jogador faça o palpite automaticamente caso ele não palpite a tempo
 *
 *  @param lobby Objeto contendo informações do lobby
 */
export function startNewMatch(lobby: Lobby): void {
  if (!lobby.game) {
    return generateInternalServerError(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  }

  try {
    // Atualiza as informações de "game"
    lobby.game.currentPlayerId = getNextPlayerId(lobby.game.currentPlayerId, lobby);

    const alivePlayersIds = getAlivePlayersIds(lobby);
    const defaultCards = getDefaultCards();
    lobby.game.numRounds = getNextMatchNumCards(lobby.game.numRounds, alivePlayersIds, defaultCards);

    lobby.game.status = 'waiting_num_win_response';

    // Cria as informações de "match"
    const playersCards = getPlayersCards(alivePlayersIds, defaultCards, lobby.game.numRounds);
    const matchPlayers: Match['players'] = {};
    for (const alivePlayerId of alivePlayersIds) {
      matchPlayers[alivePlayerId] = {
        cards: playersCards[alivePlayerId],
        numWonRounds: 0
      };
    }
    lobby.game.match = {
      nextPlayerId: lobby.game.currentPlayerId,
      roundFirstPlayerId: lobby.game.currentPlayerId,
      players: matchPlayers
    };

    // Envia as mensagens para os jogadores sobre o início da partida (infos de carta e quem deve começar a palpitar)
    const player = createPlayer(io, lobby.game.currentPlayerId);
    if (lobby.game.numRounds === 1) {
      // Se atualmente tivermos apenas uma carta, então é uma partida especial
      // Na partida especial, os jogadores podem ver as cartas dos outros jogadores, menos a própria carta
      const playersSpecialMatchCards: { [playerId: string]: SpecialMatchCards } = {};
      for (const playerIdToReceiveCards of alivePlayersIds) {
        playersSpecialMatchCards[playerIdToReceiveCards] = { onMatch: [], anulledCards: [] };
        for (const playerIdToShowCards of alivePlayersIds) {
          if (playerIdToReceiveCards === playerIdToShowCards) {
            continue;
          }
          playersSpecialMatchCards[playerIdToReceiveCards] = insertCard(
            playersSpecialMatchCards[playerIdToReceiveCards],
            {
              card: playersCards[playerIdToShowCards][0],
              playerId: playerIdToShowCards
            }
          );
        }
      }
      player.eventsEmitter.Match.emitStartSpecialMatch(playersSpecialMatchCards, lobby.game.currentPlayerId);
    } else {
      // Se tiver mais de uma carta, então é uma partida comum, ou seja, os jogadores não podem ver as cartas dos outros jogadores (apenas são informados as suas próprias cartas)
      player.eventsEmitter.Match.emitStartMatch(playersCards, lobby.game.currentPlayerId);
    }

    // Cadastra um timer para que o primeiro jogador faça o palpite automaticamente caso ele não palpite a tempo
    const timer = new Timer();
    timer.addEventListener('targetAchieved', () => {
      generateAutomaticNumWinResponse(lobby);
    });
    timer.start({ countdown: true, startValues: { seconds: 15 } });
    lobby.game.timer = timer;

  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
