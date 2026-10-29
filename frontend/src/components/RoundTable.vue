<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { lobby } from '@/connection';
import PlayingCard from './PlayingCard.vue';
import type { Card, RoundCards } from '@/interfaces/Lobby';
import { getCardBackClass, getLobbyOptions, isManilhaCardInMatch } from './pages/gameState';

const props = defineProps<{
  cards: RoundCards;
  /** Player to highlight as the round winner, if the round already ended. */
  winnerId?: string;
  /** Decides if a card is a manilha in the round those cards were played. */
  manilhaOf?: (card: Card) => boolean;
}>();

const { t } = useI18n();

const playerName = (playerId: string) =>
  lobby.value?.players.find((player) => player.id === playerId)?.name ?? playerId;

const cardBackClass = computed(() => getCardBackClass(getLobbyOptions(lobby.value)));
const isManilha = (card: Card) => props.manilhaOf ? props.manilhaOf(card) : isManilhaCardInMatch(card, undefined);

const isEmpty = computed(
  () => props.cards.onMatch.length === 0 && props.cards.anulledCards.length === 0
);
</script>

<template>
  <p
    v-if="isEmpty"
    class="mt-2 text-emerald-100/80"
  >
    {{ t('GAME.EMPTY_TABLE') }}
  </p>
  <div v-else>
    <div class="mt-3 flex flex-wrap gap-4">
      <div
        v-for="roundCard in cards.onMatch"
        :key="roundCard.playerId"
        class="flex flex-col items-center gap-1"
      >
        <div :class="winnerId === roundCard.playerId ? 'rounded-md ring-4 ring-amber-300' : ''">
          <div v-if="roundCard.hidden" :class="[cardBackClass, 'flex h-24 w-16 shrink-0 items-center justify-center rounded-md font-serif text-2xl font-bold text-emerald-100 shadow-lg ring-1 ring-white/30']">?</div><PlayingCard v-else
           :value="roundCard.card.value"
            :label="roundCard.card.label"
            :suit="roundCard.card.suit"
          :manilha="isManilha(roundCard.card)"
          />
        </div>
        <span class="max-w-16 truncate text-xs text-emerald-100/80">{{ playerName(roundCard.playerId) }}</span>
      </div>
      <div
        v-for="roundCard in cards.anulledCards"
        :key="`anulled-${roundCard.playerId}`"
        class="flex flex-col items-center gap-1"
      >
        <div v-if="roundCard.hidden" :class="[cardBackClass, 'flex h-24 w-16 shrink-0 items-center justify-center rounded-md font-serif text-2xl font-bold text-emerald-100 opacity-50 shadow-lg ring-1 ring-white/30']">?</div><PlayingCard v-else
          :value="roundCard.card.value"
          :label="roundCard.card.label"
          :suit="roundCard.card.suit"
          :manilha="isManilha(roundCard.card)"
          dimmed
        />
        <span class="max-w-16 truncate text-xs text-white/50">{{ playerName(roundCard.playerId) }}</span>
      </div>
    </div>
    <p
      v-if="cards.anulledCards.length > 0"
      class="mt-2 text-sm text-white/50"
    >
      {{ t('GAME.ANULLED') }}
    </p>
  </div>
</template>
