import './assets/main.css';
import { createApp } from 'vue';
import i18n from './plugins/i18n';
import App from './App.vue';

const app = createApp(App);

app.use(i18n);
app.mount('#app');

// Registra o service worker para o jogo ser instalável (PWA) em produção.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {
      // Sem service worker o jogo continua funcionando normalmente no navegador.
    });
  });
}
