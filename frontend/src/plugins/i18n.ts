import { createI18n } from 'vue-i18n';
import ptBR from '@/locales/pt-BR.json';
import enUS from '@/locales/en-US.json';

type MessageSchema = typeof ptBR;

export type AvailableLocale = 'pt-BR' | 'en-US';

export const AVAILABLE_LOCALES: AvailableLocale[] = ['pt-BR', 'en-US'];
export const LOCALE_STORAGE_KEY = 'little-fuck-locale';

const getStoredLocale = (): AvailableLocale => {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored === 'en-US' || stored === 'pt-BR' ? stored : 'pt-BR';
  } catch {
    return 'pt-BR';
  }
};

const environment = process.env.NODE_ENV;

const I18n = createI18n<[MessageSchema], AvailableLocale>({
  // For use with Vue Composition API
  legacy: false,
  // Hide warnings only for test environment
  missingWarn: environment !== 'test',
  fallbackLocale: 'pt-BR',
  locale: typeof window === 'undefined' ? 'pt-BR' : getStoredLocale(),
  messages: {
    'pt-BR': ptBR,
    'en-US': enUS
  }
});

export const i18n = I18n.global;

export const setLocale = (locale: AvailableLocale) => {
  (I18n.global.locale as unknown as { value: AvailableLocale }).value = locale;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage unavailable (e.g. private mode); the in-memory locale still applies.
  }
};

export default I18n;
