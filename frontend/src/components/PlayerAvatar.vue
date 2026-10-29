<script setup lang="ts">
withDefaults(defineProps<{
  emote?: string,
  color?: string,
  size?: 'sm' | 'md' | 'lg'
}>(), {
  emote: '🦊',
  color: '#2a9d8f',
  size: 'md'
});
</script>

<template>
  <span
    class="player-avatar"
    :class="`player-avatar-${size}`"
    :style="{ backgroundColor: color }"
    aria-hidden="true"
  >{{ emote }}</span>
</template>

<style scoped>
.player-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.65);
  line-height: 1;
  flex: none;
}
.player-avatar-sm { width: 1.75rem; height: 1.75rem; font-size: 1rem; }
.player-avatar-md { width: 2.25rem; height: 2.25rem; font-size: 1.25rem; }
.player-avatar-lg { width: 3rem; height: 3rem; font-size: 1.75rem; }
</style>
