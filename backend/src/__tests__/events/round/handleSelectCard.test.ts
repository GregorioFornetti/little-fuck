
import { lobbys, players } from '../../../global';

import { player } from '../setupTests';
import { Timer } from 'easytimer.js';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { getNextPlayerId } from '../../../events/functions/getNextPlayerId';
import { handleSelectCard } from '../../../events/round/handlers/selectCard';
import { insertCard } from '../../../events/round/functions/insertCard';
import { generateAutomaticSelectCard } from '../../../events/round/functions/generateAutomaticSelectCard';
import { endRound } from '../../../events/round/functions/endRound';

const emitTableUpdate = jest.fn();
const emitSelectCardError = jest.fn();

jest.mock('../../../events/general/functions/generateInternalServerError');
jest.mock('../../../events/functions/getNextPlayerId', () => ({
  getNextPlayerId: jest.fn(() => 'player2'),
}));
jest.mock('../../../events/round/functions/insertCard', () => ({
  insertCard: jest.fn((_cards, _card) => 'updated-cards')
}));
jest.mock('../../../events/round/functions/generateAutomaticSelectCard', () => ({
  generateAutomaticSelectCard: jest.fn()
}));
jest.mock('../../../events/round/functions/endRound', () => ({
  endRound: jest.fn()
}));

function createLobbyInRound(player: any) {
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
      status: 'waiting_select_card',
      deadPlayersIds: [],
      numRounds: 2,
      playersHealth: {},
      timer: new Timer(),
      match: {
        players: {
          [player.playerId]: { cards: [{ type: 'common', value: 1 }], numWinsNeeded: 0, numWonRounds: 0 },
          'player2': { cards: [], numWinsNeeded: 0, numWonRounds: 0 }
        },
        roundFirstPlayerId: player.playerId,
        nextPlayerId: player.playerId,
        round: {
          cards: {
            onMatch: [],
            anulledCards: []
          },
          nextPlayerId: player.playerId
        }
      }
    }
  };
  player.lobby = lobbys['123'];
  players[player.playerId] = { socket: player.socket, lobby: lobbys['123'] };
  player.eventsEmitter = {
    Round: {
      emitSelectCardError: emitSelectCardError,
      emitTableUpdate: emitTableUpdate
    }
  };
}

describe('handleSelectCard', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Tentar selecionar uma carta sem estar em um lobby deve emitir erro', () => {
    createLobbyInRound(player);

    player.lobby = undefined;
    handleSelectCard(player, 0);

    expect(emitSelectCardError).toHaveBeenCalledWith('not-in-lobby');
  });

  test('Tentar selecionar uma carta sem estar em jogo deve emitir erro', () => {
    createLobbyInRound(player);

    player.lobby!.game = undefined;
    handleSelectCard(player, 0);

    expect(emitSelectCardError).toHaveBeenCalledWith('not-in-game');
  });

  test('Tentar selecionar uma carta sem estar em uma partida deve emitir erro', () => {
    createLobbyInRound(player);

    player.lobby!.game!.match = undefined;
    handleSelectCard(player, 0);

    expect(emitSelectCardError).toHaveBeenCalledWith('not-in-match');
  });

  test('Tentar selecionar uma carta sem estar em uma rodada deve emitir erro', () => {
    createLobbyInRound(player);

    player.lobby!.game!.match!.round = undefined;
    handleSelectCard(player, 0);

    expect(emitSelectCardError).toHaveBeenCalledWith('not-in-round');
  });

  test('Tentar selecionar uma carta fora de sua vez deve emitir erro', () => {
    createLobbyInRound(player);

    player.lobby!.game!.match!.round!.nextPlayerId = 'player2';
    handleSelectCard(player, 0);

    expect(emitSelectCardError).toHaveBeenCalledWith('not-your-turn');
  });

  test('Tentar selecionar carta com um número negativo deve emitir erro', () => {
    createLobbyInRound(player);

    handleSelectCard(player, -1);

    expect(emitSelectCardError).toHaveBeenCalledWith('invalid-index');
  });

  test('Tentar selecionar uma carta com índice maior que o número de cartas deve emitir erro', () => {
    createLobbyInRound(player);

    handleSelectCard(player, 1);

    expect(emitSelectCardError).toHaveBeenCalledWith('invalid-index');
  });

  test('Selecionar carta corretamente deve parar o timer antigo e colocar a nova carta na mesa', () => {
    createLobbyInRound(player);

    const oldTimer = player.lobby!.game!.timer;

    handleSelectCard(player, 0);

    expect(oldTimer.isRunning()).toBe(false);
    expect(insertCard).toHaveBeenCalledWith(
      { onMatch: [], anulledCards: [] },
      { card: { type: 'common', value: 1 }, playerId: player.playerId }
    );
    expect(player.lobby?.game?.match?.round?.cards).toBe('updated-cards');
  });

  test('Selecionar corretamente quando ainda existem jogadores a palpitar deve enviar mensagem com a carta atual e o id do próximo jogador que deve palpitar. Também deve adicionar um timer para selecionar automático do próximo jogador. O status deve ser mantido "waiting_select_card"', () => {
    (getNextPlayerId as jest.Mock).mockReturnValueOnce('player2'); // O player2 não é o primeiro jogador que selecionou. Ou seja, todos os jogadores ainda não selecionaram

    createLobbyInRound(player);

    handleSelectCard(player, 0);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, player.lobby!);
    expect(emitTableUpdate).toHaveBeenCalledWith('updated-cards', 'player2');

    expect(player.lobby?.game?.match?.round?.nextPlayerId).toBe('player2');
    expect(player.lobby?.game?.status).toBe('waiting_select_card');

    // Testing timer
    expect(player.lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(player.lobby?.game?.timer.getTimeValues().seconds).toBe(15);
    jest.advanceTimersByTime(15000);
    expect(generateAutomaticSelectCard).toHaveBeenCalledWith(player.lobby!);
  });

  test('Selecionar corretamente quando é o último jogador a selecionar deve enviar a mensagem com o palpite e o próximo jogador indefinido. Também deve chamar a função de finalizar a rodada', () => {
    (getNextPlayerId as jest.Mock).mockReturnValueOnce(player.playerId); // O player1 é o primeiro jogador que selecionou. Ou seja, se o próximo jogador for o player1, então todos os jogadores já selecionaram

    createLobbyInRound(player);

    handleSelectCard(player, 0);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, player.lobby!);
    expect(emitTableUpdate).toHaveBeenCalledWith('updated-cards', undefined);

    expect(player.lobby?.game?.match?.round?.nextPlayerId).toBe(undefined);

    expect(endRound).toHaveBeenCalledWith(player.lobby!);
  });

  test('Se ocorrer um erro ao finalizar a rodada, deve emitir um erro interno', () => {
    (getNextPlayerId as jest.Mock).mockReturnValueOnce(player.playerId);
    (endRound as jest.Mock).mockImplementationOnce(() => { throw new Error('endRound error'); });

    createLobbyInRound(player);

    handleSelectCard(player, 0);

    expect(generateInternalServerError).toHaveBeenCalledWith(player.lobby, new Error('endRound error'));
  });

  test('Se ocorrer um erro ao coletar próximo jogador, deve emitir um erro interno', () => {
    (getNextPlayerId as jest.Mock).mockImplementationOnce(() => { throw new Error('getNextPlayerId error'); });

    createLobbyInRound(player);

    handleSelectCard(player, 0);

    expect(generateInternalServerError).toHaveBeenCalledWith(player.lobby, new Error('getNextPlayerId error'));
  });

  test('Se ocorrer um erro ao inserir carta na mesa, deve emitir um erro interno', () => {
    (insertCard as jest.Mock).mockImplementationOnce(() => { throw new Error('insertCard error'); });

    createLobbyInRound(player);

    handleSelectCard(player, 0);

    expect(generateInternalServerError).toHaveBeenCalledWith(player.lobby, new Error('insertCard error'));
  });
});
