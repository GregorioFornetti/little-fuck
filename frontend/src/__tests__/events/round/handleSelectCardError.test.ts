
import '../setupTests';
import { handleSelectCardError } from '@/events/round/handlers/selectCardError';
import { i18n } from '@/plugins/i18n';

describe('handleSelectCardError', () => {
  test('Deve gerar o erro correto caso seja do tipo "not-your-turn"', () => {
    expect(() => handleSelectCardError('not-your-turn')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_YOUR_TURN')));
  });

  test('Deve gerar o erro correto caso seja do tipo "invalid-index"', () => {
    expect(() => handleSelectCardError('invalid-index')).toThrow(Error(i18n.t('COMMON.ERROR.INVALID_INDEX')));
  });

  test('Deve gerar o erro correto caso seja do tipo "not-in-lobby"', () => {
    expect(() => handleSelectCardError('not-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });
});
