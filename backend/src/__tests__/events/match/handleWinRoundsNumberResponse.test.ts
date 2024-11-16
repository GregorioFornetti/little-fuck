
import { lobbys, players } from '../../../global';

import { player } from '../setupTests';
import { Timer } from 'easytimer.js';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { handleWinRoundsNumberResponse } from '../../../events/match/handlers/winRoundsNumberResponse';
import { checkValidFinalGuess } from '../../../events/match/functions/checkValidFinalGuess';
import { getNextPlayerId } from '../../../events/functions/getNextPlayerId';
import { generateAutomaticNumWinResponse } from '../../../events/match/functions/generateAutomaticNumWinResponse';
import { startNewRound } from '../../../events/round/functions/startNewRound';
import { endSpecialMatch } from '../../../events/match/functions/endSpecialMatch';

const emitWinRoundsNumberUpdate = jest.fn();
const emitWinRoundsNumberError = jest.fn();

jest.mock('../../../events/general/functions/generateInternalServerError', () => ({
  generateInternalServerError: jest.fn(),
}));
jest.mock('../../../events/match/functions/checkValidFinalGuess', () => ({
  checkValidFinalGuess: jest.fn(() => true),
}));
jest.mock('../../../events/functions/getNextPlayerId', () => ({
  getNextPlayerId: jest.fn(() => 'player2'),
}));
jest.mock('../../../events/match/functions/generateAutomaticNumWinResponse', () => ({
  generateAutomaticNumWinResponse: jest.fn(),
}));
jest.mock('../../../events/round/functions/startNewRound', () => ({
  startNewRound: jest.fn(),
}));
jest.mock('../../../events/match/functions/endSpecialMatch', () => ({
  endSpecialMatch: jest.fn(),
}));

function createLobbyInMatch(player: any) {
  lobbys['123'] = {
    lobbyId: '123',
    players: [
      {
        id: player.playerId,
        name: 'player1',
        leader: true,
        ready: false
      },
      {
        id: 'player2',
        name: 'player2',
        leader: false,
        ready: true
      }
    ],
    game: {
      matchNumber: 1,
      roundNumber: 1,
      currentPlayerId: player.playerId,
      status: 'waiting_num_win_response',
      deadPlayersIds: [],
      numRounds: 2,
      playersHealth: {},
      timer: new Timer(),
      match: {
        players: {
          [player.playerId]: { cards: [], numWinsNeeded: 0, numWonRounds: 0 },
          'player2': { cards: [], numWinsNeeded: 0, numWonRounds: 0 }
        },
        nextPlayerId: player.playerId
      }
    }
  };
  player.lobby = lobbys['123'];
  players[player.playerId] = { socket: player.socket, lobby: lobbys['123'] };
  player.eventsEmitter = {
    Match: {
      emitWinRoundsNumberUpdate: emitWinRoundsNumberUpdate,
      emitWinRoundsNumberError: emitWinRoundsNumberError
    }
  };
}

describe('handleWinRoundsNumberResponse', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Tentar palpitar sem estar em um lobby deve emitir erro', () => {
    createLobbyInMatch(player);

    player.lobby = undefined;
    handleWinRoundsNumberResponse(player, 1);

    expect(emitWinRoundsNumberError).toHaveBeenCalledWith('not-in-lobby');
  });

  test('Tentar palpitar sem estar em jogo deve emitir erro', () => {
    createLobbyInMatch(player);

    player.lobby!.game = undefined;
    handleWinRoundsNumberResponse(player, 1);

    expect(emitWinRoundsNumberError).toHaveBeenCalledWith('not-in-game');
  });

  test('Tentar palpitar sem estar em uma partida deve emitir erro', () => {
    createLobbyInMatch(player);

    player.lobby!.game!.match = undefined;
    handleWinRoundsNumberResponse(player, 1);

    expect(emitWinRoundsNumberError).toHaveBeenCalledWith('not-in-match');
  });

  test('Tentar palpitar fora de sua vez deve emitir erro', () => {
    createLobbyInMatch(player);

    player.lobby!.game!.match!.nextPlayerId = 'player2';
    handleWinRoundsNumberResponse(player, 1);

    expect(emitWinRoundsNumberError).toHaveBeenCalledWith('not-your-turn');
  });

  test('Tentar palpitar com número negativo deve emitir erro', () => {
    createLobbyInMatch(player);

    handleWinRoundsNumberResponse(player, -1);

    expect(emitWinRoundsNumberError).toHaveBeenCalledWith('negative-is-invalid');
  });

  test('Tentar palpitar um valor inválido na última rodada deve emitir erro', () => {
    (checkValidFinalGuess as jest.Mock).mockReturnValueOnce(false);

    createLobbyInMatch(player);
    handleWinRoundsNumberResponse(player, 1);

    expect(emitWinRoundsNumberError).toHaveBeenCalledWith('num-wins-equals-num-cards');
  });

  test('Palpitar corretamente deve parar o timer antigo e atualizar o número de palpite do jogador atual no objeto Lobby', () => {
    createLobbyInMatch(player);

    const oldTimer = player.lobby!.game!.timer;

    handleWinRoundsNumberResponse(player, 1);

    expect(oldTimer.isRunning()).toBe(false);
    expect(player.lobby?.game?.match?.players[player.playerId].numWinsNeeded).toBe(1);
  });

  test('Palpitar corretamente quando ainda existem jogadores a palpitar deve enviar mensagem com o palpite atual e o id do próximo jogador que deve palpitar. Também deve adicionar um timer para o palpite automático do próximo jogador. O status deve ser mantido "waiting_num_win_response"', () => {
    (getNextPlayerId as jest.Mock).mockReturnValueOnce('player2'); // O player2 não é o primeiro jogador que palpitou. Ou seja, ainda não palpitaram todos os jogadores

    createLobbyInMatch(player);

    handleWinRoundsNumberResponse(player, 1);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, player.lobby!);
    expect(emitWinRoundsNumberUpdate).toHaveBeenCalledWith(1, 'player2');

    expect(player.lobby?.game?.match?.nextPlayerId).toBe('player2');
    expect(player.lobby?.game?.status).toBe('waiting_num_win_response');

    // Testing timer
    expect(player.lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(player.lobby?.game?.timer.getTimeValues().seconds).toBe(15);
    jest.advanceTimersByTime(15000);
    expect(generateAutomaticNumWinResponse).toHaveBeenCalledWith(player.lobby!);
  });

  test('Palpitar corretamente em uma partida comum quando é o último jogador a palpitar deve enviar a mensagem com o palpite e o próximo jogador indefinido. Também deve adicionar um timer para começar uma rodada. O status deve ser "starting_round"', () => {
    (getNextPlayerId as jest.Mock).mockReturnValueOnce(player.playerId); // O player1 é o primeiro jogador que palpitou. Ou seja, se o próximo jogador for o player1, então todos os jogadores já palpitaram

    createLobbyInMatch(player);

    handleWinRoundsNumberResponse(player, 1);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, player.lobby!);
    expect(emitWinRoundsNumberUpdate).toHaveBeenCalledWith(1, undefined);

    expect(player.lobby?.game?.match?.nextPlayerId).toBe(undefined);
    expect(player.lobby?.game?.status).toBe('starting_round');

    // Testing timer
    expect(player.lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(player.lobby?.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);
    expect(startNewRound).toHaveBeenCalledWith(player.lobby!);
  });

  test('Palpitar corretamente em uma partida especial quando é o último jogador a palpitar deve enviar a mensagem com o palpite e o próximo jogador indefinido. Também deve adicionar um timer para finalizar a partida especial. O status deve ser "ending_special_match"', () => {
    (getNextPlayerId as jest.Mock).mockReturnValueOnce(player.playerId); // O player1 é o primeiro jogador que palpitou. Ou seja, se o próximo jogador for o player1, então todos os jogadores já palpitaram

    createLobbyInMatch(player);
    player.lobby!.game!.numRounds = 1;

    handleWinRoundsNumberResponse(player, 1);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, player.lobby!);
    expect(emitWinRoundsNumberUpdate).toHaveBeenCalledWith(1, undefined);

    expect(player.lobby?.game?.match?.nextPlayerId).toBe(undefined);
    expect(player.lobby?.game?.status).toBe('ending_special_match');

    // Testing timer
    expect(player.lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(player.lobby?.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);
    expect(endSpecialMatch).toHaveBeenCalledWith(player.lobby!);
  });

  test('Se ocorrer um erro ao coletar o próximo jogador, deve emitir um erro interno', () => {
    (getNextPlayerId as jest.Mock).mockImplementationOnce(() => { throw new Error('getNextPlayerId error'); });

    createLobbyInMatch(player);

    handleWinRoundsNumberResponse(player, 1);

    expect(generateInternalServerError).toHaveBeenCalledWith(player.lobby, new Error('getNextPlayerId error'));
  });

  test('Se ocorrer um erro ao verificar se o palpite final é válido, deve emitir um erro interno', () => {
    (checkValidFinalGuess as jest.Mock).mockImplementationOnce(() => { throw new Error('checkValidFinalGuess error'); });

    createLobbyInMatch(player);

    handleWinRoundsNumberResponse(player, 1);

    expect(generateInternalServerError).toHaveBeenCalledWith(player.lobby, new Error('checkValidFinalGuess error'));
  });
});
