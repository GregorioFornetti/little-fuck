
import '../setupTests';
import { handleJoinLobbyError } from '@/events/lobby/handlers/joinLobbyError';
import { i18n } from '@/plugins/i18n';

describe('handleJoinLobbyError', () => {
  test('Deve gerar o erro correto caso seja do tipo "lobby-in-game"', () => {
    expect(() => handleJoinLobbyError('lobby-in-game')).toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')));
  });

  test('Deve gerar o erro correto caso seja do tipo "inexistent-lobby"', () => {
    expect(() => handleJoinLobbyError('inexistent-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.LOBBY_NOT_FOUND')));
  });

  test('Deve gerar o erro correto caso seja do tipo "no-name"', () => {
    expect(() => handleJoinLobbyError('no-name')).toThrow(Error(i18n.t('COMMON.ERROR.NO_NAME')));
  });

  test('Deve gerar o erro correto caso seja do tipo "repeated-name"', () => {
    expect(() => handleJoinLobbyError('repeated-name')).toThrow(Error(i18n.t('COMMON.ERROR.REPEATED_NAME')));
  });

  test('Deve gerar o erro correto caso seja do tipo "player-already-in-lobby"', () => {
    expect(() => handleJoinLobbyError('player-already-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.ALREADY_IN_LOBBY')));
  });
});
