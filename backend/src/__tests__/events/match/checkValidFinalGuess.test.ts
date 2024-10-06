
import i18n from '../../../plugins/i18n';
import { checkValidFinalGuess } from '../../../events/match/functions/checkValidFinalGuess';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';
import { getNextPlayerId } from '../../../events/functions/getNextPlayerId';

jest.mock('../../../events/functions/getNextPlayerId', () => ({
  getNextPlayerId: jest.fn() // Turn getNextPlayerId into a Jest mock function
}));

describe('checkValidFinalGuess', () => {

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

  test('Se não for o último jogador a palpitar, deve retornar true', () => {

    const lobby = generateLobbyInMatch();

    (getNextPlayerId as jest.Mock).mockImplementation((_lobby, _currentGuess) => {
      return '3'; // Próximo jogador não é o primeiro (logo, o jogador atual não é o último)
    });

    const currentGuess = 1;

    const isValid = checkValidFinalGuess(lobby, currentGuess);

    expect(isValid).toBe(true);
  });

  test('Se for o último jogador a palpitar e o somatório for inferior ao número de cartas da rodada, deve retornar true', () => {

    const lobby = generateLobbyInMatch();

    (getNextPlayerId as jest.Mock).mockImplementation((_lobby, _currentGuess) => {
      return lobby.game?.currentPlayerId;
    });

    const currentGuess = 0;

    lobby.game!.match!.players['1'].numWinsNeeded = lobby.game!.numRounds - 1;
    const isValid = checkValidFinalGuess(lobby, currentGuess);

    expect(isValid).toBe(true);
  });

  test('Se for o último jogador a palpitar e o somatório for maior ao número de cartas da rodada, deve retornar true', () => {

    const lobby = generateLobbyInMatch();

    (getNextPlayerId as jest.Mock).mockImplementation((_lobby, _currentGuess) => {
      return lobby.game?.currentPlayerId;
    });

    const currentGuess = 2;

    lobby.game!.match!.players['1'].numWinsNeeded = lobby.game!.numRounds - 1;
    const isValid = checkValidFinalGuess(lobby, currentGuess);

    expect(isValid).toBe(true);
  });

  test('Se for o último jogador a palpitar e o somatório for igual ao número de cartas da rodada, deve retornar false', () => {

    const lobby = generateLobbyInMatch();

    (getNextPlayerId as jest.Mock).mockImplementation((_lobby, _currentGuess) => {
      return lobby.game?.currentPlayerId;
    });

    const currentGuess = 1;

    lobby.game!.match!.players['1'].numWinsNeeded = lobby.game!.numRounds - 1;
    const isValid = checkValidFinalGuess(lobby, currentGuess);

    expect(isValid).toBe(false);
  });

  test('Se não estiver em um jogo, deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game = undefined;

    expect(() => checkValidFinalGuess(lobby, 1)).toThrow(new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  });

  test('Se não estiver em uma partida, deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game!.match = undefined;

    expect(() => checkValidFinalGuess(lobby, 1)).toThrow(new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  });

  test('Se não houver um próximo jogador, deve lançar um erro', () => {

    const lobby = generateLobbyInMatch();
    lobby.game!.match!.nextPlayerId = undefined;

    expect(() => checkValidFinalGuess(lobby, 1)).toThrow(new Error(i18n.t('COMMON.ERROR.NO_NEXT_PLAYER_IN_MATCH')));
  });
});
