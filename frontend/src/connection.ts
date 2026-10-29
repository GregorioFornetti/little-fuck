
import { io } from 'socket.io-client';
import { ref } from 'vue';
import EventsEmitter from './events/EventsEmitter';
import EventsListenersAdder from './events/EventsListenersAdder';
import type { Card, Lobby, PowerupType } from './interfaces/Lobby';
import addDefaultEventsListeners from './events/addDefaultEventsListeners';

const PLAYER_ID_STORAGE_KEY = 'little-fuck-player-id';

const createPlayerId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/**
 * Id estável do jogador, guardado no navegador. É ele que identifica o
 * jogador no servidor (não o id do socket), então ao recarregar a página
 * ou cair a conexão o jogador é reconhecido e volta para a mesma sala.
 */
const getOrCreatePlayerId = (): string => {
  if (typeof window === 'undefined') {
    return createPlayerId();
  }
  try {
    const stored = window.localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (stored) {
      return stored;
    }
    const newPlayerId = createPlayerId();
    window.localStorage.setItem(PLAYER_ID_STORAGE_KEY, newPlayerId);
    return newPlayerId;
  } catch {
    return createPlayerId();
  }
};

const playerId = getOrCreatePlayerId();

const rootUrl: string = process.env.NODE_ENV === 'development' ?
  'localhost:3000' :
  window.location.host;
const socket = io(
  rootUrl, {
    autoConnect: false,
    auth: { playerId },
    path: `${import.meta.env.VITE_SERVER_PATH || ''}/socket.io/`
  }
);
socket.connect();

const eventsEmitter = new EventsEmitter(socket);
const eventsListenersAdder = new EventsListenersAdder(socket);
const lobby = ref<Lobby|null>(null);
/** Poderes guardados do próprio jogador (atualizado pelo evento powerups-update) */
const playerPowerups = ref<PowerupType[]>([]);
/** Carta revelada pelo poder peek-card (visível apenas para quem usou) */
const peekedCard = ref<{ card: Card, targetPlayerId: string } | null>(null);

addDefaultEventsListeners(socket);

export { socket, eventsEmitter, eventsListenersAdder, lobby, playerId, playerPowerups, peekedCard };
