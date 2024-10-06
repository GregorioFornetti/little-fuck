
import i18n from '../../../plugins/i18n';
import { generateAutomaticSelectCard } from '../../../events/round/functions/generateAutomaticSelectCard';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { createPlayer } from '../../../events/functions/createPlayer';
import { handleSelectCard } from '../../../events/round/handlers/selectCard';

import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';

jest.mock('../../../events/general/functions/generateInternalServerError');
jest.mock('../../../events/functions/createPlayer', () => ({
  createPlayer: jest.fn((_io, playerId) => `mocked player ${playerId}`)
}));
jest.mock('../../../events/round/handlers/selectCard', () => ({
  handleSelectCard: jest.fn()
}));
jest.mock('../../..', () => ({
  io: 'mocked io',
}));

describe('generateAutomaticSelectCard', () => {

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
          },
          round: {
            cards: {
              onMatch: [],
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
  });

  test('Deve selecionar automaticamente a carta de índice 0 caso nenhum erro ocorra', () => {

    const lobby = generateLobbyInRound();

    generateAutomaticSelectCard(lobby);

    expect(createPlayer).toHaveBeenCalledWith('mocked io', lobby.game!.match!.round!.nextPlayerId);
    expect(handleSelectCard).toHaveBeenCalledWith(
      `mocked player ${lobby.game!.match!.round!.nextPlayerId}`, 0
    );
  });

  test('Se ocorrer um erro ao selecionar a carta, deve lançar um erro interno', () => {

    const lobby = generateLobbyInRound();

    (handleSelectCard as jest.Mock).mockImplementation(() => {
      throw new Error('Error selecting card');
    });

    generateAutomaticSelectCard(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error selecting card')
    );
  });

  test('Se ocorrer um erro ao criar o jogador, deve lançar um erro interno', () => {

    const lobby = generateLobbyInRound();

    (createPlayer as jest.Mock).mockImplementation(() => {
      throw new Error('Error creating player');
    });

    generateAutomaticSelectCard(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error creating player')
    );
  });

  test('Se não estiver em um jogo, deve lançar um erro', () => {

    const lobby = generateLobbyInRound();
    lobby.game = undefined;

    generateAutomaticSelectCard(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleSelectCard).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'))
    );
  });

  test('Se não estiver em uma partida, deve lançar um erro', () => {

    const lobby = generateLobbyInRound();
    lobby.game!.match = undefined;

    generateAutomaticSelectCard(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleSelectCard).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_MATCH'))
    );
  });

  test('Se não estiver em uma rodada, deve lançar um erro', () => {

    const lobby = generateLobbyInRound();
    lobby.game!.match!.round = undefined;

    generateAutomaticSelectCard(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleSelectCard).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_ROUND'))
    );
  });

  test('Se não houver um próximo jogador na rodada, deve lançar um erro', () => {

    const lobby = generateLobbyInRound();
    lobby.game!.match!.round!.nextPlayerId = undefined;

    generateAutomaticSelectCard(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleSelectCard).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NO_NEXT_PLAYER_IN_ROUND'))
    );
  });

  test('Se o próximo jogador for inválido (id não pertencente ao lobby), deve lançar um erro', () => {

    const lobby = generateLobbyInRound();
    lobby.game!.match!.round!.nextPlayerId = '100';

    generateAutomaticSelectCard(lobby);

    expect(createPlayer).not.toHaveBeenCalled();
    expect(handleSelectCard).not.toHaveBeenCalled();
    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.INVALID_NEXT_PLAYER_ID_IN_ROUND'))
    );
  });
});
