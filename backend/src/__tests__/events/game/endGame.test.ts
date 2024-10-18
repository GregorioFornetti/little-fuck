
import { endGame } from '../../../events/game/functions/endGame';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';
import i18n from '../../../plugins/i18n';

jest.mock('../../../events/general/functions/generateInternalServerError');
jest.mock('../../..', () => ({
  io: 'mocked io',
}));

const emitEndGame = jest.fn();

jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        Game: {
          emitEndGame: emitEndGame
        }
      }
    };
  })
}));

describe('endGame', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function generateLobbyInGame(): Lobby {
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
          '2': 0,
          '3': 0
        },
        timer: new Timer(),
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        numRounds: 3,
        deadPlayersIds: ['3', '2'],
        status: 'starting_match'
      }
    };
  }

  test('Caso tenha um jogador vivo, este deve ser o primeiro do ranking e o restante do ranking deve ser a lista invertida dos jogadores mortos', () => {
    const lobby = generateLobbyInGame();

    endGame(lobby);

    expect(emitEndGame).toHaveBeenCalledWith(['1', '2', '3']);

    expect(lobby.game).toBeUndefined();
  });

  test('Caso não tenha jogadores vivos, o ranking deve ser a lista invertida dos jogadores mortos', () => {
    const lobby = generateLobbyInGame();
    lobby.game!.playersHealth['1'] = 0;
    lobby.game!.deadPlayersIds = ['3', '2', '1'];

    endGame(lobby);

    expect(emitEndGame).toHaveBeenCalledWith(['1', '2', '3']);

    expect(lobby.game).toBeUndefined();
  });

  test('Caso não esteja em jogo, deve gerar erro interno', () => {
    const lobby = generateLobbyInGame();
    lobby.game = undefined;

    endGame(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
    expect(emitEndGame).not.toHaveBeenCalled();
  });
});
