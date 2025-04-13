
import i18n from '../../../plugins/i18n';
import { endSpecialMatch } from '../../../events/match/functions/endSpecialMatch';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { endRound } from '../../../events/round/functions/endRound';
import { insertCard } from '../../../events/round/functions/insertCard';
import { RoundCard } from '../../../interfaces/Lobby';
import { createPlayer } from '../../../events/functions/createPlayer';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';

jest.mock('../../../events/general/functions/generateInternalServerError');
jest.mock('../../../events/round/functions/insertCard', () => ({
  insertCard: jest.fn((cards: { onMatch: RoundCard[]}, card: RoundCard) => ({ onMatch: [...cards.onMatch, card] }))
}));
jest.mock('../../..', () => ({
  io: 'mocked io',
}));
jest.mock('../../../events/round/functions/endRound', () => ({
  endRound: jest.fn()
}));

const emitTableUpdate = jest.fn();

jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        Round: {
          emitTableUpdate: emitTableUpdate
        }
      }
    };
  })
}));

describe('endSpecialMatch', () => {

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
          nextPlayerId: undefined,
          roundFirstPlayerId: '1',
          players: {
            '1': {
              cards: [
                { value: 1, type: 'common' }
              ],
              numWonRounds: 0
            },
            '2': {
              cards: [
                { value: 2, type: 'common' }
              ],
              numWonRounds: 0
            },
            '3': {
              cards: [
                { value: 3, type: 'common' }
              ],
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

  test('Deve colocar todas as cartas dos jogadores na mesa, emitir o evento `table-update` e chamar a função `endRound`', () => {

    const lobby = generateLobbyInMatch();

    endSpecialMatch(lobby);

    expect(generateInternalServerError).not.toHaveBeenCalled();

    expect(insertCard).toHaveBeenCalledTimes(3);
    expect(insertCard).toHaveBeenNthCalledWith(1,
      { onMatch: [], anulledCards: [] },
      { card: { value: 1, type: 'common' }, playerId: '1' }
    );
    expect(insertCard).toHaveBeenNthCalledWith(2,
      {
        onMatch: [
          { card: { value: 1, type: 'common' }, playerId: '1' }
        ]
      },
      { card: { value: 2, type: 'common' }, playerId: '2' }
    );
    expect(insertCard).toHaveBeenNthCalledWith(3,
      {
        onMatch: [
          { card: { value: 1, type: 'common' }, playerId: '1' },
          { card: { value: 2, type: 'common' }, playerId: '2' }
        ]
      },
      { card: { value: 3, type: 'common' }, playerId: '3' }
    );

    expect(emitTableUpdate).toHaveBeenCalledWith({
      onMatch: [
        { card: { value: 1, type: 'common' }, playerId: '1' },
        { card: { value: 2, type: 'common' }, playerId: '2' },
        { card: { value: 3, type: 'common' }, playerId: '3' }
      ]
    });

    expect(lobby.game!.match!.round!.cards).toEqual({
      onMatch: [
        { card: { value: 1, type: 'common' }, playerId: '1' },
        { card: { value: 2, type: 'common' }, playerId: '2' },
        { card: { value: 3, type: 'common' }, playerId: '3' }
      ]
    });

    expect(endRound).toHaveBeenCalledWith(lobby);
  });

  test('Deve gerar erro interno caso não esteja em jogo', () => {
    const lobby = generateLobbyInMatch();
    lobby.game = undefined;

    endSpecialMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  });

  test('Deve gerar erro interno caso não esteja em partida', () => {
    const lobby = generateLobbyInMatch();
    lobby.game!.match = undefined;

    endSpecialMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH')));
  });

  test('Deve gerar um erro interno se ocorrer um erro ao finalizar rodada', () => {
    const lobby = generateLobbyInMatch();

    (endRound as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Error ending round');
    });

    endSpecialMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error('Error ending round'));
  });

  test('Deve gerar um erro interno se ocorrer um erro ao criar o jogador', () => {
    const lobby = generateLobbyInMatch();

    (createPlayer as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Error creating player');
    });

    endSpecialMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error('Error creating player'));
  });
});
