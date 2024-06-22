<script setup lang="ts">
const model = defineModel<string>();

defineProps<{
  label: string
}>();
</script>

<template>
  <div>
    <label
      :for="label"
      class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      {{ label }}
    </label>
    <input
      v-model="model"
      type="text"
      :name="label"
      class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
    >
  </div>
</template>
