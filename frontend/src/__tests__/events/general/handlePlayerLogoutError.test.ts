
import '../setupTests';
import { handlePlayerLogoutError } from '@/events/general/handlers/playerLogoutError';
import { i18n } from '@/plugins/i18n';

describe('handlePlayerLogoutError', () => {
  test('Deve gerar o erro correto caso seja do tipo "not-in-lobby"', () => {
    expect(() => handlePlayerLogoutError('not-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });
});
