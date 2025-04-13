
import { endRound } from '../../../events/round/functions/endRound';
import i18n from '../../../plugins/i18n';
import { endMatch } from '../../../events/match/functions/endMatch';
import { startNewRound } from '../../../events/round/functions/startNewRound';
import Timer from 'easytimer.js';
import Lobby from '../../../interfaces/Lobby';

const emitEndRound = jest.fn();

jest.mock('../../..', () => ({
  io: 'mocked io',
}));
jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      playerId: '1',
      eventsEmitter: {
        Round: {
          emitEndRound: emitEndRound
        }
      }
    };
  })
}));
jest.mock('../../../events/match/functions/endMatch.ts', () => ({
  endMatch: jest.fn()
}));
jest.mock('../../../events/round/functions/startNewRound.ts', () => ({
  startNewRound: jest.fn()
}));

describe('endRound', () => {

  function generateLobbyInRound(): Lobby {
    return {
      lobbyId: '123',
      players: [
        {
          id: '1',
          name: 'Player 1',
          leader: true
        },
        {
          id: '2',
          name: 'Player 2',
          leader: false
        },
        {
          id: '3',
          name: 'Player 3',
          leader: false
        },
        {
          id: 'winnerPlayerId',
          name: 'Winner Player',
          leader: false
        }
      ],
      game: {
        playersHealth: {
          '1': 3,
          '2': 3,
          '3': 3,
          'winnerPlayerId': 3
        },
        timer: new Timer(),
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        numRounds: 3,
        deadPlayersIds: [],
        status: 'starting_match',
        match: {
          nextPlayerId: undefined,
          roundFirstPlayerId: '1',
          players: {
            '1': {
              cards: [],
              numWonRounds: 0
            },
            '2': {
              cards: [],
              numWonRounds: 0
            },
            '3': {
              cards: [],
              numWonRounds: 0
            },
            'winnerPlayerId': {
              cards: [],
              numWonRounds: 0
            }
          },
          round: {
            cards: {
              onMatch: [ { card: { type: 'common', value: 10 }, playerId: 'winnerPlayerId' }],
              anulledCards: []
            },
            nextPlayerId: '2',
          }
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

  test('Caso tenha um vencedor na rodada, deve emitir o evento de fim de rodada dizendo o id do jogador e que este ganhou 1 ponto. Deve apagar os dados da rodada atual e atualizar o número de vitórias do jogador vencedor. Deve atualizar o jogador que deve jogar primeiro na rodada', () => {
    const lobby = generateLobbyInRound();
    endRound(lobby);

    expect(emitEndRound).toHaveBeenCalledTimes(1);
    expect(emitEndRound).toHaveBeenCalledWith('winnerPlayerId', 1);

    expect(lobby.game!.match!.players['winnerPlayerId'].numWonRounds).toBe(1);

    expect(lobby.game!.match!.round).toBeUndefined();

    expect(lobby.game!.match!.roundFirstPlayerId).toBe('winnerPlayerId');
  });

  test('Caso não tenha um vencedor na rodada, deve emitir o evento de fim de rodada com um id qualquer (dentro do lobby) e que este ganhou 0 pontos. Deve apagar os dados da rodada atual e não atualizar o número de vitórias de nenhum jogador. Não deve atualizar o primeiro jogador da rodada', () => {
    const lobby = generateLobbyInRound();
    lobby.game!.match!.round!.cards.onMatch = [];
    const firstRoundPlayer = lobby.game!.match!.roundFirstPlayerId;
    endRound(lobby);

    expect(emitEndRound).toHaveBeenCalledTimes(1);
    expect(emitEndRound).toHaveBeenCalledWith(expect.stringMatching(/1|2|3|winnerPlayerId/), 0);

    expect(lobby.game!.match!.players['1'].numWonRounds).toBe(0);
    expect(lobby.game!.match!.players['2'].numWonRounds).toBe(0);
    expect(lobby.game!.match!.players['3'].numWonRounds).toBe(0);
    expect(lobby.game!.match!.players['winnerPlayerId'].numWonRounds).toBe(0);

    expect(lobby.game!.match!.round).toBeUndefined();

    expect(lobby.game!.match!.roundFirstPlayerId).toBe(firstRoundPlayer);
  });

  test('Caso a rodada atual seja a última, deve iniciar um timer para o fim da partida e atualizar o status do jogo para "ending_match"', () => {
    const lobby = generateLobbyInRound();

    lobby.game!.roundNumber = 3;

    endRound(lobby);

    // Testing timer
    expect(lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby?.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);
    expect(endMatch).toHaveBeenCalledWith(lobby);

    expect(lobby.game!.roundNumber).toBe(1);

    expect(lobby.game!.status).toBe('ending_match');
  });

  test('Caso a rodada atual não seja a última, deve iniciar um timer para o início de uma nova rodada e atualizar o status do jogo para "starting_round"', () => {
    const lobby = generateLobbyInRound();

    endRound(lobby);

    // Testing timer
    expect(lobby?.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby?.game?.timer.getTimeValues().seconds).toBe(5);
    jest.advanceTimersByTime(5000);
    expect(startNewRound).toHaveBeenCalledWith(lobby);

    expect(lobby.game!.roundNumber).toBe(2);

    expect(lobby.game!.status).toBe('starting_round');
  });

  test('Deve lançar um erro caso não esteja em jogo', () => {
    const lobby = generateLobbyInRound();
    lobby.game = undefined;

    expect(() => endRound(lobby)).toThrowError(i18n.t('COMMON.ERROR.NOT_IN_GAME'));
  });

  test('Deve lançar um erro caso o não esteja em partida', () => {
    const lobby = generateLobbyInRound();
    lobby.game!.match = undefined;

    expect(() => endRound(lobby)).toThrowError(i18n.t('COMMON.ERROR.NOT_IN_MATCH'));
  });

  test('Deve lançar um erro caso não esteja em rodada', () => {
    const lobby = generateLobbyInRound();
    lobby.game!.match!.round = undefined;

    expect(() => endRound(lobby)).toThrowError(i18n.t('COMMON.ERROR.NOT_IN_ROUND'));
  });
});
