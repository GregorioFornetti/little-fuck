<script setup lang="ts">
defineProps<{
  value: number;
  /** Cards 13-16 are the trumps (manilhas), shown in red. */
  interactive?: boolean;
  disabled?: boolean;
  dimmed?: boolean;
}>();

const emit = defineEmits(['click']);
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive ? disabled : undefined"
    class="flex h-24 w-16 shrink-0 items-center justify-center rounded-md bg-white font-serif text-2xl font-bold shadow-lg"
    :class="[
      value >= 13 ? 'text-red-700' : 'text-gray-900',
      dimmed ? 'opacity-50' : '',
      interactive && !disabled ? 'hover:bg-amber-100 focus:outline-none focus:ring-4 focus:ring-amber-300' : '',
      interactive && disabled ? 'cursor-not-allowed' : ''
    ]"
    @click="interactive && emit('click')"
  >
    {{ value }}
  </component>
</template>
