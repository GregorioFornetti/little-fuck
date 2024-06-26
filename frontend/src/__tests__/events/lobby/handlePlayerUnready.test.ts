
import '../setupTests';
import { Game } from '@/interfaces/Lobby';
import { handlePlayerUnready } from '@/events/lobby/handlers/playerUnready';
import { i18n } from '@/plugins/i18n';
import { lobby, socket } from '@/connection';

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
    lobby.value = {
      lobbyId: '123',
      players: [readyPlayer, unreadyPlayer]
    };

    handlePlayerUnready(readyPlayer.id);

    // Verifica se foi modificado apenas o status de ready para false
    expect(lobby.value.players[0]).toEqual({ ...readyPlayer, ready: false });
    // Verifica se não modifica outros players no lobby
    expect(lobby.value.players[1]).toEqual(unreadyPlayer);
  });

  test('Deve emitir um erro se o jogador atual não estiver em um lobby', () => {
    expect(() => handlePlayerUnready(unreadyPlayer.id))
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
      players: [readyPlayer]
    };

    expect(() => handlePlayerUnready(readyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')));
  });

  test('Deve emitir um erro se o jogador informado não estiver no lobby', () => {
    socket.id = unreadyPlayer.id;
    lobby.value = {
      lobbyId: '123',
      players: [unreadyPlayer]
    };

    expect(() => handlePlayerUnready(readyPlayer.id))
      .toThrow(Error(i18n.t('COMMON.ERROR.PLAYER_NOT_FOUND')));
  });
});
