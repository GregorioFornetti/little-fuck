
import { endMatch } from '../../../events/match/functions/endMatch';
import i18n from '../../../plugins/i18n';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { endGame } from '../../../events/game/functions/endGame';
import { startNewMatch } from '../../../events/match/functions/startNewMatch';
import { createPlayer } from '../../../events/functions/createPlayer';
import Timer from 'easytimer.js';
import Lobby from '../../../interfaces/Lobby';

jest.mock('../../../events/general/functions/generateInternalServerError', () => ({
  generateInternalServerError: jest.fn()
}));
jest.mock('../../..', () => ({
  io: 'mocked io',
}));
jest.mock('../../../events/game/functions/endGame', () => ({
  endGame: jest.fn()
}));
jest.mock('../../../events/match/functions/startNewMatch', () => ({
  startNewMatch: jest.fn()
}));

const emitEndMatch = jest.fn();

jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        Match: {
          emitEndMatch: emitEndMatch
        }
      }
    };
  })
}));

describe('endMatch', () => {

  function createLobbyInMatch(): Lobby {
    return {
      lobbyId: '123',
      players: [
        {
          id: '1',
          name: 'player1',
          leader: true,
          ready: false
        },
        {
          id: '2',
          name: 'player2',
          leader: false,
          ready: true
        },
        {
          id: '3',
          name: 'player3',
          leader: false,
          ready: true
        }
      ],
      game: {
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        status: 'waiting_num_win_response',
        deadPlayersIds: [],
        numRounds: 2,
        playersHealth: {
          '1': 3,
          '2': 3,
          '3': 3
        },
        timer: new Timer(),
        match: {
          players: {
            '1': { cards: [], numWinsNeeded: 1, numWonRounds: 0 },
            '2': { cards: [], numWinsNeeded: 1, numWonRounds: 1 },
            '3': { cards: [], numWinsNeeded: 1, numWonRounds: 2 }
          },
          nextPlayerId: '1'
        }
      }
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('Deve enviar a mensagem de atualização de vidas corretamente. Deve definir match como indefinido e para o timer antigo', () => {
    const lobby = createLobbyInMatch();
    const oldTimer = lobby.game!.timer;

    endMatch(lobby);

    expect(emitEndMatch).toHaveBeenCalledWith({ '1': -1, '2': 0, '3': -1 });
    expect(lobby.game!.match).toBeUndefined();

    expect(lobby.game!.playersHealth).toStrictEqual({ '1': 2, '2': 3, '3': 2 });

    expect(oldTimer.isRunning()).toBe(false);
  });

  test('Deve adicionar um jogador ao array de jogadores mortos se a vida dele for menor ou igual a 0', () => {
    const lobby = createLobbyInMatch();
    lobby.game!.playersHealth = { '1': 1, '2': 1, '3': 2 };

    endMatch(lobby);

    expect(lobby.game!.deadPlayersIds).toStrictEqual(['1']); // O jogador 1 perdeu uma vida e já estava com 1 vida
  });

  test('Não deve adicionar um jogador ao array de jogadores mortos se ele já estiver na lista de mortos', () => {
    const lobby = createLobbyInMatch();
    lobby.game!.deadPlayersIds = ['1'];
    lobby.game!.playersHealth = { '1': 1, '2': 1, '3': 2 };

    endMatch(lobby);

    expect(lobby.game!.deadPlayersIds).toStrictEqual(['1']); // O jogador 1 já estava na lista de mortos, não deve ser adicionado novamente
  });

  test('Deve colocar um timer para fim de jogo se tiver apenas um jogador vivo. Deve atualizar o status para "ending_game"', () => {
    const lobby = createLobbyInMatch();
    lobby.game!.deadPlayersIds = ['2', '3'];

    endMatch(lobby);

    expect(lobby.game!.status).toBe('ending_game');

    expect(lobby.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);

    expect(endGame).toHaveBeenCalledWith(lobby);
  });

  test('Deve colocar um timer para fim de jogo se tiver nenhum jogador vivo. Deve atualizar o status para "ending_game"', () => {
    const lobby = createLobbyInMatch();
    lobby.game!.deadPlayersIds = ['1', '2', '3'];

    endMatch(lobby);

    expect(lobby.game!.status).toBe('ending_game');

    expect(lobby.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);

    expect(endGame).toHaveBeenCalledWith(lobby);
  });

  test('Deve colocar um timer para início de nova partida se tiver mais de um jogador vivo. Deve atualizar o status para "starting_match"', () => {
    const lobby = createLobbyInMatch();

    endMatch(lobby);

    expect(lobby.game!.status).toBe('starting_match');

    expect(lobby.game?.matchNumber).toBe(2);

    expect(lobby.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);

    expect(startNewMatch).toHaveBeenCalledWith(lobby);
  });

  test('Deve gerar erro interno se não estiver em jogo', () => {
    const lobby = createLobbyInMatch();
    lobby.game = undefined;

    endMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  });

  test('Deve gerar erro interno se não estiver em partida', () => {
    const lobby = createLobbyInMatch();
    lobby.game!.match = undefined;

    endMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  });

  test('Deve gerar erro interno se não conseguir criar o jogador', () => {
    const lobby = createLobbyInMatch();
    (createPlayer as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Erro ao criar jogador');
    });

    endMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error('Erro ao criar jogador'));
  });
});
