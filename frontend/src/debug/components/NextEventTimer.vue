
<script setup lang="ts">
import clockImage from '@/assets/clock.png';

defineProps<{
  nextEventTime: number,
  nextEventName: string,
}>();

</script>

<template>
  <div class="flex flex-col border-solid border-2 rounded-xl justify-center items-center w-full h-full">
    <div class="component-container">
      <div class="clock-container">
        <img
          :src="clockImage"
          alt="Clock"
          class="clock-image"
        >
        <div class="clock-number">
          {{ nextEventTime }}
        </div>
      </div>
    </div>
    <p class="text-lg text-center">
      {{ nextEventName }}
    </p>
  </div>
</template>

<style scoped>
.component-container {
  width: 100px;
}

.clock-container {
  position: relative;
  width: 100%;
}

.clock-image {
  display: block;
  width: 100%;
  height: auto;
}

.clock-number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 32px;
  font-weight: bold;
}
</style>
