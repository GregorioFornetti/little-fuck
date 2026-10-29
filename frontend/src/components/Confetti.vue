<script setup lang="ts">
import { ref } from 'vue';

interface ConfettiPiece {
  left: string;
  delay: string;
  duration: string;
  color: string;
  width: string;
  height: string;
  borderRadius: string;
}

const COLORS = ['#fbbf24', '#34d399', '#f8fafc', '#f87171', '#fde68a'];

const pieces = ref<ConfettiPiece[]>(
  Array.from({ length: 90 }, (_, index) => ({
    left: `${(index * 37.7) % 100}%`,
    delay: `${((index * 13) % 20) / 10}s`,
    duration: `${2.6 + ((index * 7) % 14) / 10}s`,
    color: COLORS[index % COLORS.length],
    width: `${6 + (index % 3) * 3}px`,
    height: `${8 + (index % 4) * 3}px`,
    borderRadius: index % 3 === 0 ? '50%' : '2px'
  }))
);
</script>

<template>
  <div
    class="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    aria-hidden="true"
  >
    <span
      v-for="(piece, index) in pieces"
      :key="index"
      class="confetti-piece absolute top-0"
      :style="{
        left: piece.left,
        width: piece.width,
        height: piece.height,
        backgroundColor: piece.color,
        borderRadius: piece.borderRadius,
        animationDelay: piece.delay,
        animationDuration: piece.duration
      }"
    />
  </div>
</template>
