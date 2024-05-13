import '../setupTests';
import { handlePlayerReady } from '@/events/lobby/handlers/playerReady';
import Lobby, { Game } from '@/interfaces/Lobby';

describe('handlePlayerReady', () => {
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

  test('Deve definir o jogador como preparado', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer]
    };

    const lobby: Lobby = connection.lobby.value;

    handlePlayerReady(anotherPlayer.id);

    // Verifica se foi modificado apenas o status de ready para true
    expect(lobby.players[1]).toEqual({ ...anotherPlayer, ready: true });
    // Verifica se não modifica outros players no lobby
    expect(lobby.players[0]).toEqual(leaderPlayer);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handlePlayerReady(anotherPlayer.id)).toThrow('Você não está em um lobby !');
  });

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
      players: [anotherPlayer]
    }

    expect(() => handlePlayerReady(anotherPlayer.id))
      .toThrow(Error('Não foi possível adicionar um novo jogador ao seu lobby atual, o jogo já começou !'))
  })

  test('Deve emitir um erro se o jogador informado não estiver no lobby', () => {
    const connection = require('@/connection');
    
    connection.socket = { id: leaderPlayer.id };
    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer]
    };

    expect(() => handlePlayerReady(anotherPlayer.id))
      .toThrow('Não foi possível atualizar o status de um jogador para preparado: Jogador não encontrado !');
  });
});
