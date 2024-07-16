
import i18n from '../../../plugins/i18n';
import { getAlivePlayersIds } from '../../../events/functions/getAlivePlayersIds';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';

describe('getAlivePlayersIds', () => {

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

  test('Deve retornar todos os ids dos jogadores se todos estiverem vivos', () => {
    const lobby = getInitialLobby();
    lobby.game!.playersHealth = {
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 1
    };

    const alivePlayersIds = getAlivePlayersIds(lobby);
    expect(alivePlayersIds).toEqual(['1', '2', '3', '4']);
  });

  test('Deve retornar apenas os ids dos jogadores vivos quando alguns jogadores estiverem mortos', () => {
    const lobby = getInitialLobby();
        lobby.game!.playersHealth = {
          '1': 0,
          '2': 1,
          '3': 0,
          '4': 1
        };

        const alivePlayersIds = getAlivePlayersIds(lobby);
        expect(alivePlayersIds).toEqual(['2', '4']);
  });

  test('Deve retornar um array vazio se todos os jogadores estiverem mortos', () => {
    const lobby = getInitialLobby();
        lobby.game!.playersHealth = {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0
        };

        const alivePlayersIds = getAlivePlayersIds(lobby);
        expect(alivePlayersIds).toEqual([]);
  });

  test('Deve lançar um erro se o lobby não tiver um jogo em andamento', () => {
    const lobby = getInitialLobby();
    lobby.game = undefined;

    expect(() => getAlivePlayersIds(lobby)).toThrowError(i18n.t('COMMON.ERROR.NOT_IN_GAME'));
  });
});
