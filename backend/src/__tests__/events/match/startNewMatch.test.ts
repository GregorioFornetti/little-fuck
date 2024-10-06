
import i18n from '../../../plugins/i18n';
import { startNewMatch } from '../../../events/match/functions/startNewMatch';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import Lobby from '../../../interfaces/Lobby';
import { getAlivePlayersIds } from '../../../events/functions/getAlivePlayersIds';
import { getNextPlayerId } from '../../../events/functions/getNextPlayerId';
import { getNextMatchNumCards } from '../../../events/match/functions/getNextMatchNumCards';
import { getDefaultCards } from '../../../events/functions/getDefaultCards';
import { getPlayersCards } from '../../../events/match/functions/getPlayersCards';
import { generateAutomaticNumWinResponse } from '../../../events/match/functions/generateAutomaticNumWinResponse';
import Timer from 'easytimer.js';
import { insertCard } from '../../../events/round/functions/insertCard';
import { RoundCard } from '../../../interfaces/Lobby';

jest.mock('../../../events/general/functions/generateInternalServerError');
jest.mock('../../..', () => ({
  io: 'mocked io',
}));
jest.mock('../../../events/functions/getAlivePlayersIds', () => ({
  getAlivePlayersIds: jest.fn((_lobby) => ['1', '2', '3'])
}));
jest.mock('../../../events/functions/getNextPlayerId', () => ({
  getNextPlayerId: jest.fn((_currentPlayerId, _lobby) => '2')
}));
jest.mock('../../../events/match/functions/getNextMatchNumCards', () => ({
  getNextMatchNumCards: jest.fn((_numRounds, _alivePlayersIds, _defaultCards) => 2)
}));
jest.mock('../../../events/functions/getDefaultCards', () => ({
  getDefaultCards: jest.fn(() => 'mocked default cards')
}));
jest.mock('../../../events/match/functions/getPlayersCards', () => ({
  getPlayersCards: jest.fn((_alivePlayersIds, _defaultCards, _numRounds) => ({
    '1': [1],
    '2': [2],
    '3': [3]
  }))
}));
jest.mock('../../../events/round/functions/insertCard', () => ({
  insertCard: jest.fn((cards: { onMatch: RoundCard[]}, card: RoundCard) => ({ onMatch: [...cards.onMatch, card] }))
}));
jest.mock('../../../events/match/functions/generateAutomaticNumWinResponse', () => ({
  generateAutomaticNumWinResponse: jest.fn()
}));

const emitStartMatch = jest.fn();
const emitStartSpecialMatch = jest.fn();

jest.mock('../../../events/functions/createPlayer.ts', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        Match: {
          emitStartMatch: emitStartMatch,
          emitStartSpecialMatch: emitStartSpecialMatch
        }
      }
    };
  })
}));

describe('startNewMatch', () => {

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
          '2': 3,
          '3': 3
        },
        timer: new Timer(),
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        numRounds: 3,
        deadPlayersIds: [],
        status: 'starting_match'
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

  test('As informações do "game" devem ser atualizadas corretamente', () => {

    const lobby = generateLobbyInGame();
    const oldPlayerId = lobby.game!.currentPlayerId;

    startNewMatch(lobby);

    expect(lobby.game!.currentPlayerId).toBe(getNextPlayerId(oldPlayerId, lobby));
    expect(getNextPlayerId).toHaveBeenCalledWith(oldPlayerId, lobby);

    expect(lobby.game!.numRounds).toBe(
      getNextMatchNumCards(
        lobby.game!.numRounds,
        getAlivePlayersIds(lobby),
        getDefaultCards()
      )
    );
    expect(getNextMatchNumCards).toHaveBeenCalledWith(
        lobby.game!.numRounds,
        getAlivePlayersIds(lobby),
        getDefaultCards()
    );

    expect(lobby.game!.status).toBe('waiting_num_win_response');
  });

  test('As informações do "match" devem ser criadas corretamente', () => {

    const lobby = generateLobbyInGame();
    const alivePlayersIds = getAlivePlayersIds(lobby);
    const defaultCards = getDefaultCards();
    const playersCards = getPlayersCards(alivePlayersIds, defaultCards, 2);

    startNewMatch(lobby);

    console.log(lobby);

    expect(getPlayersCards).toHaveBeenCalledWith(alivePlayersIds, defaultCards, 2);

    console.log(lobby.game!.match);
    const matchPlayers = lobby.game!.match!.players;
    for (const alivePlayerId of alivePlayersIds) {
      expect(matchPlayers[alivePlayerId]).toEqual({
        cards: playersCards[alivePlayerId],
        numWonRounds: 0
      });
    }

    expect(lobby.game!.match!.nextPlayerId).toBe(lobby.game!.currentPlayerId);
    expect(lobby.game!.match!.roundFirstPlayerId).toBe(lobby.game!.currentPlayerId);
  });

  test('Deve enviar as mensagens para os jogadores sobre o início de uma partida comum', () => {
    (getNextMatchNumCards as jest.Mock).mockImplementation(
      (_numRounds, _alivePlayersIds, _defaultCards) => 2 // 2 cartas não representa uma partida especial (apenas uma carta que é uma partida especial)
    );

    const lobby = generateLobbyInGame();

    startNewMatch(lobby);

    expect(emitStartMatch).toHaveBeenCalledWith(
      getPlayersCards(getAlivePlayersIds(lobby), getDefaultCards(), 2),
      lobby.game!.currentPlayerId
    );
  });

  test('Deve enviar as mensagens para os jogadores sobre o início de uma partida especial', () => {
    (getNextMatchNumCards as jest.Mock).mockImplementation(
      (_numRounds, _alivePlayersIds, _defaultCards) => 1 // 1 carta representa uma partida especial
    );

    const lobby = generateLobbyInGame();

    startNewMatch(lobby);

    expect(emitStartSpecialMatch).toHaveBeenCalledWith(
      {
        '1': {
          onMatch: [
            {
              card: 2,
              playerId: '2'
            },
            {
              card: 3,
              playerId: '3'
            }
          ]
        },
        '2': {
          onMatch: [
            {
              card: 1,
              playerId: '1'
            },
            {
              card: 3,
              playerId: '3'
            }
          ]
        },
        '3': {
          onMatch: [
            {
              card: 1,
              playerId: '1'
            },
            {
              card: 2,
              playerId: '2'
            }
          ]
        }
      },
      lobby.game!.currentPlayerId
    );
  });

  test('O timer deve ser configurado corretamente, ou seja, o jogador atual deve realizar uma jogada automaticamente caso não faça em 15 segundos', () => {

    const lobby = generateLobbyInGame();

    startNewMatch(lobby);

    expect(lobby.game?.timer.getConfig().countdown).toBe(true);
    expect(lobby.game?.timer.getTimeValues().seconds).toBe(15);
    jest.advanceTimersByTime(15000);

    expect(generateAutomaticNumWinResponse).toHaveBeenCalledWith(lobby);
  });

  test('Se ocorrer um erro na inserção de cartas, deve gerar um erro interno', () => {

    const lobby = generateLobbyInGame();

    (insertCard as jest.Mock).mockImplementation(() => {
      throw new Error('Error inserting card');
    });

    startNewMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error inserting card')
    );
  });

  test('Se ocorrer um erro ao criar o jogador, deve lançar um erro interno', () => {

    const lobby = generateLobbyInGame();

    (insertCard as jest.Mock).mockImplementation(() => {
      throw new Error('Error creating player');
    });

    startNewMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error creating player')
    );
  });

  test('Se ocorrer um erro ao calcular o número de cartas da partida, deve lançar um erro interno', () => {

    const lobby = generateLobbyInGame();

    (getNextMatchNumCards as jest.Mock).mockImplementation(() => {
      throw new Error('Error calculating number of cards');
    });

    startNewMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error calculating number of cards')
    );
  });

  test('Se ocorrer um erro ao obter os jogadores vivos, deve lançar um erro interno', () => {

    const lobby = generateLobbyInGame();

    (getAlivePlayersIds as jest.Mock).mockImplementation(() => {
      throw new Error('Error getting alive players');
    });

    startNewMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error getting alive players')
    );
  });

  test('Se ocorrer um erro ao obter o próximo jogador, deve lançar um erro interno', () => {

    const lobby = generateLobbyInGame();

    (getNextPlayerId as jest.Mock).mockImplementation(() => {
      throw new Error('Error getting next player');
    });

    startNewMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error('Error getting next player')
    );
  });

  test('Se não estiver em um jogo, deve lançar um erro', () => {

    const lobby = generateLobbyInGame();
    lobby.game = undefined;

    startNewMatch(lobby);

    expect(generateInternalServerError).toHaveBeenCalledWith(
      lobby,
      new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'))
    );
  });
});
