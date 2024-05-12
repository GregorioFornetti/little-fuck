import '../setupTests';
import { handlePlayerJoin } from '@/events/lobby/handlers/playerJoin';
import { Game } from '@/interfaces/Lobby';

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
      .toThrow(Error('Você não está em um lobby !'))
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
      .toThrow(Error('Não foi possível adicionar um novo jogador ao seu lobby atual, o jogo já começou !'))
  })
})
