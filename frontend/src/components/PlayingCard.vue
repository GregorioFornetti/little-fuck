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
  /** Whether this card is a manilha in the current match. Defaults to the fixed manilha velha manilhas. */
  manilha?: boolean;
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
const manilha = computed(() => props.manilha ?? isManilhaCard(props));
const suited = computed(() => props.label !== undefined && props.suit !== undefined);
const valueSize = computed(() => (props.value >= 100 ? 'text-sm' : props.value >= 10 ? 'text-xl' : 'text-2xl'));
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive ? disabled : undefined"
    class="card-enter flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white px-0.5 text-center font-serif font-bold leading-none shadow-lg"
    :class="[
      manilha ? 'manilha-glow bg-amber-100 ring-4 ring-amber-400' : '',
      !suited && value >= 13 ? 'text-red-700' : '',
      !suited && value < 13 ? 'text-gray-900' : '',
      suited ? '' : valueSize,
      manilha ? (isRedSuit ? 'text-red-700' : 'text-gray-900') : '',
      dimmed ? 'opacity-50' : '',
      interactive && !disabled ? 'hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-300' : '',
      interactive && disabled ? 'cursor-not-allowed' : ''
    ]"
    @click="interactive && emit('click')"
  >
    <span
      v-if="suited"
      class="relative flex h-full w-full flex-col items-center justify-center leading-none"
    >
      <span class="absolute left-1 top-1 flex flex-col items-center text-sm">
        <span>{{ label }}</span>
        <span class="text-xs">{{ suitGlyphs[suit as CardSuit] }}</span>
      </span>
      <span class="text-4xl">{{ suitGlyphs[suit as CardSuit] }}</span>
      <span
        v-if="manilha"
        class="mt-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-amber-700"
      >Manilha</span>
      <span class="absolute bottom-1 right-1 flex rotate-180 flex-col items-center text-sm">
        <span>{{ label }}</span>
        <span class="text-xs">{{ suitGlyphs[suit as CardSuit] }}</span>
      </span>
    </span>
    <span v-else>{{ value }}</span>
  </component>
</template>
