
import '../setupTests';
import { handlePlayerUnreadyError } from '@/events/lobby/handlers/playerUnreadyError';
import { i18n } from '@/plugins/i18n';

describe('handlePlayerUnreadyError', () => {
  test('Deve gerar o erro correto caso seja do tipo "in-game"', () => {
    expect(() => handlePlayerUnreadyError('in-game')).toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')));
  });

  test('Deve gerar o erro correto caso seja do tipo "not-in-lobby"', () => {
    expect(() => handlePlayerUnreadyError('not-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve gerar o erro correto caso seja do tipo "leader"', () => {
    expect(() => handlePlayerUnreadyError('leader')).toThrow(Error(i18n.t('COMMON.ERROR.LEADER_CANNOT_READY')));
  });
});
