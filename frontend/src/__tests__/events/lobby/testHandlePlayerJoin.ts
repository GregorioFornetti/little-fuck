import '../setupTests';
import { handlePlayerJoin } from '@/events/lobby/handlers/playerJoin';
import { handleJoinLobbySuccess } from '@/events/lobby/handlers/joinLobbySuccess';
import Lobby, { Game } from '@/interfaces/Lobby';

describe('handlePlayerJoin', () => {
  test('Deve adicionar o jogador ao lobby', () => {
    const lobbyParam: Lobby = {
      lobbyId: '123',
      players: [{
        id: '12345',
        name: 'leader player',
        leader: true,
        ready: true
      }]
    };

    const player = {
      id: '4321',
      name: 'john doe'
    };

    handleJoinLobbySuccess(lobbyParam)
    handlePlayerJoin(player.id, player.name)

    const connection = require('@/connection');
    
    const lobby: Lobby = connection.lobby.value;

    const expectedPlayer = { leader: false, ready: false, ...player }
    
    expect(lobby.players).toHaveLength(2);
    expect(lobby.players.pop()).toEqual(expectedPlayer);
  });

  test('Deve adicionar o jogador ao lobby vazio, e mesmo assim ele não deve ser o líder', () => {
    const lobbyParam: Lobby = {
      lobbyId: '123',
      players: []
    };

    const player = {
      id: '4321',
      name: 'john doe'
    };

    handleJoinLobbySuccess(lobbyParam)
    handlePlayerJoin(player.id, player.name)

    const connection = require('@/connection');
    
    const lobby: Lobby = connection.lobby.value;

    const expectedPlayer = { leader: false, ready: false, ...player }
    
    expect(lobby.players).toHaveLength(1);
    expect(lobby.players[0]).toEqual(expectedPlayer);
  });

  test('Deve emitir um erro se o jogador não estiver em um lobby', () => {
    const player = {
      id: '4321',
      name: 'john doe'
    };
    
    expect(() => handlePlayerJoin(player.id, player.name)).toThrow(Error('Você não está em um lobby !'))
  })

  test('Deve emitir um erro se um jogo já estiver começado no lobby atual do jogador', () => {
    const player = {
      id: '4321',
      name: 'john doe'
    };

    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
    }

    const lobbyParam: Lobby = {
      lobbyId: '123',
      game: game,
      players: [
          {
              id: '123456',
              name: 'Player1',
              ready: false,
              leader: true
          }
      ]
    }

    handleJoinLobbySuccess(lobbyParam)

    expect(() => handlePlayerJoin(player.id, player.name)).toThrow(Error('Não foi possível adicionar um novo jogador ao seu lobby atual, o jogo já começou !'))
  })
})
