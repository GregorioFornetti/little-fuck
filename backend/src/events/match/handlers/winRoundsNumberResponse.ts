import Timer from 'easytimer.js';
import Player from '../../../interfaces/Player';
import { getNextPlayerId } from '../../functions/getNextPlayerId';
import { generateInternalServerError } from '../../general/functions/generateInternalServerError';
import { checkValidFinalGuess } from '../functions/checkValidFinalGuess';
import { generateAutomaticNumWinResponse } from '../functions/generateAutomaticNumWinResponse';
import Lobby from '../../../interfaces/Lobby';
import { endSpecialMatch } from '../functions/endSpecialMatch';
import { startNewRound } from '../../round/functions/startNewRound';

/**
 *  Mensagem que o cliente enviará para indicar o seu palpite.
 *  O palpite consiste em dizer, a partir das cartas recebidas e dos outros palpites prévios,
 *  quantas rodadas que o jogador acha que irá vencer.
 *  Caso seja a vez do jogador palpitar, e o palpite for válido (não é negativo),
 *  este palpite será passado para todos os outros jogadores e o próximo na fila deve palpitar
 *  (o servidor chamará o evento `win-rounds-number-update`).
 *  Caso não seja um palpite válido ou não seja a vez do jogador, o servidor irá informar esse erro a partir do evento `win-rounds-number-error`.
 *
 *  OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias igual ao
 *  número de cartas.
 *  Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias,
 *  o último jogador não poderá palpitar apenas uma vitória, e sim palpitar 0 vitórias ou 2 ou mais vitórias
 *  (para que o somatório não dê 5 (4 + 1 = 5)).
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param numWinsRounds Número de rodadas que o jogador acha que irá vencer
 */
export function handleWinRoundsNumberResponse(player: Player, numWinsRounds: number) {
  if (!player.lobby) {
    player.eventsEmitter.Match.emitWinRoundsNumberError('not-in-lobby');
    return;
  }
  const lobby: Lobby = player.lobby;

  if (!lobby.game) {
    player.eventsEmitter.Match.emitWinRoundsNumberError('not-in-game');
    return;
  }

  if (!lobby.game.match) {
    player.eventsEmitter.Match.emitWinRoundsNumberError('not-in-match');
    return;
  }

  if (!(player.playerId === lobby.game.match.nextPlayerId)) {
    player.eventsEmitter.Match.emitWinRoundsNumberError('not-your-turn');
    return;
  }

  if (numWinsRounds < 0) {
    player.eventsEmitter.Match.emitWinRoundsNumberError('negative-is-invalid');
    return;
  }

  try {
    if (!checkValidFinalGuess(player.lobby, numWinsRounds)) {
      player.eventsEmitter.Match.emitWinRoundsNumberError('num-wins-equals-num-cards');
      return;
    }

    lobby.game.timer.stop();
    lobby.game.timer = new Timer();

    lobby.game.match.players[player.playerId].numWinsNeeded = numWinsRounds;

    lobby.game.match.nextPlayerId = getNextPlayerId(lobby.game.match.nextPlayerId, lobby);

    if (lobby.game.match.nextPlayerId === lobby.game.currentPlayerId) {
      // O último jogador acabou de palpitar, hora de começar uma rodada ou finalizar a partida especial
      lobby.game.match.nextPlayerId = undefined;
      if (lobby.game.numRounds === 1) {
        // Se tivermos apenas uma carta, então é uma partida especial. Nesse caso, precisamos finalizar a partida especial
        lobby.game.status = 'ending_special_match';
        lobby.game.timer.start({ countdown: true, startValues: { seconds: 5 } });
        lobby.game.timer.addEventListener('targetAchieved', () => {
          endSpecialMatch(lobby);
        });
      } else {
        // Se tivermos mais de uma carta, então é uma partida normal. Nesse caso, precisamos começar uma rodada
        lobby.game.status = 'starting_round';
        lobby.game.timer.start({ countdown: true, startValues: { seconds: 5 } });
        lobby.game.timer.addEventListener('targetAchieved', () => {
          startNewRound(lobby);
        });
      }
    } else {
      // Ainda restam palpites a serem feitos... É preciso cadastrar o timer para palpite automático do próximo player
      lobby.game.timer.start({ countdown: true, startValues: { seconds: 15 } });
      lobby.game.timer.addEventListener('targetAchieved', () => {
        generateAutomaticNumWinResponse(lobby);
      });
    }

    player.eventsEmitter.Match.emitWinRoundsNumberUpdate(numWinsRounds, lobby.game.match.nextPlayerId);

  } catch (error) {
    generateInternalServerError(lobby, error as Error);
  }
}
