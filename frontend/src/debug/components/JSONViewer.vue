
<script setup lang="ts">

const IDENT_SIZE = 2;

const props = defineProps<{
  json: object
}>();

const jsonToDisplay = JSON.stringify(props.json, null, IDENT_SIZE);
</script>

<template>
  <div class="w-full h-full overflow-auto rounded-lg bg-neutral-800 text-white scroll">
    <pre>{{ jsonToDisplay }}</pre>
  </div>
</template>

<style scoped>
.scroll::-webkit-scrollbar {
  width: 12px;
  height: 12px;
  /* move the scroll to inside the div */
  margin-left: -12px;
}

.scroll::-webkit-scrollbar-track {
  background: black;
  border-radius: 0.5rem;
}

.scroll::-webkit-scrollbar-thumb {
  background: rgb(245 245 244);
  border-radius: 0.5rem;
}
</style>
