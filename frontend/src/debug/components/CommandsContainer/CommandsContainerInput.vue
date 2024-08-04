
<script setup lang="ts">
defineProps<{
  inputType: string,
  placeholder: string
}>();

import { ref } from 'vue';

const value = ref('');
</script>

<template>
  <input
    v-model="value"
    class="w-full border-2 p-1 rounded-lg mb-3"
    :placeholder="placeholder"
    :type="inputType"
  >
</template>
