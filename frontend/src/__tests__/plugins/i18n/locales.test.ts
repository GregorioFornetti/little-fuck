import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';
import i18n, { setLocale } from '@/plugins/i18n';

const flattenKeys = (obj: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    value !== null && typeof value === 'object'
      ? flattenKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  ).sort();

describe('locales', () => {
  test('pt-BR and en-US have the same keys', () => {
    expect(flattenKeys(enUS)).toEqual(flattenKeys(ptBR));
  });

  test('switching locale changes the home page messages', () => {
    setLocale('en-US');
    expect(i18n.global.t('HOME.CREATE_GAME')).toEqual('Create a game');
    expect(i18n.global.t('HOME.HOW_TO_PLAY')).toEqual('How to play');

    setLocale('pt-BR');
    expect(i18n.global.t('HOME.CREATE_GAME')).toEqual('Criar um jogo');
    expect(i18n.global.t('HOME.HOW_TO_PLAY')).toEqual('Como jogar');
  });
});
