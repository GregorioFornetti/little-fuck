<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { setLocale, type AvailableLocale } from '@/plugins/i18n';
import { eventsEmitter, lobby } from '@/connection';
import BaseModal from './modal/BaseModal.vue';
import PrimaryModalBtn from './modal/PrimaryModalBtn.vue';
import SecundaryModalBtn from './modal/SecundaryModalBtn.vue';

const { t, locale } = useI18n();

const options: { value: AvailableLocale; label: string }[] = [
  { value: 'pt-BR', label: 'PT' },
  { value: 'en-US', label: 'EN' }
];

const showLeaveModal = ref(false);

const isFullscreen = ref(false);
const syncFullscreen = () => {
  isFullscreen.value = document.fullscreenElement !== null;
};
const toggleFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen may be unavailable (ex: iframe permissions). Nothing to do.
  }
};
onMounted(() => document.addEventListener('fullscreenchange', syncFullscreen));
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', syncFullscreen));

const confirmLeave = () => {
  showLeaveModal.value = false;
  eventsEmitter.general.emitLogout();
};
</script>

<template>
  <header class="w-full border-b border-white/15 bg-black/25">
    <div class="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-3">
        <span
          aria-hidden="true"
          class="flex h-10 w-8 items-center justify-center rounded bg-white font-serif text-lg font-bold text-red-700 shadow"
        >
          16
        </span>
        <div>
          <p class="font-serif text-xl font-bold leading-tight text-white">
            Little Fuck
          </p>
          <p class="text-xs leading-tight text-emerald-100/80">
            {{ t('HOME.TAGLINE') }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          v-if="lobby"
          type="button"
          class="rounded-full border border-red-300/60 px-4 py-1.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 focus:outline-none focus:ring-4 focus:ring-red-300/30"
          @click="showLeaveModal = true"
        >
          {{ t('GAME.LEAVE_GAME') }}
        </button>

        <button
          type="button"
          :aria-pressed="isFullscreen"
          :aria-label="t('HOME.FULLSCREEN')"
          :title="t('HOME.FULLSCREEN')"
          class="rounded-full border border-white/30 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/20"
          @click="toggleFullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
        </button>

        <div
          role="group"
          :aria-label="t('HOME.LANGUAGE')"
          class="flex overflow-hidden rounded-full border border-white/30"
        >
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            :aria-pressed="locale === option.value"
            class="px-4 py-1.5 text-sm font-semibold transition-colors"
            :class="locale === option.value
              ? 'bg-amber-400 text-emerald-950'
              : 'bg-transparent text-white hover:bg-white/10'"
            @click="setLocale(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Leave game confirmation -->
  <BaseModal
    :title="t('GAME.LEAVE_TITLE')"
    :show="showLeaveModal"
    :close-modal="() => { showLeaveModal = false; }"
  >
    <template #body>
      <p class="text-center text-gray-800 dark:text-gray-100">
        {{ t('GAME.LEAVE_TEXT') }}
      </p>
    </template>

    <template #footer>
      <PrimaryModalBtn @click="confirmLeave">
        {{ t('GAME.LEAVE_CONFIRM') }}
      </PrimaryModalBtn>
      <SecundaryModalBtn @click="showLeaveModal = false">
        {{ t('GAME.LEAVE_CANCEL') }}
      </SecundaryModalBtn>
    </template>
  </BaseModal>
</template>
