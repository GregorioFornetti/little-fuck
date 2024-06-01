import i18next from 'i18next';
import ptBR from '../locales/pt-BR.json';

type MessageSchema  = typeof ptBR;

i18next.init<MessageSchema>({
  lng: 'pt-BR',
  debug: false,
  resources: {
    'pt-BR': {
      translation: ptBR
    }
  }
});


export default i18next
