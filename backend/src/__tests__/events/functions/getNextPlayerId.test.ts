
import i18n from '../../../plugins/i18n';
import { getNextPlayerId } from '../../../events/functions/getNextPlayerId';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';

describe('getNextPlayerId', () => {

  function getInitialLobby(): Lobby {
    return {
      lobbyId: '12345',
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
          id: '4',
          name: 'Player 4',
          leader: false
        }
      ],
      game: {
        playersHealth: {},
        timer: new Timer(),
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        numRounds: 1,
        deadPlayersIds: [],
        status: 'starting_match',
      }
    };
  }

  test('Deve conseguir coletar o próximo id de jogador sem ter jogadores "mortos" na frente e sem dar "volta"', () => {
    const lobby: Lobby = getInitialLobby();
    lobby.game!.playersHealth = {
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 1
    };

    expect(getNextPlayerId('1', lobby)).toBe('2');
    expect(getNextPlayerId('2', lobby)).toBe('3');
    expect(getNextPlayerId('3', lobby)).toBe('4');
  });

  test('Deve conseguir coletar o próximo id de jogador sem ter jogadores "mortos" na frente e dando "volta"', () => {
    const lobby: Lobby = getInitialLobby();
    lobby.game!.playersHealth = {
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 1
    };

    expect(getNextPlayerId('4', lobby)).toBe('1');
  });

  test('Deve conseguir coletar o próximo id de jogador tendo jogadores "mortos" na frente e sem dar "volta"', () => {
    const lobby: Lobby = getInitialLobby();
    lobby.game!.playersHealth = {
      '1': 1,
      '2': 0,
      '3': 1,
      '4': 1
    };

    expect(getNextPlayerId('1', lobby)).toBe('3');

    lobby.game!.playersHealth = {
      '1': 1,
      '2': 0,
      '3': 0,
      '4': 1
    };

    expect(getNextPlayerId('1', lobby)).toBe('4');
  });

  test('Deve conseguir coletar o próximo id de jogador tendo jogadores "mortos" na frente e dando "volta"', () => {
    const lobby: Lobby = getInitialLobby();
    lobby.game!.playersHealth = {
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 0
    };

    expect(getNextPlayerId('3', lobby)).toBe('1');

    lobby.game!.playersHealth = {
      '1': 0,
      '2': 1,
      '3': 1,
      '4': 0
    };

    expect(getNextPlayerId('3', lobby)).toBe('2');
  });

  test('Deve lançar erro se o lobby não tiver um jogo em andamento', () => {
    const lobby: Lobby = getInitialLobby();
    lobby.game = undefined;

    expect(() => getNextPlayerId('1', lobby)).toThrow(new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME')));
  });

  test('Deve lançar erro se o jogador fornecido não for encontrado', () => {
    const lobby: Lobby = getInitialLobby();

    expect(() => getNextPlayerId('5', lobby)).toThrow(new Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND')));
  });

  test('Deve lançar erro se não houver jogadores vivos', () => {
    const lobby: Lobby = getInitialLobby();
    lobby.game!.playersHealth = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0
    };

    expect(() => getNextPlayerId('1', lobby)).toThrow(new Error(i18n.t('COMMON.ERROR.NO_PLAYERS_ALIVE')));
  });
});
