import '../setupTests';
import { handlePlayerLogout } from '@/events/lobby/handlers/playerLogout';
import Lobby from '@/interfaces/Lobby';

describe('handlePlayerLogout', () => {
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

  test('Deve remover o jogador do lobby', () => {
    const connection = require('@/connection');
    
    connection.socket = { id: leaderPlayer.id };
    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer]
    };

    const lobby: Lobby = connection.lobby.value;

    handlePlayerLogout(anotherPlayer.id);

    expect(lobby.players).toHaveLength(1);
    expect(lobby.players).toEqual([leaderPlayer]);
  });

  test('Deve remover o jogador atual do lobby e definir o lobby atual como null', () => {
    const connection = require('@/connection');
    
    connection.socket = { id: leaderPlayer.id };
    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer, anotherPlayer, { ...anotherPlayer, id: '999' }]
    };
  
    const lobby: Lobby = connection.lobby.value;

    handlePlayerLogout(leaderPlayer.id);

    // lobby.players ainda armazena a informação dos jogadores daquele lobby, pois o campo players é passado por referência
    expect(lobby.players).toHaveLength(2);
    // Enquanto o connection.lobby.value tem seu valor definido com null corretamente, não sendo possível ver a qtd de players
    expect(connection.lobby.value).toEqual(null);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handlePlayerLogout(leaderPlayer.id)).toThrow('Você não está em um lobby !');
  });

  test('Deve emitir um erro se o jogador informado não estiver no lobby', () => {
    const connection = require('@/connection');
    
    connection.socket = { id: leaderPlayer.id };
    connection.lobby.value = {
      lobbyId: '123',
      players: [leaderPlayer]
    };

    expect(() => handlePlayerLogout(anotherPlayer.id))
      .toThrow('Não foi possível remover o jogador do lobby atual: Jogador não encontrado !');
  });
});
