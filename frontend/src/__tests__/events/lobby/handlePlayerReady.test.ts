import '../setupTests';
import Lobby, { Game } from '@/interfaces/Lobby';
import { handlePlayerReady } from '@/events/lobby/handlers/playerReady';
import { i18n } from '@/plugins/i18n';

describe('handlePlayerReady', () => {
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

  test('Deve definir o jogador como preparado', () => {
    const connection = require('@/connection');

    connection.lobby.value = {
      lobbyId: '123',
      players: [readyPlayer, unreadyPlayer]
    };

    const lobby: Lobby = connection.lobby.value;

    handlePlayerReady(unreadyPlayer.id);

    // Verifica se foi modificado apenas o status de ready para true
    expect(lobby.players[1]).toEqual({ ...unreadyPlayer, ready: true });
    // Verifica se não modifica outros players no lobby
    expect(lobby.players[0]).toEqual(readyPlayer);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handlePlayerReady(unreadyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
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
      players: [unreadyPlayer]
    }

    expect(() => handlePlayerReady(unreadyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')))
  })

  test('Deve emitir um erro se o jogador informado não estiver no lobby', () => {
    const connection = require('@/connection');
    
    connection.socket = { id: readyPlayer.id };
    connection.lobby.value = {
      lobbyId: '123',
      players: [readyPlayer]
    };

    expect(() => handlePlayerReady(unreadyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND')));
  });
});
