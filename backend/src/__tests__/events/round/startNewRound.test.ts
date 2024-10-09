
import i18n from '../../../plugins/i18n';
import { startNewRound } from '../../../events/round/functions/startNewRound';
import Timer from 'easytimer.js';
import Lobby from '../../../interfaces/Lobby';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { createPlayer } from '../../../events/functions/createPlayer';
import { generateAutomaticSelectCard } from '../../../events/round/functions/generateAutomaticSelectCard';

const emitStartRound = jest.fn();

jest.mock('../../../events/match/functions/checkValidFinalGuess', () => ({
  checkValidFinalGuess: jest.fn()
}));
jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        Round: {
          emitStartRound: emitStartRound
        }
      }
    };
  })
}));
jest.mock('../../../events/round/functions/generateAutomaticSelectCard', () => ({
  generateAutomaticSelectCard: jest.fn()
}));
jest.mock('../../../events/round/functions/insertCard', () => ({
  insertCard: jest.fn()
}));
jest.mock('../../../events/general/functions/generateInternalServerError', () => ({
  generateInternalServerError: jest.fn()
}));
jest.mock('../../../index.ts', () => ({
  io: 'mocked io',
}));

describe('startNewRound', () => {

  function generateLobbyInMatch(): Lobby {
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
        }
      ],
      game: {
        playersHealth: {
          '1': 3,
          '2': 3,
          '3': 3
        },
        timer: new Timer(),
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        numRounds: 3,
        deadPlayersIds: [],
        status: 'starting_match',
        match: {
          nextPlayerId: '2',
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
            }
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

  test('Caso nenhum erro ocorra, deve criar o objeto Round corretamente, enviar mensagem de inicio de rodada e iniciar o timer para a escolha automatica de carta caso o jogador não escolha a tempo', () => {
    const lobby = generateLobbyInMatch();

    startNewRound(lobby);

    expect(lobby.game?.match?.round).toEqual({
      cards: {
        onMatch: [],
        anulledCards: []
      },
      nextPlayerId: lobby.game?.match?.roundFirstPlayerId
    });

    expect(lobby.game?.status).toBe('waiting_select_card');

    expect(emitStartRound).toHaveBeenCalledWith(lobby.game?.match?.roundFirstPlayerId);

    expect(lobby.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby.game?.timer.getTimeValues().seconds).toBe(15);
    jest.advanceTimersByTime(15000);
    expect(generateAutomaticSelectCard).toHaveBeenCalledWith(lobby);
  });

  test('Se não estiver em um jogo, deve gerar um erro interno', () => {
    const lobby = generateLobbyInMatch();
    lobby.game = undefined;

    startNewRound(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'))
    );
  });

  test('Se não estiver em uma partida, deve gerar um erro interno', () => {
    const lobby = generateLobbyInMatch();
    lobby.game!.match = undefined;

    startNewRound(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH'))
    );
  });

  test('Se não tiver um primeiro jogador definido para a rodada, deve gerar um erro interno', () => {
    const lobby = generateLobbyInMatch();
    lobby.game!.match!.roundFirstPlayerId = undefined;

    startNewRound(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NO_FIRST_PLAYER_ID_IN_ROUND'))
    );
  });

  test('Se ocorrer um erro ao criar o jogador, deve gerar um erro interno', () => {
    const lobby = generateLobbyInMatch();

    (createPlayer as jest.Mock).mockImplementation(() => {
      throw new Error('Error creating player');
    });

    startNewRound(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error creating player')
    );
  });
});
