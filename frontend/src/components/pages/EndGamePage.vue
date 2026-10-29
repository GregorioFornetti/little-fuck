<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, lobby, playerId } from '@/connection';
import AppHeader from '../AppHeader.vue';
import { buildRankingRows, getLobbyOptions, getTableThemeClass } from './gameState';
import Confetti from '../Confetti.vue';
import PlayerAvatar from '../PlayerAvatar.vue';

const { t } = useI18n();

const themeClass = computed(() => getTableThemeClass(getLobbyOptions(lobby.value).theme));

const rankingRows = computed(() =>
  lobby.value?.gameRanking
    ? buildRankingRows(lobby.value.players, lobby.value.gameRanking, playerId)
    : []
);

const isLeader = computed(
  () => lobby.value?.players.find((player) => player.id === playerId)?.leader === true
);

const rematch = () => {
  if (!isLeader.value) return;
  eventsEmitter.lobby.emitRematchRequest();
};

const shareStatus = ref<'idle' | 'copied' | 'failed'>('idle');
let shareStatusTimer: ReturnType<typeof setTimeout> | undefined;

const setShareStatus = (status: 'copied' | 'failed') => {
  shareStatus.value = status;
  if (shareStatusTimer) clearTimeout(shareStatusTimer);
  shareStatusTimer = setTimeout(() => {
    shareStatus.value = 'idle';
  }, 2500);
};

const buildShareText = () => {
  const lines = rankingRows.value.map((row) =>
    row.position === 1 ? `${row.position}. ${row.name} 🏆` : `${row.position}. ${row.name}`
  );
  return [t('GAME.SHARE_HEADER'), ...lines].join('\n');
};

const shareResult = async () => {
  const text = buildShareText();
  try {
    await navigator.clipboard.writeText(text);
    setShareStatus('copied');
    return;
  } catch {
    // Clipboard API unavailable; fall back below.
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    setShareStatus(ok ? 'copied' : 'failed');
  } catch {
    setShareStatus('failed');
  }
};

onBeforeUnmount(() => {
  if (shareStatusTimer) clearTimeout(shareStatusTimer);
});
const backToLobby = () => {
  if (lobby.value) {
    lobby.value.gameRanking = undefined;
  }
};
</script>

<template>
  <div
    v-if="lobby?.gameRanking"
    :class="['card-table flex min-h-screen w-screen flex-col text-white', themeClass]"
  >
    <AppHeader />
    <Confetti v-if="rankingRows.length > 0" />

    <main class="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6">
      <h1 class="font-serif text-3xl font-bold">
        {{ t('GAME.GAME_OVER') }}
      </h1>
      <h2 class="mt-6 font-serif text-xl font-bold">
        {{ t('GAME.RANKING') }}
      </h2>
      <p class="mt-1 text-sm text-emerald-100/80">
        {{ t('GAME.RANKING_SUBTITLE') }}
      </p>

      <ol class="mt-4 divide-y divide-white/10 rounded-lg bg-black/25">
        <li
          v-for="row in rankingRows"
          :key="row.playerId"
          class="flex flex-wrap items-center gap-3 px-4 py-3"
          :class="row.position === 1 ? 'bg-amber-400/10' : ''"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold"
            :class="row.position === 1
              ? 'bg-amber-400 text-emerald-950'
              : 'bg-white/10 text-white'"
          >
            {{ row.position }}
          </span>
          <PlayerAvatar :emote="row.emote" :color="row.color" size="sm" />
          <span class="font-semibold">{{ row.name }}</span>
          <span
            v-if="row.position === 1"
            class="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-emerald-950"
          >
            {{ t('GAME.WINNER') }}
          </span>
          <span
            v-if="row.isCurrentPlayer"
            class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
          >
            {{ t('LOBBY.YOU') }}
          </span>
          <span
            v-if="row.leader"
            class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
          >
            {{ t('LOBBY.LEADER') }}
          </span>
        </li>
      </ol>

      <div class="mt-8 flex flex-wrap items-center gap-3">
        <button
          v-if="isLeader"
          type="button"
          class="w-full rounded-full bg-amber-400 px-10 py-3 font-serif text-lg font-bold text-emerald-950 shadow hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60 sm:w-auto"
          @click="rematch"
        >
          {{ t('GAME.REMATCH') }}
        </button>
        <button
          type="button"
          class="w-full rounded-full px-10 py-3 font-serif text-lg font-bold shadow focus:outline-none focus:ring-4 sm:w-auto"
          :class="isLeader
            ? 'border-2 border-white/70 text-white hover:bg-white/10 focus:ring-white/30'
            : 'bg-amber-400 text-emerald-950 hover:bg-amber-300 focus:ring-amber-200/60'"
          @click="backToLobby"
        >
          {{ t('GAME.BACK_TO_LOBBY') }}
        </button>
      </div>
      <p
        v-if="!isLeader"
        class="mt-3 text-sm text-emerald-100/80"
      >
        {{ t('GAME.WAITING_LEADER_REMATCH') }}
      </p>

      <div class="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="rounded-full border-2 border-white/70 px-6 py-2 text-sm font-bold text-white hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
          @click="shareResult"
        >
          {{ t('GAME.SHARE_RESULT') }}
        </button>
        <span
          v-if="shareStatus === 'copied'"
          role="status"
          class="text-sm font-semibold text-emerald-200"
        >
          {{ t('GAME.RESULT_COPIED') }}
        </span>
        <span
          v-else-if="shareStatus === 'failed'"
          role="alert"
          class="text-sm font-semibold text-red-300"
        >
          {{ t('GAME.RESULT_COPY_FAILED') }}
        </span>
      </div>
    </main>
  </div>
</template>
