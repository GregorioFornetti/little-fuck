
import '../setupTests';
import { handleWinRoundsNumberError } from '@/events/match/handlers/winRoundsNumberError';
import { i18n } from '@/plugins/i18n';

describe('handleWinRoundsNumberError', () => {
  test('Deve gerar o erro correto caso seja do tipo "not-your-turn"', () => {
    expect(() => handleWinRoundsNumberError('not-your-turn')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_YOUR_TURN')));
  });

  test('Deve gerar o erro correto caso seja do tipo "negative-is-invalid"', () => {
    expect(() => handleWinRoundsNumberError('negative-is-invalid')).toThrow(Error(i18n.t('COMMON.ERROR.NEGATIVE_IS_INVALID')));
  });

  test('Deve gerar o erro correto caso seja do tipo "not-in-lobby"', () => {
    expect(() => handleWinRoundsNumberError('not-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve gerar o erro correto caso seja do tipo "num-wins-equals-num-cards"', () => {
    expect(() => handleWinRoundsNumberError('num-wins-equals-num-cards')).toThrow(Error(i18n.t('COMMON.ERROR.NUM_WINS_EQUALS_NUM_CARDS')));
  });
});
