<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, eventsListenersAdder, lobby, playerId } from '@/connection';
import AppHeader from '../AppHeader.vue';
import { areAllPlayersReady, findCurrentPlayer, readyProgress } from './lobbyReady';
import { buildRoomLink } from '@/roomLink';
import LobbyOptionsModal from '../LobbyOptionsModal.vue';
import PlayerAvatar from '../PlayerAvatar.vue';
import { APPEARANCE_COLORS, APPEARANCE_EMOTES } from '@/appearance';
import type { AppearanceErrorType } from '@/events/lobby/handlers/appearanceError';
import { getLobbyOptions, getTableThemeClass } from './gameState';

const { t } = useI18n();

const copyStatus = ref<'idle' | 'copied' | 'failed'>('idle');

const roomLink = computed(() =>
  lobby.value ? buildRoomLink(lobby.value.lobbyId, window.location.origin) : ''
);
let copyStatusTimer: ReturnType<typeof setTimeout> | undefined;

const currentPlayer = computed(() =>
  lobby.value ? findCurrentPlayer(lobby.value.players, playerId) : undefined
);
const isLeader = computed(() => currentPlayer.value?.leader === true);
const allReady = computed(() =>
  lobby.value ? areAllPlayersReady(lobby.value.players) : false
);
const progress = computed(() =>
  lobby.value ? readyProgress(lobby.value.players) : { ready: 0, total: 0 }
);
const gameStarted = computed(() => lobby.value?.game !== undefined);
const themeClass = computed(() => getTableThemeClass(getLobbyOptions(lobby.value).theme));
const MAX_LOBBY_PLAYERS = 10;
const lobbyFull = computed(() => (lobby.value?.players.length ?? 0) >= MAX_LOBBY_PLAYERS);

type BotErrorType = 'not-leader' | 'already-in-game' | 'not-in-lobby' | 'lobby-full' | 'bot-not-found';
const botErrorType = ref<BotErrorType | null>(null);
const botErrorMessage = computed(() => {
  if (!botErrorType.value) return '';
  const messages: Record<BotErrorType, string> = {
    'not-leader': t('COMMON.ERROR.NOT_LEADER'),
    'already-in-game': t('COMMON.ERROR.GAME_ALREADY_STARTED'),
    'not-in-lobby': t('COMMON.ERROR.NOT_IN_LOBBY'),
    'lobby-full': t('LOBBY.BOT_ERROR_LOBBY_FULL'),
    'bot-not-found': t('LOBBY.BOT_ERROR_NOT_FOUND')
  };
  return messages[botErrorType.value];
});

eventsListenersAdder.lobby.botError((type: BotErrorType) => {
  botErrorType.value = type;
});

const addBot = () => {
  if (!isLeader.value || gameStarted.value || lobbyFull.value) return;
  botErrorType.value = null;
  eventsEmitter.lobby.emitAddBot();
};

const removeBot = (botId: string) => {
  if (!isLeader.value || gameStarted.value) return;
  botErrorType.value = null;
  eventsEmitter.lobby.emitRemoveBot(botId);
};
const optionsModalOpen = ref(false);
const appearanceModalOpen = ref(false);
const appearanceErrorMessage = ref('');
let appearanceErrorTimer: ReturnType<typeof setTimeout> | undefined;
eventsListenersAdder.lobby.appearanceError((type: AppearanceErrorType) => {
  appearanceErrorMessage.value = t(`APPEARANCE.ERROR_KEY.${type}`);
  if (appearanceErrorTimer) clearTimeout(appearanceErrorTimer);
  appearanceErrorTimer = setTimeout(() => { appearanceErrorMessage.value = ''; }, 4000);
});

const emoteTakenBy = (emote: string) =>
  lobby.value?.players.find((p) => p.id !== currentPlayer.value?.id && p.emote === emote)?.name;
const colorTakenBy = (color: string) =>
  lobby.value?.players.find((p) => p.id !== currentPlayer.value?.id && p.color === color)?.name;

const pickEmote = (emote: string) => {
  if (!currentPlayer.value || emoteTakenBy(emote)) return;
  appearanceErrorMessage.value = '';
  eventsEmitter.lobby.emitUpdateAppearance(emote, currentPlayer.value.color ?? APPEARANCE_COLORS[0]);
};
const pickColor = (color: string) => {
  if (!currentPlayer.value || colorTakenBy(color)) return;
  appearanceErrorMessage.value = '';
  eventsEmitter.lobby.emitUpdateAppearance(currentPlayer.value.emote ?? APPEARANCE_EMOTES[0], color);
};

const setCopyStatus = (status: 'copied' | 'failed') => {
  copyStatus.value = status;
  if (copyStatusTimer) clearTimeout(copyStatusTimer);
  copyStatusTimer = setTimeout(() => {
    copyStatus.value = 'idle';
  }, 2000);
};

const copyRoomLink = async () => {
  const code = roomLink.value;
  try {
    await navigator.clipboard.writeText(code);
    setCopyStatus('copied');
    return;
  } catch {
    // Clipboard API unavailable (e.g. non-secure context); fall back below.
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    setCopyStatus(ok ? 'copied' : 'failed');
  } catch {
    setCopyStatus('failed');
  }
};

const toggleReady = () => {
  if (!currentPlayer.value || currentPlayer.value.leader) return;
  if (currentPlayer.value.ready) {
    eventsEmitter.lobby.emitUnready();
  } else {
    eventsEmitter.lobby.emitReady();
  }
};

const startGame = () => {
  if (!isLeader.value || !allReady.value || gameStarted.value) return;
  eventsEmitter.lobby.emitStartGameRequest();
};

onBeforeUnmount(() => {
  if (copyStatusTimer) clearTimeout(copyStatusTimer);
});
</script>

<template>
  <div
    v-if="lobby"
    :class="['card-table flex min-h-screen w-screen flex-col text-white', themeClass]"
  >
    <AppHeader />

    <main class="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 class="font-serif text-3xl font-bold">
        {{ t('LOBBY.TITLE') }}
      </h1>

      <!-- Lobby code -->
      <section class="mt-6 rounded-lg bg-black/25 p-4">
        <p class="text-sm text-emerald-100/80">
          {{ t('LOBBY.LINK_LABEL') }}
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-emerald-950 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60"
            @click="copyRoomLink"
          >
            {{ t('LOBBY.COPY_LINK') }}
          </button>
          <p class="w-full break-all text-xs text-emerald-100/70">
            {{ roomLink }}
          </p>
          <span
            v-if="copyStatus === 'copied'"
            role="status"
            class="text-sm font-semibold text-emerald-200"
          >
            {{ t('LOBBY.COPIED') }}
          </span>
          <span
            v-else-if="copyStatus === 'failed'"
            role="alert"
            class="text-sm font-semibold text-red-300"
          >
            {{ t('LOBBY.COPY_FAILED') }}
          </span>
        </div>
      </section>

      <!-- Players -->
      <section class="mt-6">
        <h2 class="font-serif text-xl font-bold">
          {{ t('LOBBY.PLAYERS') }} ({{ lobby.players.length }})
        </h2>
        <ul class="mt-3 divide-y divide-white/10 rounded-lg bg-black/25">
          <li
            v-for="player in lobby.players"
            :key="player.id"
            class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <span class="flex flex-wrap items-center gap-2">
              <PlayerAvatar :emote="player.emote" :color="player.color" size="sm" />
              <span class="font-semibold">{{ player.name }}</span>
              <span
                v-if="player.id === currentPlayer?.id"
                class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
              >
                {{ t('LOBBY.YOU') }}
              </span>
              <span
                v-if="player.leader"
                class="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-emerald-950"
              >
                {{ t('LOBBY.LEADER') }}
              </span>
              <span
                v-if="player.bot"
                class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
              >
                {{ t('LOBBY.BOT') }}
              </span>
              <button
                v-if="isLeader && player.bot && !gameStarted"
                type="button"
                :aria-label="t('LOBBY.REMOVE_BOT')"
                class="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-red-300 hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-300"
                @click="removeBot(player.id)"
              >
                ✕
              </button>
            </span>
            <span
              v-if="!player.leader"
              class="rounded-full px-3 py-1 text-sm font-semibold"
              :class="player.ready
                ? 'bg-emerald-400/20 text-emerald-200'
                : 'bg-white/10 text-white/60'"
            >
              {{ player.ready ? t('LOBBY.READY') : t('LOBBY.NOT_READY') }}
            </span>
          </li>
        </ul>
      </section>

      <!-- Appearance -->
      <section class="mt-6 rounded-lg bg-black/25 p-4">
        <h2 class="font-serif text-xl font-bold">
          {{ t('APPEARANCE.TITLE') }}
        </h2>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <PlayerAvatar :emote="currentPlayer?.emote" :color="currentPlayer?.color" size="lg" />
          <span class="font-semibold">{{ currentPlayer?.name }}</span>
          <button
            type="button"
            :disabled="gameStarted"
            class="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-emerald-950 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:opacity-50"
            @click="appearanceModalOpen = true"
          >
            {{ t('APPEARANCE.BUTTON') }}
          </button>
        </div>
        <p
          v-if="appearanceErrorMessage"
          role="alert"
          class="mt-2 text-sm font-semibold text-red-300"
        >
          {{ appearanceErrorMessage }}
        </p>
      </section>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          class="w-full rounded-full border-2 border-white/70 px-10 py-3 font-serif text-lg font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30 sm:w-auto"
          @click="optionsModalOpen = true"
        >
          {{ t('OPTIONS.BUTTON') }}
        </button>
        <button
          v-if="isLeader && !gameStarted"
          type="button"
          :disabled="lobbyFull"
          class="w-full rounded-full border-2 border-white/70 px-10 py-3 font-serif text-lg font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          @click="addBot"
        >
          {{ t('LOBBY.ADD_BOT') }}
        </button>
      </div>
      <p
        v-if="botErrorType"
        role="alert"
        class="mt-3 font-semibold text-red-300"
      >
        {{ botErrorMessage }}
      </p>

      <!-- Actions -->
      <section class="mt-8">
        <p
          v-if="gameStarted"
          role="status"
          class="rounded-lg bg-black/25 px-4 py-3 font-semibold text-emerald-200"
        >
          {{ t('LOBBY.GAME_STARTED') }}
        </p>

        <template v-else-if="isLeader">
          <button
            type="button"
            :disabled="!allReady"
            class="w-full rounded-full bg-amber-400 px-10 py-3 font-serif text-lg font-bold text-emerald-950 shadow hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50 disabled:shadow-none sm:w-auto"
            @click="startGame"
          >
            {{ t('LOBBY.START_GAME') }}
          </button>
          <p class="mt-3 text-sm text-emerald-100/80">
            {{ allReady
              ? t('LOBBY.ALL_READY')
              : t('LOBBY.WAITING_FOR_PLAYERS', { ready: progress.ready, total: progress.total }) }}
          </p>
        </template>

        <template v-else-if="currentPlayer">
          <button
            type="button"
            :aria-pressed="currentPlayer.ready === true"
            class="w-full rounded-full px-10 py-3 font-serif text-lg font-bold shadow focus:outline-none focus:ring-4 sm:w-auto"
            :class="currentPlayer.ready
              ? 'bg-white text-emerald-900 hover:bg-emerald-50 focus:ring-white/40'
              : 'bg-amber-400 text-emerald-950 hover:bg-amber-300 focus:ring-amber-200/60'"
            @click="toggleReady"
          >
            {{ currentPlayer.ready ? t('LOBBY.MARK_NOT_READY') : t('LOBBY.MARK_READY') }}
          </button>
          <p
            v-if="allReady"
            class="mt-3 text-sm text-emerald-100/80"
          >
            {{ t('LOBBY.WAITING_FOR_LEADER') }}
          </p>
        </template>
      </section>
    </main>
  </div>
  <LobbyOptionsModal
    :show="optionsModalOpen"
    :is-leader="isLeader"
    :close-modal="() => { optionsModalOpen = false; }"
  />

  <!-- Appearance picker -->
  <div
    v-if="appearanceModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-emerald-950 p-6 text-white shadow-xl">
      <h2 class="font-serif text-2xl font-bold">
        {{ t('APPEARANCE.TITLE') }}
      </h2>
      <p class="mt-4 text-sm font-semibold text-emerald-100/80">
        {{ t('APPEARANCE.EMOTE') }}
      </p>
      <div class="mt-2 grid grid-cols-5 gap-2">
        <button
          v-for="emote in APPEARANCE_EMOTES"
          :key="emote"
          type="button"
          :disabled="!!emoteTakenBy(emote)"
          :title="emoteTakenBy(emote) ? t('APPEARANCE.TAKEN', { name: emoteTakenBy(emote) }) : emote"
          class="flex h-12 items-center justify-center rounded-lg bg-white/10 text-2xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
          :class="currentPlayer?.emote === emote ? 'ring-2 ring-amber-300 bg-white/25' : ''"
          @click="pickEmote(emote)"
        >
          {{ emote }}
        </button>
      </div>
      <p class="mt-4 text-sm font-semibold text-emerald-100/80">
        {{ t('APPEARANCE.COLOR') }}
      </p>
      <div class="mt-2 grid grid-cols-5 gap-2">
        <button
          v-for="color in APPEARANCE_COLORS"
          :key="color"
          type="button"
          :disabled="!!colorTakenBy(color)"
          :title="colorTakenBy(color) ? t('APPEARANCE.TAKEN', { name: colorTakenBy(color) }) : color"
          class="flex h-12 items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-30"
          :class="currentPlayer?.color === color ? 'ring-2 ring-white' : ''"
          :style="{ backgroundColor: color }"
          @click="pickColor(color)"
        >
          <span v-if="currentPlayer?.color === color" class="text-lg font-bold text-white">✓</span>
        </button>
      </div>
      <p
        v-if="appearanceErrorMessage"
        role="alert"
        class="mt-3 text-sm font-semibold text-red-300"
      >
        {{ appearanceErrorMessage }}
      </p>
      <button
        type="button"
        class="mt-6 w-full rounded-full bg-amber-400 px-6 py-2 font-serif text-lg font-bold text-emerald-950 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60"
        @click="appearanceModalOpen = false"
      >
        {{ t('APPEARANCE.CLOSE') }}
      </button>
    </div>
  </div>
</template>
