
import '../setupTests';
import { handleStartGameError } from '@/events/lobby/handlers/startGameError';
import { i18n } from '@/plugins/i18n';

describe('handleStartGameError', () => {
  test('Deve gerar o erro correto caso seja do tipo "not-leader"', () => {
    expect(() => handleStartGameError('not-leader')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_LEADER')));
  });

  test('Deve gerar o erro correto caso seja do tipo "not-all-ready"', () => {
    expect(() => handleStartGameError('not-all-ready')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_ALL_READY')));
  });

  test('Deve gerar o erro correto caso seja do tipo "not-in-lobby"', () => {
    expect(() => handleStartGameError('not-in-lobby')).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });

  test('Deve gerar o erro correto caso seja do tipo "already-in-game"', () => {
    expect(() => handleStartGameError('already-in-game')).toThrow(Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED')));
  });
});
