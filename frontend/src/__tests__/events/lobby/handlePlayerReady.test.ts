import '../setupTests';
import { Game } from '@/interfaces/Lobby';
import { handlePlayerReady } from '@/events/lobby/handlers/playerReady';
import { i18n } from '@/plugins/i18n';
import { lobby, socket } from '@/connection';

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
    lobby.value = {
      lobbyId: '123',
      players: [readyPlayer, unreadyPlayer]
    };

    handlePlayerReady(unreadyPlayer.id);

    // Verifica se foi modificado apenas o status de ready para true
    expect(lobby.value.players[1]).toEqual({ ...unreadyPlayer, ready: true });
    // Verifica se não modifica outros players no lobby
    expect(lobby.value.players[0]).toEqual(readyPlayer);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handlePlayerReady(unreadyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve emitir um erro se um jogo já estiver começado no lobby atual do jogador', () => {
    const game: Game = {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {},
    };

    lobby.value = {
      lobbyId: '123',
      game: game,
      players: [unreadyPlayer]
    };

    expect(() => handlePlayerReady(unreadyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')));
  });

  test('Deve emitir um erro se o jogador informado não estiver no lobby', () => {
    socket.id = readyPlayer.id;
    lobby.value = {
      lobbyId: '123',
      players: [readyPlayer]
    };

    expect(() => handlePlayerReady(unreadyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND')));
  });
});
