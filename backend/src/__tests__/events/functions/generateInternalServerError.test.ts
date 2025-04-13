
import Timer from 'easytimer.js';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';
import { players, lobbys } from '../../../global';
import Lobby from '../../../interfaces/Lobby';
import { player } from '../setupTests';

console.error = jest.fn();

const emitInternalServerError = jest.fn();
const stopTimer = jest.fn();

jest.mock('../../../events/functions/createPlayer', () => ({
  createPlayer: jest.fn((_io, _playerId) => {
    return {
      eventsEmitter: {
        General: {
          emitInternalServerError: emitInternalServerError
        }
      }
    };
  })
}));
jest.mock('../../..', () => ({
  io: 'mocked io',
}));

describe('generateInternalServerError', () => {

  function generateLobby(player: any): Lobby {
    const lobby: Lobby = {
      lobbyId: '123',
      players: [
        {
          id: player.playerId,
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
        timer: { stop: stopTimer } as unknown as Timer,
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '1',
        numRounds: 3,
        deadPlayersIds: [],
        status: 'starting_match'
      }
    };

    lobbys[lobby.lobbyId] = lobby;
    player.lobby = lobbys[lobby.lobbyId];
    players[player.playerId] = { socket: player.socket, lobby: lobbys['123'] };

    players['2'] = { socket: player.socket, lobby: lobbys['123'] };
    players['3'] = { socket: player.socket, lobby: lobbys['123'] };

    return lobby;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Deve logar a mensagem de erro no console, juntamente com o stack do erro', () => {
    const lobby = generateLobby(player);
    const error = new Error('Erro inesperado');

    generateInternalServerError(lobby, error);

    const errorMessagesStr = (console.error as jest.Mock).mock.calls.flat().join(); // Coloca todas as mensagens de erro enviadas no console em uma única string

    expect(errorMessagesStr).toContain(error.message);
    expect(errorMessagesStr).toContain(error.stack);
  });

  test('Deve remover o lobby da variável global lobbys', () => {
    const lobby = generateLobby(player);
    const error = new Error('Erro inesperado');

    generateInternalServerError(lobby, error);

    expect(lobbys[lobby.lobbyId]).toBeUndefined();
  });

  test('Caso o lobby tenha um jogo em andamento, deve parar o timer do jogo e remover o jogo', () => {
    const lobby = generateLobby(player);
    const error = new Error('Erro inesperado');

    generateInternalServerError(lobby, error);

    expect(lobby.game).toBeUndefined();
    expect(stopTimer).toHaveBeenCalledTimes(1);
  });

  test('Caso o lobby não tenha um jogo em andamento, não deve parar o timer do jogo e o jogo deve se manter indefinido', () => {
    const lobby = generateLobby(player);
    lobby.game = undefined;
    const error = new Error('Erro inesperado');

    generateInternalServerError(lobby, error);

    expect(lobby.game).toBeUndefined();
    expect(stopTimer).not.toHaveBeenCalled();
  });

  test('Caso o lobby tenha jogadores, deve emitir o evento de erro interno e remover o lobby de todos os jogadores', () => {
    const lobby = generateLobby(player);
    const error = new Error('Erro inesperado');

    generateInternalServerError(lobby, error);

    expect(emitInternalServerError).toHaveBeenCalledTimes(1);
    expect(players[player.playerId].lobby).toBeUndefined();
    expect(players['2'].lobby).toBeUndefined();
    expect(players['3'].lobby).toBeUndefined();
  });

  test('Caso o lobby não tenha jogadores, não deve emitir o evento de erro interno e o lobby não deve ser removido dos jogadores', () => {
    const lobby = generateLobby(player);
    lobby.players = [];
    const error = new Error('Erro inesperado');

    generateInternalServerError(lobby, error);

    expect(emitInternalServerError).not.toHaveBeenCalled();
    expect(players[player.playerId].lobby).toBeDefined();
    expect(players['2'].lobby).toBeDefined();
    expect(players['3'].lobby).toBeDefined();
  });
});
