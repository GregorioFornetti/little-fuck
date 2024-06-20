import './setupTests';
import { ptBRLocale } from './locales';
import i18n from '@/plugins/i18n';

describe('i18n', () => {
  test('Deve exibir a mensagem definida no locale em pt-BR', () => {
    expect(i18n.global.t('MESSAGE_CODE')).toEqual(ptBRLocale['MESSAGE_CODE']);
  });

  test('Deve apenas exibir o código da mensagem quando não encontrado', () => {
    expect(() => i18n.global.t('INVALID_MESSAGE_CODE')).not.toThrow();
    expect(i18n.global.t('INVALID_MESSAGE_CODE')).toEqual('INVALID_MESSAGE_CODE');
  });
});
