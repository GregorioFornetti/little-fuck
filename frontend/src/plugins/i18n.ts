import { createI18n } from 'vue-i18n';
import ptBR from '@/locales/pt-BR.json';

type MessageSchema  = typeof ptBR;

const environment = process.env.NODE_ENV

const i18n = createI18n<[MessageSchema], 'pt-BR'>({
  // For use with Vue Composition API
  legacy: false,
  // Hide warnings only for test environment
  missingWarn: environment !== 'test',
  locale: 'pt-BR',
  messages: {
    'pt-BR': ptBR
  }
});

export default i18n;
