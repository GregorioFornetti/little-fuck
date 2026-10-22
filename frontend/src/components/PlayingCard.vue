<script setup lang="ts">
import { computed } from 'vue';
import type { CardSuit } from '@/interfaces/Lobby';
import { isManilhaCard } from './pages/gameState';

const props = defineProps<{
  value: number;
  /** Rank label (4, 5, 6, 7, Q, J, K, A, 2, 3) for manilha velha cards. Numbered cards show `value` instead. */
  label?: string;
  /** Suit for manilha velha cards. */
  suit?: CardSuit;
  /** Cards 13-16 are the trumps (manilhas), shown in red. */
  interactive?: boolean;
  disabled?: boolean;
  dimmed?: boolean;
}>();

const emit = defineEmits(['click']);

const suitGlyphs: Record<CardSuit, string> = {
  clubs: '♣',
  hearts: '♥',
  spades: '♠',
  diamonds: '♦'
};

const isRedSuit = computed(() => props.suit === 'hearts' || props.suit === 'diamonds');
const manilha = computed(() => isManilhaCard(props));
const suited = computed(() => props.label !== undefined && props.suit !== undefined);
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive ? disabled : undefined"
    class="flex h-24 w-16 shrink-0 items-center justify-center rounded-md bg-white font-serif text-2xl font-bold shadow-lg"
    :class="[
      manilha ? 'bg-amber-100 ring-4 ring-amber-400' : '',
      !suited && value >= 13 ? 'text-red-700' : '',
      !suited && value < 13 ? 'text-gray-900' : '',
      suited && !manilha ? (isRedSuit ? 'text-red-700' : 'text-gray-900') : '',
      manilha ? (isRedSuit ? 'text-red-700' : 'text-gray-900') : '',
      dimmed ? 'opacity-50' : '',
      interactive && !disabled ? 'hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-300' : '',
      interactive && disabled ? 'cursor-not-allowed' : ''
    ]"
    @click="interactive && emit('click')"
  >
    <span
      v-if="suited"
      class="flex flex-col items-center leading-none"
    >
      <span>{{ label }}</span>
      <span class="text-xl">{{ suitGlyphs[suit as CardSuit] }}</span>
      <span
        v-if="manilha"
        class="mt-1 font-sans text-[9px] font-bold uppercase tracking-wide text-amber-700"
      >Manilha</span>
    </span>
    <span v-else>{{ value }}</span>
  </component>
</template>
