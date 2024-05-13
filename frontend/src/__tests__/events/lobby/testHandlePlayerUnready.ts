import '../setupTests';
import { handlePlayerUnready } from '@/events/lobby/handlers/playerUnready';
import Lobby, { Game } from '@/interfaces/Lobby';

describe('handlePlayerUnready', () => {
  const readyPlayer = {
    id: '12345',
    name: 'leader player',
    leader: true,
    ready: true
  };
  
  const unreadyPlayer = {
    id: '123',
    name: 'John joe',
    leader: false,
    ready: false
  };

  test('Deve definir o jogador como não preparado', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [readyPlayer, unreadyPlayer]
    };

    const lobby: Lobby = connection.lobby.value;

    handlePlayerUnready(readyPlayer.id);

    // Verifica se foi modificado apenas o status de ready para false
    expect(lobby.players[0]).toEqual({ ...readyPlayer, ready: false });
    // Verifica se não modifica outros players no lobby
    expect(lobby.players[1]).toEqual(unreadyPlayer);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handlePlayerUnready(unreadyPlayer.id)).toThrow('Você não está em um lobby !');
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
      players: [readyPlayer]
    }

    expect(() => handlePlayerUnready(readyPlayer.id))
      .toThrow(Error('Não foi possível atualizar o status de um jogador para não preparado: O jogo já começou !'))
  })

  test('Deve emitir um erro se o jogador informado não estiver no lobby', () => {
    const connection = require('@/connection');
    
    connection.socket = { id: unreadyPlayer.id };
    connection.lobby.value = {
      lobbyId: '123',
      players: [unreadyPlayer]
    };

    expect(() => handlePlayerUnready(readyPlayer.id))
      .toThrow('Não foi possível atualizar o status de um jogador para não preparado: Jogador não encontrado !');
  });
});
