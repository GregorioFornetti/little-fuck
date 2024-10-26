
import '../setupTests';
import { handlePlayerReadyError } from '@/events/lobby/handlers/playerReadyError';
import { i18n } from '@/plugins/i18n';

describe('handlePlayerReadyError', () => {
  test('Deve gerar o erro correto caso seja do tipo "in-game"', () => {
    expect(() => handlePlayerReadyError('in-game')).toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')));
  });

  test('Deve gerar o erro correto caso seja do tipo "not-in-lobby"', () => {
    expect(() => handlePlayerReadyError('not-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve gerar o erro correto caso seja do tipo "leader"', () => {
    expect(() => handlePlayerReadyError('leader')).toThrow(Error(i18n.t('COMMON.ERROR.LEADER_CANNOT_READY')));
  });
});
