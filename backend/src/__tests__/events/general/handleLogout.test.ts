
import { lobbys, players } from '../../../global';

import { player } from '../setupTests';
import { handleLogout } from '../../../events/general/handlers/logout';
import Lobby from '../../../interfaces/Lobby';
import Timer from 'easytimer.js';
import { getNextPlayerId } from '../../../events/functions/getNextPlayerId';
import { generateInternalServerError } from '../../../events/general/functions/generateInternalServerError';

const emitPlayerLogoutError = jest.fn();
const emitPlayerLogout = jest.fn();
const resetTimer = jest.fn();

jest.mock('../../../events/general/functions/generateInternalServerError', () => ({
  generateInternalServerError: jest.fn(),
}));
jest.mock('../../../events/functions/getNextPlayerId', () => ({
  getNextPlayerId: jest.fn(() => '2'),
}));

describe('handleLogout', () => {

  function generateLobbyInRound(player: any): Lobby {
    const lobby: Lobby = {
      lobbyId: '123',
      players: [
        {
          id: player.playerId,
          name: 'Player 1',
          leader: false
        },
        {
          id: '2',
          name: 'Player 2',
          leader: false
        },
        {
          id: '3',
          name: 'Player 3',
          leader: true
        }
      ],
      game: {
        playersHealth: {
          [player.playerId]: 3,
          '2': 3,
          '3': 3
        },
        timer: { reset: resetTimer } as unknown as Timer,
        matchNumber: 1,
        roundNumber: 1,
        currentPlayerId: '3',
        numRounds: 3,
        deadPlayersIds: [],
        status: 'starting_match',
        match: {
          nextPlayerId: '3',
          roundFirstPlayerId: '2',
          players: {
            [player.playerId]: {
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

    lobbys['123'] = lobby;
    player.lobby = lobbys['123'];
    players[player.playerId] = { socket: player.socket, lobby: lobbys['123'] };
    player.eventsEmitter = {
      General: {
        emitPlayerLogout: emitPlayerLogout,
        emitPlayerLogoutError: emitPlayerLogoutError
      }
    };

    return lobby;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Caso nenhum erro ocorra, deve emitir o evento de logout do jogador', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game = undefined;

    handleLogout(player);

    expect(emitPlayerLogout).toHaveBeenCalledWith(player.playerId);
  });

  test('O jogador não líder deve ser removido da sala, sem alterar o líder', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game = undefined;

    handleLogout(player);

    expect(lobby.players).toEqual([
      {
        id: '2',
        name: 'Player 2',
        leader: false
      },
      {
        id: '3',
        name: 'Player 3',
        leader: true
      }
    ]);
  });

  test('O jogador líder deve ser removido da sala e o jogador de índice 0 deve se tornar líder', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game = undefined;
    lobby.players[0].leader = true;
    lobby.players[2].leader = false;

    handleLogout(player);

    expect(lobby.players).toEqual([
      {
        id: '2',
        name: 'Player 2',
        leader: true
      },
      {
        id: '3',
        name: 'Player 3',
        leader: false
      }
    ]);
  });

  test('Caso tenha um jogo em andamento, deve remover seus dados a respeito de suas vidas', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match = undefined;

    handleLogout(player);

    expect(lobby.game?.playersHealth).toEqual({
      '2': 3,
      '3': 3
    });
  });

  test('Caso tenha um jogo em andamento e ele seja o jogador que foi o primeiro a palpitar, deve ser passado para o próximo jogador', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match = undefined;
    lobby.game!.currentPlayerId = player.playerId;

    handleLogout(player);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, lobby);
    expect(lobby.game!.currentPlayerId).toBe(getNextPlayerId(player.playerId, lobby));
  });

  test('Caso tenha um jogo em andamento e ele não seja o primeiro a palpitar, não deve ser passado para o próximo jogador', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match = undefined;
    lobby.game!.currentPlayerId = '3';

    handleLogout(player);

    expect(getNextPlayerId).not.toHaveBeenCalled();
    expect(lobby.game!.currentPlayerId).toBe('3');
  });

  test('Caso tenha um jogo em andamento e o jogador não estiver na lista de mortos, nada deve acontecer à essa lista', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match = undefined;

    handleLogout(player);

    expect(lobby.game?.deadPlayersIds).toEqual([]);
  });

  test('Caso tenha um jogo em andamento e o jogador estiver na lista de mortos, ele deve ser removido dela', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match = undefined;
    lobby.game!.deadPlayersIds.push(player.playerId);

    handleLogout(player);

    expect(lobby.game?.deadPlayersIds).toEqual([]);
  });

  test('Caso tenha um jogo em andamento, deve resetar o timer', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match = undefined;

    handleLogout(player);

    expect(resetTimer).toHaveBeenCalled();
  });

  test('Caso tenha uma partida em andamento, e o jogador não seja nem o primeiro da rodada e nem o próximo a palpitar, deve ser mantido os ids dos jogadores', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round = undefined;
    lobby.game!.match!.nextPlayerId = '2';
    lobby.game!.match!.roundFirstPlayerId = '3';

    handleLogout(player);

    expect(lobby.game?.match?.nextPlayerId).toBe('2');
    expect(lobby.game?.match?.roundFirstPlayerId).toBe('3');
  });

  test('Caso tenha uma partida em andamento, e o jogador seja o primeiro da rodada, deve ser passado para o próximo jogador', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round = undefined;
    lobby.game!.match!.nextPlayerId = '2';
    lobby.game!.match!.roundFirstPlayerId = player.playerId;

    handleLogout(player);

    expect(lobby.game?.match?.nextPlayerId).toBe('2');
    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, lobby);
    expect(lobby.game?.match?.roundFirstPlayerId).toBe(getNextPlayerId(player.playerId, lobby));
  });

  test('Caso tenha uma partida em andamento, e o jogador seja o próximo a palpitar, deve ser passado para o próximo jogador', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round = undefined;
    lobby.game!.match!.nextPlayerId = player.playerId;
    lobby.game!.match!.roundFirstPlayerId = '2';

    handleLogout(player);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, lobby);
    expect(lobby.game?.match?.nextPlayerId).toBe(getNextPlayerId(player.playerId, lobby));
    expect(lobby.game?.match?.roundFirstPlayerId).toBe('2');
  });

  test('Caso tenha uma partida em andamento, deve remover as informações do jogador (suas cartas, palpite e rodadas ganhas)', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round = undefined;

    handleLogout(player);

    expect(lobby.game?.match?.players).toEqual({
      '2': {
        cards: [],
        numWonRounds: 0
      },
      '3': {
        cards: [],
        numWonRounds: 0
      }
    });
  });

  test('Caso tenha uma rodada em andamento e o jogador não seja o próximo a jogar a carta, nada deve acontecer', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round!.nextPlayerId = '2';

    handleLogout(player);

    expect(lobby.game?.match?.round?.nextPlayerId).toBe('2');
  });

  test('Caso tenha uma rodada em andamento e o jogador seja o próximo a jogar a carta, deve ser passado para o próximo jogador', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round!.nextPlayerId = player.playerId;

    handleLogout(player);

    expect(getNextPlayerId).toHaveBeenCalledWith(player.playerId, lobby);
    expect(lobby.game?.match?.round?.nextPlayerId).toBe(getNextPlayerId(player.playerId, lobby));
  });

  test('Caso tenha uma rodada em andamento, deve remover a carta do jogador se ela estiver ainda válida (onMatch)', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round!.cards.onMatch = [
      {
        card: { value: 10, type: 'common' },
        playerId: player.playerId
      }
    ];

    handleLogout(player);

    expect(lobby.game?.match?.round?.cards.onMatch).toEqual([]);
  });

  test('Caso tenha uma rodada em andamento, deve remover a carta do jogador, mesmo que ela esteja anulada', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round!.cards.anulledCards = [
      {
        card: { value: 10, type: 'common' },
        playerId: player.playerId
      }
    ];

    handleLogout(player);

    expect(lobby.game?.match?.round?.cards.anulledCards).toEqual([]);
  });

  test('Caso tenha uma rodada em andamento, não deve remover nenhuma carta da mesa se o jogador não tiver jogado nenhuma carta', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.match!.round!.cards.onMatch = [
      {
        card: { value: 10, type: 'common' },
        playerId: '2'
      }
    ];
    lobby.game!.match!.round!.cards.anulledCards = [
      {
        card: { value: 10, type: 'common' },
        playerId: '3'
      }
    ];

    handleLogout(player);

    expect(lobby.game?.match?.round?.cards.onMatch).toEqual([
      {
        card: { value: 10, type: 'common' },
        playerId: '2'
      }
    ]);
    expect(lobby.game?.match?.round?.cards.anulledCards).toEqual([
      {
        card: { value: 10, type: 'common' },
        playerId: '3'
      }
    ]);
  });

  test('Deve atualizar o jogador, removendo que ele pertença ao lobby que ele estava', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game = undefined;

    handleLogout(player);

    expect(players[player.playerId].lobby).toBeUndefined();
  });

  test('Caso seja o último jogador do lobby, o lobby deve ser removido', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game = undefined;
    lobby.players = lobby.players.filter(p => p.id === player.playerId); // Deixando apenas o jogador que será removido

    handleLogout(player);

    expect(lobbys[lobby.lobbyId]).toBeUndefined();
  });

  test('Caso o jogador não esteja em um lobby, deve emitir um erro', () => {
    generateLobbyInRound(player);
    player.lobby = undefined;

    handleLogout(player);

    expect(emitPlayerLogoutError).toHaveBeenCalledWith('not-in-lobby');
  });

  test('Caso ocorra um erro ao coletar próximo jogador, deve gerar erro interno', () => {
    const lobby = generateLobbyInRound(player);
    lobby.game!.currentPlayerId = player.playerId;
    (getNextPlayerId as jest.Mock).mockImplementation(() => { throw new Error('Erro ao coletar próximo jogador'); });

    handleLogout(player);

    expect(generateInternalServerError).toHaveBeenCalledWith(lobby, new Error('Erro ao coletar próximo jogador'));
  });
});
