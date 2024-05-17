import '../setupTests';
import type { Game } from '@/interfaces/Lobby';
import { handlePlayerJoin } from '@/events/lobby/handlers/playerJoin';
import { i18n } from '@/plugins/i18n';

describe('handlePlayerJoin', () => {
  const leaderPlayer = {
    id: '12345',
    name: 'leader player',
    leader: true,
    ready: true
  };

  const anotherPlayer = {
    id: '123',
    name: 'John joe',
    leader: false,
    ready: false
  };

  test('Deve adicionar o jogador ao lobby', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer]
    };

    handlePlayerJoin(anotherPlayer.id, anotherPlayer.name);

    expect(connection.lobby.value.players).toHaveLength(2);
    expect(connection.lobby.value.players.pop()).toEqual(anotherPlayer);
  });

  test('Deve adicionar o jogador ao lobby vazio, e mesmo assim ele não deve ser o líder', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: []
    };

    handlePlayerJoin(anotherPlayer.id, anotherPlayer.name)
    
    expect(connection.lobby.value.players).toHaveLength(1);
    expect(connection.lobby.value.players[0]).toEqual(anotherPlayer);
  });

  test('Deve emitir um erro se o jogador não estiver em um lobby', () => {
    expect(() => handlePlayerJoin(anotherPlayer.id, anotherPlayer.name))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')))
  })

  test('Deve emitir um erro se um jogo já estiver começado no lobby atual do jogador', () => {
    const connection = require('@/connection');

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
    }

    connection.lobby.value = {
      lobbyId: '123',
      game: game,
      players: [leaderPlayer]
    }

    expect(() => handlePlayerJoin(anotherPlayer.id, anotherPlayer.name))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')))
  })
})
