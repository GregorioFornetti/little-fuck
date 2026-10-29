<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, eventsListenersAdder, lobby } from '@/connection';
import type { GameOptions } from '@/interfaces/Lobby';
import BaseModal from './modal/BaseModal.vue';
import SecundaryModalBtn from './modal/SecundaryModalBtn.vue';
import {
  ALL_POWERUP_TYPES,
  DEFAULT_NUMBERED_CARDS,
  getLobbyOptions,
  groupNumberedCards,
  withCardCount,
  withRenamedCardValue
} from './pages/gameState';

const props = defineProps<{
  show: boolean;
  isLeader: boolean;
  closeModal: () => void;
}>();

const { t } = useI18n();

type OptionsErrorType = 'not-leader' | 'already-in-game' | 'not-in-lobby' | 'invalid-options';

const errorType = ref<OptionsErrorType | null>(null);

const errorMessage = computed(() => {
  if (!errorType.value) return '';
  const messages: Record<OptionsErrorType, string> = {
    'not-leader': t('OPTIONS.ERROR_NOT_LEADER'),
    'already-in-game': t('OPTIONS.ERROR_ALREADY_IN_GAME'),
    'invalid-options': t('OPTIONS.INVALID'),
    'not-in-lobby': t('OPTIONS.ERROR_GENERIC')
  };
  return messages[errorType.value];
});

const options = computed<GameOptions>(() => getLobbyOptions(lobby.value));

const cardTypeDescription = computed(() => {
  const descriptions: Record<GameOptions['cardType'], string> = {
    numbered: t('OPTIONS.CARD_TYPE_NUMBERED_DESC'),
    'manilha-velha': t('OPTIONS.CARD_TYPE_MANILHA_VELHA_DESC'),
    'manilha-nova': t('OPTIONS.CARD_TYPE_MANILHA_NOVA_DESC'),
    'manilha-paraguaia': t('OPTIONS.CARD_TYPE_MANILHA_PARAGUAIA_DESC')
  };
  return descriptions[options.value.cardType];
});

const withCurrent = (choices: number[], current: number) =>
  [...new Set([...choices, current])].sort((a, b) => a - b);

const livesChoices = computed(() =>
  withCurrent(Array.from({ length: 10 }, (_, i) => i + 1), options.value.initialHealth)
);
const actionTimeChoices = computed(() =>
  withCurrent([10, 15, 18, 20, 25, 30, 40, 60], options.value.playerActionTimeSeconds)
);
const roundEndChoices = computed(() =>
  withCurrent([3, 5, 10, 15, 20, 30], options.value.roundEndTimeSeconds)
);

const updateOptions = (patch: Partial<GameOptions>) => {
  if (!props.isLeader) return;
  errorType.value = null;
  eventsEmitter.lobby.emitUpdateOptions({ ...options.value, ...patch });
};

const onLivesChange = (event: Event) => {
  updateOptions({ initialHealth: Number((event.target as HTMLSelectElement).value) });
};
const onActionTimeChange = (event: Event) => {
  updateOptions({ playerActionTimeSeconds: Number((event.target as HTMLSelectElement).value) });
};
const onRoundEndChange = (event: Event) => {
  updateOptions({ roundEndTimeSeconds: Number((event.target as HTMLSelectElement).value) });
};
const onCardTypeChange = (event: Event) => {
  updateOptions({ cardType: (event.target as HTMLSelectElement).value as GameOptions['cardType'] });
};
const onThemeChange = (event: Event) => {
  updateOptions({ theme: (event.target as HTMLSelectElement).value as GameOptions['theme'] });
};
const onCardBackChange = (event: Event) => {
  updateOptions({ cardBack: (event.target as HTMLSelectElement).value as GameOptions['cardBack'] });
};

const powerupConfig = computed(() => options.value.powerups ?? { enabled: [], perGrant: 1, grantTiming: 'match' as const });
const onPowerupToggle = (type: GameOptions['powerups'] extends { enabled: (infer T)[] } ? T : never, event: Event) => {
  const checked = (event.target as HTMLInputElement).checked;
  const enabled = checked
    ? [...powerupConfig.value.enabled, type]
    : powerupConfig.value.enabled.filter((enabledType) => enabledType !== type);
  updateOptions({ powerups: { ...powerupConfig.value, enabled } });
};
const onPowerupsPerGrantChange = (event: Event) => {
  updateOptions({ powerups: { ...powerupConfig.value, perGrant: Number((event.target as HTMLSelectElement).value) } });
};
const onPowerupsTimingChange = (event: Event) => {
  updateOptions({
    powerups: {
      ...powerupConfig.value,
      grantTiming: (event.target as HTMLSelectElement).value as 'match' | 'game'
    }
  });
};

const customCards = computed<number[]>(() => options.value.customCards ?? DEFAULT_NUMBERED_CARDS);
const cardGroups = computed(() => groupNumberedCards(customCards.value));
const playersCount = computed(() => lobby.value?.players.length ?? 0);
const fewerCardsThanPlayers = computed(
  () => options.value.cardType === 'numbered' && customCards.value.length < playersCount.value
);

const readNumberInput = (event: Event, current: number, min: number, max: number): number | null => {
  const input = event.target as HTMLInputElement;
  const value = Number(input.value);
  if (!Number.isInteger(value) || value < min || value > max) {
    input.value = String(current);
    return null;
  }
  return value;
};
const onCardValueChange = (groupValue: number, event: Event) => {
  const value = readNumberInput(event, groupValue, 1, 999);
  if (value === null) return;
  updateOptions({ customCards: withRenamedCardValue(customCards.value, groupValue, value) });
};
const onCardCountChange = (groupValue: number, currentCount: number, event: Event) => {
  const count = readNumberInput(event, currentCount, 1, 500);
  if (count === null) return;
  updateOptions({ customCards: withCardCount(customCards.value, groupValue, count) });
};
const addCard = () => {
  const used = new Set(customCards.value);
  const highest = Math.max(...customCards.value);
  let value = highest < 999 ? highest + 1 : 1;
  while (used.has(value) && value < 999) value++;
  if (used.has(value)) return;
  updateOptions({ customCards: [...customCards.value, value] });
};
const removeCardGroup = (groupValue: number) => {
  if (cardGroups.value.length <= 1) return;
  updateOptions({ customCards: customCards.value.filter((value) => value !== groupValue) });
};

eventsListenersAdder.lobby.optionsError((type: OptionsErrorType) => {
  errorType.value = type;
});

onBeforeUnmount(() => {
  errorType.value = null;
});
</script>

<template>
  <BaseModal
    :title="t('OPTIONS.TITLE')"
    :show="show"
    :close-modal="closeModal"
  >
    <template #body>
      <div class="space-y-4 text-left">
        <p
          v-if="!isLeader"
          class="rounded bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
        >
          {{ t('OPTIONS.LEADER_ONLY') }}
        </p>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.INITIAL_LIVES') }}
          </span>
          <select
            :value="options.initialHealth"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onLivesChange"
          >
            <option
              v-for="value in livesChoices"
              :key="value"
              :value="value"
            >
              {{ value }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.ACTION_TIME') }}
          </span>
          <select
            :value="options.playerActionTimeSeconds"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onActionTimeChange"
          >
            <option
              v-for="value in actionTimeChoices"
              :key="value"
              :value="value"
            >
              {{ value }}s
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.ROUND_END_TIME') }}
          </span>
          <select
            :value="options.roundEndTimeSeconds"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onRoundEndChange"
          >
            <option
              v-for="value in roundEndChoices"
              :key="value"
              :value="value"
            >
              {{ value }}s
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.CARD_TYPE') }}
          </span>
          <select
            :value="options.cardType"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onCardTypeChange"
          >
            <option value="numbered">
              {{ t('OPTIONS.CARD_TYPE_NUMBERED') }}
            </option>
            <option value="manilha-velha">
              {{ t('OPTIONS.CARD_TYPE_MANILHA_VELHA') }}
            </option>
            <option value="manilha-nova">
              {{ t('OPTIONS.CARD_TYPE_MANILHA_NOVA') }}
            </option>
            <option value="manilha-paraguaia">
              {{ t('OPTIONS.CARD_TYPE_MANILHA_PARAGUAIA') }}
            </option>
          </select>
          <span class="mt-1 block text-sm text-gray-500 dark:text-gray-400">
            {{ cardTypeDescription }}
          </span>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.THEME') }}
          </span>
          <select
            :value="options.theme ?? 'classic'"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onThemeChange"
          >
            <option value="classic">
              {{ t('OPTIONS.THEME_CLASSIC') }}
            </option>
            <option value="midnight">
              {{ t('OPTIONS.THEME_MIDNIGHT') }}
            </option>
            <option value="wine">
              {{ t('OPTIONS.THEME_WINE') }}
            </option>
            <option value="charcoal">
              {{ t('OPTIONS.THEME_CHARCOAL') }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.CARD_BACK') }}
          </span>
          <select
            :value="options.cardBack ?? 'classic'"
            :disabled="!isLeader"
            class="w-full rounded border border-gray-300 px-3 py-2 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            @change="onCardBackChange"
          >
            <option value="classic">
              {{ t('OPTIONS.CARD_BACK_CLASSIC') }}
            </option>
            <option value="stripes">
              {{ t('OPTIONS.CARD_BACK_STRIPES') }}
            </option>
            <option value="lozenges">
              {{ t('OPTIONS.CARD_BACK_LOZENGES') }}
            </option>
            <option value="dots">
              {{ t('OPTIONS.CARD_BACK_DOTS') }}
            </option>
          </select>
        </label>

        <div v-if="options.cardType === 'numbered'">
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.CARDS_TITLE') }}
          </span>
          <p
            v-if="fewerCardsThanPlayers"
            role="alert"
            class="mb-2 rounded bg-red-100 px-3 py-2 text-sm font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-200"
          >
            {{ t('OPTIONS.CARDS_FEWER_THAN_PLAYERS', { cards: customCards.length, players: playersCount }) }}
          </p>
          <ul class="max-h-64 space-y-2 overflow-y-auto pr-1">
            <li
              v-for="group in cardGroups"
              :key="group.value"
              class="flex items-center justify-between gap-2 rounded border border-gray-300 px-2 py-2 dark:border-gray-600"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-16 w-12 shrink-0 items-center justify-center rounded-md bg-white shadow">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    :value="group.value"
                    :disabled="!isLeader"
                    :aria-label="t('OPTIONS.CARD_VALUE')"
                    class="w-full bg-transparent px-0.5 text-center font-serif text-base font-bold text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    @change="onCardValueChange(group.value, $event)"
                  >
                </div>
                <label class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  ×
                  <input
                    type="number"
                    min="1"
                    max="500"
                    :value="group.count"
                    :disabled="!isLeader"
                    :aria-label="t('OPTIONS.CARD_COUNT')"
                    class="w-16 rounded border border-gray-300 px-1 py-0.5 text-center text-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    @change="onCardCountChange(group.value, group.count, $event)"
                  >
                  {{ t('OPTIONS.CARDS') }}
                </label>
              </div>
              <button
                v-if="isLeader && cardGroups.length > 1"
                type="button"
                :aria-label="t('OPTIONS.REMOVE_CARD')"
                class="rounded p-2 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 dark:text-red-400 dark:hover:bg-red-900/40"
                @click="removeCardGroup(group.value)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                  />
                </svg>
              </button>
            </li>
          </ul>
          <button
            v-if="isLeader"
            type="button"
            class="mt-2 w-full rounded border border-dashed border-gray-400 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-800"
            @click="addCard"
          >
            {{ t('OPTIONS.ADD_CARD') }}
          </button>
        </div>

        <div>
          <span class="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ t('OPTIONS.POWERUPS_TITLE') }}
          </span>
          <ul class="space-y-1.5">
            <li
              v-for="powerupType in ALL_POWERUP_TYPES"
              :key="powerupType"
            >
              <label class="flex cursor-pointer items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  :checked="powerupConfig.enabled.includes(powerupType)"
                  :disabled="!isLeader"
                  class="mt-0.5"
                  @change="onPowerupToggle(powerupType, $event)"
                >
                <span>
                  <span class="font-semibold">{{ t(`POWERUPS.${powerupType}`) }}</span>
                  <span class="block text-xs text-gray-500 dark:text-gray-400">{{ t(`POWERUPS.${powerupType}_DESC`) }}</span>
                </span>
              </label>
            </li>
          </ul>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
                {{ t('OPTIONS.POWERUPS_PER_GRANT') }}
              </span>
              <select
                :value="powerupConfig.perGrant"
                :disabled="!isLeader || powerupConfig.enabled.length === 0"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                @change="onPowerupsPerGrantChange"
              >
                <option
                  v-for="n in [1, 2, 3, 4, 5]"
                  :key="n"
                  :value="n"
                >
                  {{ n }}
                </option>
              </select>
            </label>
            <label class="block">
              <span class="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">
                {{ t('OPTIONS.POWERUPS_TIMING') }}
              </span>
              <select
                :value="powerupConfig.grantTiming"
                :disabled="!isLeader || powerupConfig.enabled.length === 0"
                class="w-full rounded border border-gray-300 px-2 py-1.5 text-gray-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                @change="onPowerupsTimingChange"
              >
                <option value="match">
                  {{ t('OPTIONS.POWERUPS_TIMING_MATCH') }}
                </option>
                <option value="game">
                  {{ t('OPTIONS.POWERUPS_TIMING_GAME') }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('OPTIONS.APPLIES_BEFORE_START') }}
        </p>
        <p
          v-if="errorType"
          role="alert"
          class="text-center font-semibold text-red-600 dark:text-red-400"
        >
          {{ errorMessage }}
        </p>
      </div>
    </template>

    <template #footer>
      <SecundaryModalBtn @click="closeModal">
        {{ t('OPTIONS.CLOSE') }}
      </SecundaryModalBtn>
    </template>
  </BaseModal>
</template>
