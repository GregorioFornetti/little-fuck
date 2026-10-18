<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { lobby, playerId } from '@/connection';
import AppHeader from '../AppHeader.vue';
import { buildRankingRows } from './gameState';

const { t } = useI18n();

const rankingRows = computed(() =>
  lobby.value?.gameRanking
    ? buildRankingRows(lobby.value.players, lobby.value.gameRanking, playerId)
    : []
);

const backToLobby = () => {
  if (lobby.value) {
    lobby.value.gameRanking = undefined;
  }
};
</script>

<template>
  <div
    v-if="lobby?.gameRanking"
    class="card-table flex min-h-screen w-screen flex-col text-white"
  >
    <AppHeader />

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

      <button
        type="button"
        class="mt-8 w-full rounded-full bg-amber-400 px-10 py-3 font-serif text-lg font-bold text-emerald-950 shadow hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60 sm:w-auto"
        @click="backToLobby"
      >
        {{ t('GAME.BACK_TO_LOBBY') }}
      </button>
    </main>
  </div>
</template>
