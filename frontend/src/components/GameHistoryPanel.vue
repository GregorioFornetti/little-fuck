<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { lobby } from '@/connection';
import type { Card, MatchHistoryEntry } from '@/interfaces/Lobby';
import RoundTable from './RoundTable.vue';
import { getManilhaMode, isManilhaInRound } from './pages/gameState';
import { ref } from 'vue';

const props = defineProps<{
  entries: MatchHistoryEntry[];
  hideTitle?: boolean;
}>();

const { t } = useI18n();

const playerName = (playerId: string) =>
  lobby.value?.players.find((player) => player.id === playerId)?.name ?? playerId;

const reversedEntries = computed(() => [...props.entries].reverse());


const replayMatchNumber = ref<number | null>(null);
const replayRoundIndex = ref(0);

const openReplay = (matchNumber: number) => {
  replayMatchNumber.value = replayMatchNumber.value === matchNumber ? null : matchNumber;
  replayRoundIndex.value = 0;
};

const replayManilhaOf = (entry: MatchHistoryEntry, roundIndex: number) => (card: Card) =>
  isManilhaInRound(
    card,
    getManilhaMode(entry.cardType, entry.turnedCard, roundIndex + 1),
    entry.turnedCard
  );
const roundWinnerNames = (entry: MatchHistoryEntry) =>
  entry.roundWinners
    .filter((round) => round.points > 0)
    .map((round) => playerName(round.winnerId))
    .join(', ');
</script>

<template>
  <div>
    <h2
      v-if="!hideTitle"
      class="font-serif text-xl font-bold">
      {{ t('GAME.HISTORY') }}
    </h2>
    <p
      v-if="entries.length === 0"
      class="mt-2 text-sm text-emerald-100/80"
    >
      —
    </p>
    <ol class="mt-3 space-y-3">
      <li
        v-for="entry in reversedEntries"
        :key="entry.matchNumber"
        class="rounded-lg bg-black/25 px-3 py-2"
      >
        <h3 class="text-sm font-bold">
          {{ t('GAME.HISTORY_MATCH', { n: entry.matchNumber }) }}
        </h3>
        <ul class="mt-1 space-y-0.5 text-sm text-emerald-100/90">
          <li
            v-for="row in entry.rows"
            :key="row.playerId"
          >
            {{ playerName(row.playerId) }}: {{ row.guessed }} → {{ row.won }}
            <span :class="row.healthDelta < 0 ? 'font-semibold text-red-300' : 'text-emerald-200'">
              ({{ row.healthDelta > 0 ? '+' : '' }}{{ row.healthDelta }})
            </span>
          </li>
        </ul>
        <p
          v-if="roundWinnerNames(entry)"
          class="mt-1 text-xs text-emerald-100/70"
        >
          {{ t('GAME.HISTORY_ROUNDS') }}: {{ roundWinnerNames(entry) }}
        </p>
        <div v-if="entry.rounds && entry.rounds.length > 0">
          <button
            type="button"
            class="mt-2 rounded-full border border-white/40 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            @click="openReplay(entry.matchNumber)"
          >
            {{ t('GAME.REPLAY') }}
          </button>
          <div
            v-if="replayMatchNumber === entry.matchNumber"
            class="mt-2"
          >
            <div class="flex items-center justify-between gap-2">
              <button
                type="button"
                class="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white disabled:opacity-40"
                :disabled="replayRoundIndex <= 0"
                @click="replayRoundIndex--"
              >
                ‹
              </button>
              <span class="text-xs font-semibold text-emerald-100/90">
                {{ t('GAME.REPLAY_ROUND', { current: replayRoundIndex + 1, total: entry.rounds.length }) }}
              </span>
              <button
                type="button"
                class="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white disabled:opacity-40"
                :disabled="replayRoundIndex >= entry.rounds.length - 1"
                @click="replayRoundIndex++"
              >
                ›
              </button>
            </div>
            <RoundTable
              :cards="entry.rounds[replayRoundIndex].cards"
              :winner-id="entry.rounds[replayRoundIndex].points > 0 ? entry.rounds[replayRoundIndex].winnerId : undefined"
              :manilha-of="replayManilhaOf(entry, replayRoundIndex)"
            />
            <p class="mt-1 text-xs font-semibold text-amber-200">
              {{ entry.rounds[replayRoundIndex].points > 0
                ? t('GAME.REPLAY_WINNER', { name: playerName(entry.rounds[replayRoundIndex].winnerId) })
                : t('GAME.REPLAY_TIE') }}
            </p>
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>
