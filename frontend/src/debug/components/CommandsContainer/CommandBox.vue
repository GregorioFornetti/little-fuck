
<script setup lang="ts">
defineProps<{
  boxTitle: string,
  btnText: string,
  btnOnClick: () => void
}>();
</script>

<template>
  <fieldset class="w-56 border-2 p-3 rounded-lg flex flex-col justify-between">
    <legend>{{ boxTitle }}</legend>
    <slot />
    <button
      class="w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-1 rounded"
      @click="btnOnClick"
    >
      {{ btnText }}
    </button>
  </fieldset>
</template>
