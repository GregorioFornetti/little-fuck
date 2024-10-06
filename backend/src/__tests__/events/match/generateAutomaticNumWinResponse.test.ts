
import i18n from '../../../plugins/i18n';
import { checkValidFinalGuess } from '../../../events/match/functions/checkValidFinalGuess';
import { generateAutomaticNumWinResponse } from '../../../events/match/functions/generateAutomaticNumWinResponse';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { createPlayer } from '../../../events/functions/createPlayer';
import { handleWinRoundsNumberResponse } from '../../../events/match/handlers/winRoundsNumberResponse';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';

jest.mock('../../../events/general/functions/generateInternalServerError');
jest.mock('../../../events/match/functions/checkValidFinalGuess', () => ({
  checkValidFinalGuess: jest.fn()
}));
jest.mock('../../../events/functions/createPlayer', () => ({
  createPlayer: jest.fn((_io, playerId) => `mocked player ${playerId}`)
}));
jest.mock('../../../events/match/handlers/winRoundsNumberResponse', () => ({
  handleWinRoundsNumberResponse: jest.fn()
}));
jest.mock('../../..', () => ({
  io: 'mocked io',
}));

describe('generateAutomaticNumWinResponse', () => {

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
  });

  test('Se o palpite 0 for válido, deve ser palpitado o valor 0 automaticamente', () => {

    const lobby = generateLobbyInMatch();

    (checkValidFinalGuess as jest.Mock).mockImplementation((_lobby, currentGuess) => {
      return currentGuess === 0;
    });

    generateAutomaticNumWinResponse(lobby);

    expect(createPlayer).toHaveBeenCalledWith('mocked io', lobby.game!.match!.nextPlayerId);
    expect(handleWinRoundsNumberResponse).toHaveBeenCalledWith(
      `mocked player ${lobby.game!.match!.nextPlayerId}`, 0
    );
  });

  test('Se o palpite 0 não for válido, deve ser palpitado o valor 1 automaticamente', () => {

    const lobby = generateLobbyInMatch();

    (checkValidFinalGuess as jest.Mock).mockImplementation((_lobby, currentGuess) => {
      return currentGuess !== 0;
    });

    generateAutomaticNumWinResponse(lobby);

    expect(createPlayer).toHaveBeenCalledWith('mocked io', lobby.game!.match!.nextPlayerId);
    expect(handleWinRoundsNumberResponse).toHaveBeenCalledWith(
      `mocked player ${lobby.game!.match!.nextPlayerId}`, 1
    );
  });

  test('Se ocorrer um erro ao gerar a resposta, deve lançar um erro interno', () => {

    const lobby = generateLobbyInMatch();

    (handleWinRoundsNumberResponse as jest.Mock).mockImplementation(() => {
      throw new Error('Error generating response');
    });

    generateAutomaticNumWinResponse(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error generating response')
    );
  });

  test('Se ocorrer um erro ao verificar se o palpite é válido, deve lançar um erro interno', () => {

    const lobby = generateLobbyInMatch();

    (checkValidFinalGuess as jest.Mock).mockImplementation(() => {
      throw new Error('Error checking valid final guess');
    });

    generateAutomaticNumWinResponse(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error checking valid final guess')
    );
  });

  test('Se ocorrer um erro ao criar o jogador, deve lançar um erro interno', () => {

    const lobby = generateLobbyInMatch();

    (createPlayer as jest.Mock).mockImplementation(() => {
      throw new Error('Error creating player');
    });

    generateAutomaticNumWinResponse(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error creating player')
    );
  });

  test('Se não estiver em um jogo, deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game = undefined;

    generateAutomaticNumWinResponse(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleWinRoundsNumberResponse).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'))
    );
  });

  test('Se não estiver em uma partida, deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game!.match = undefined;

    generateAutomaticNumWinResponse(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleWinRoundsNumberResponse).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH'))
    );
  });

  test('Se não houver um próximo jogador na partida, deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game!.match!.nextPlayerId = undefined;

    generateAutomaticNumWinResponse(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleWinRoundsNumberResponse).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NO_NEXT_PLAYER_IN_MATCH'))
    );
  });

  test('Se o próximo jogador for inválido (id não pertencente ao lobby), deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game!.match!.nextPlayerId = '100';

    generateAutomaticNumWinResponse(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleWinRoundsNumberResponse).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.INVALID_NEXT_PLAYER_ID_IN_MATCH'))
    );
  });
});
