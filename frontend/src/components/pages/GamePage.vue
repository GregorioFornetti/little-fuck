<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { eventsEmitter, eventsListenersAdder, lobby, peekedCard, playerId, playerPowerups } from '@/connection';
import PlayerAvatar from '../PlayerAvatar.vue';
import AppHeader from '../AppHeader.vue';
import PlayingCard from '../PlayingCard.vue';
import RoundTable from '../RoundTable.vue';
import GameHistoryPanel from '../GameHistoryPanel.vue';
import { findCurrentPlayer } from './lobbyReady';
import {
  getCountdownKey,
  getLobbyOptions,
  getTableThemeClass,
  getCardBackClass,
  getCountdownSeconds,
  getForbiddenGuess,
  getGamePhase,
  getTurnPlayerId,
  getManilhaMode,
  getManilhaNovaRank,
  getManilhaRankBelow,
  isManilhaInRound,
  isSpecialMatch
} from './gameState';
import type { PowerupType, RoundCard } from '@/interfaces/Lobby';
import { playCardSound, playRoundLoseSound, playRoundWinSound, unlockAudio } from '@/sound';

const { t } = useI18n();

const game = computed(() => lobby.value?.game);
const themeClass = computed(() => getTableThemeClass(getLobbyOptions(lobby.value).theme));
const cardBackClass = computed(() => getCardBackClass(getLobbyOptions(lobby.value)));

const fanStyle = (index: number, count: number) => {
  const offset = index - (count - 1) / 2;
  return {
    transform: 'rotate(' + offset * 5 + 'deg) translateY(' + Math.abs(offset) * 4 + 'px)',
    zIndex: index
  };
};

// Hearts crack briefly on the player who just lost a life.
const recentlyLostLife = ref<Set<string>>(new Set());
const previousHealth = ref<Record<string, number>>({});
watch(
  () => game.value?.playersHealth,
  (health) => {
    if (!health) return;
    for (const [id, value] of Object.entries(health)) {
      const previous = previousHealth.value[id];
      if (previous !== undefined && value < previous && !recentlyLostLife.value.has(id)) {
        recentlyLostLife.value = new Set(recentlyLostLife.value).add(id);
        setTimeout(() => {
          const next = new Set(recentlyLostLife.value);
          next.delete(id);
          recentlyLostLife.value = next;
        }, 1300);
      }
    }
    previousHealth.value = { ...health };
  },
  { deep: true }
);
const match = computed(() => game.value?.match);
const phase = computed(() => getGamePhase(game.value));
const special = computed(() => isSpecialMatch(match.value));

const currentPlayer = computed(() =>
  lobby.value ? findCurrentPlayer(lobby.value.players, playerId) : undefined
);
const turnPlayerId = computed(() => getTurnPlayerId(game.value));
const turnPlayerName = computed(() =>
  lobby.value?.players.find((player) => player.id === turnPlayerId.value)?.name ?? ''
);
const isMyTurn = computed(
  () => currentPlayer.value !== undefined && turnPlayerId.value === currentPlayer.value.id
);

// Countdown to the next automatic action.
// The backend does not send the remaining time.
// The window restarts locally whenever the game state shows the backend restarted its timer.
const lastRound = computed(() => game.value?.lastRound);
const lastRoundWinnerName = computed(() =>
  lastRound.value ? playerName(lastRound.value.winnerId) : ''
);

const now = ref(Date.now());
const deadline = ref(Date.now());
const windowSeconds = ref(
  getCountdownSeconds(phase.value, turnPlayerId.value, lastRound.value !== undefined, getLobbyOptions(lobby.value))
);
const countdownKey = computed(() => getCountdownKey(game.value));

watch(countdownKey, () => {
  windowSeconds.value = getCountdownSeconds(phase.value, turnPlayerId.value, lastRound.value !== undefined, getLobbyOptions(lobby.value));
  now.value = Date.now();
  deadline.value = now.value + windowSeconds.value * 1000;
}, { immediate: true });

const secondsLeft = computed(() =>
  Math.max(0, Math.ceil((deadline.value - now.value) / 1000))
);
const progressPercent = computed(() =>
  Math.max(0, Math.min(100, ((deadline.value - now.value) / (windowSeconds.value * 1000)) * 100))
);

// Frame-rate updates so the progress bar drains smoothly.
// The deadline is timestamp-based, so the countdown stays correct even if frames are dropped.
let animationFrame: number | undefined;
const tick = () => {
  now.value = Date.now();
  animationFrame = requestAnimationFrame(tick);
};
onMounted(() => {
  animationFrame = requestAnimationFrame(tick);
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
});
onBeforeUnmount(() => {
  if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
});

// Power-ups: grouped counts of what the player holds, targeting and errors.
const TARGETED_POWERUPS: PowerupType[] = ['swap-cards', 'hide-card-strength', 'increase-card-strength', 'decrease-card-strength', 'peek-card'];
const groupedPowerups = computed(() =>
  (Object.entries(
    playerPowerups.value.reduce<Record<string, number>>((counts, type) => {
      counts[type] = (counts[type] ?? 0) + 1;
      return counts;
    }, {})
  ) as [PowerupType, number][]).map(([type, count]) => ({ type, count }))
);
const targetingPowerup = ref<PowerupType | null>(null);
const powerupErrorMessage = ref('');
let powerupErrorTimer: ReturnType<typeof setTimeout> | undefined;
eventsListenersAdder.powerup.powerupError((type) => {
  powerupErrorMessage.value = t(`POWERUPS.ERROR.${type}`);
  if (powerupErrorTimer) clearTimeout(powerupErrorTimer);
  powerupErrorTimer = setTimeout(() => { powerupErrorMessage.value = ''; }, 4000);
});

const canUsePowerup = (type: PowerupType): boolean => {
  const round = match.value?.round;
  switch (type) {
    case 'swap-cards':
      return phase.value === 'guessing';
    case 'cancel-card':
      return phase.value === 'round' && !!round?.nextPlayerId && round.nextPlayerId !== currentPlayer.value?.id;
    case 'reverse-card-strengths':
      return phase.value === 'round' && !round?.reversed;
    case 'random-card':
      return phase.value === 'round' && !!round?.nextPlayerId;
    case 'hide-card-strength':
      return phase.value === 'round' && tableCards.value.length > 0;
    case 'increase-card-strength':
    case 'decrease-card-strength':
      return phase.value === 'guessing' || phase.value === 'round';
    case 'peek-card':
      return (phase.value === 'guessing' || phase.value === 'round') && (match.value?.numRounds ?? 0) > 1;
    case 'shield':
      // Passive: it triggers on its own when the player would lose a life.
      return false;
    default:
      return false;
  }
};

const targetCandidates = computed(() => {
  const type = targetingPowerup.value;
  if (!type || !match.value) return [];
  const myId = currentPlayer.value?.id;
  if (type === 'swap-cards') {
    return lobby.value?.players.filter((p) => p.id !== myId && match.value!.players[p.id]) ?? [];
  }
  if (type === 'peek-card') {
    return lobby.value?.players.filter((p) => p.id !== myId && match.value!.players[p.id]) ?? [];
  }
  if (type === 'hide-card-strength') {
    const ownerIds = new Set(tableCards.value.map((roundCard) => roundCard.playerId));
    return lobby.value?.players.filter((p) => ownerIds.has(p.id)) ?? [];
  }
  return lobby.value?.players.filter((p) => match.value!.players[p.id]) ?? [];
});

const onPowerupClick = (type: PowerupType) => {
  if (!canUsePowerup(type)) return;
  if (TARGETED_POWERUPS.includes(type)) {
    targetingPowerup.value = targetingPowerup.value === type ? null : type;
    return;
  }
  eventsEmitter.powerup.emitUsePowerup(type);
};

const useTargetedPowerup = (targetPlayerId: string) => {
  if (!targetingPowerup.value) return;
  eventsEmitter.powerup.emitUsePowerup(targetingPowerup.value, targetPlayerId);
  targetingPowerup.value = null;
};
// Sound effects: a card landing on the table, and winning/losing a round.
const tableCardCount = computed(() => {
  const cards = match.value?.round?.cards;
  return cards ? cards.onMatch.length + cards.anulledCards.length : 0;
});
let lastTableCardCount = 0;
watch(tableCardCount, (count) => {
  if (count > lastTableCardCount) {
    playCardSound();
  }
  lastTableCardCount = count;
});
watch(lastRound, (finished) => {
  if (!finished || finished.points === 0) return;
  if (finished.winnerId === currentPlayer.value?.id) {
    playRoundWinSound();
  } else {
    playRoundLoseSound();
  }
});

const guessOptions = computed(() =>
  match.value ? Array.from({ length: match.value.numRounds + 1 }, (_, n) => n) : []
);
const forbiddenGuess = computed(() =>
  match.value ? getForbiddenGuess(match.value, currentPlayer.value?.id) : null
);

const playerName = (playerId: string) =>
  lobby.value?.players.find((player) => player.id === playerId)?.name ?? playerId;

const healthOf = (playerId: string) => game.value?.playersHealth[playerId] ?? 0;
const hearts = (playerId: string) => '♥'.repeat(Math.max(0, healthOf(playerId)));

const tableCards = computed<RoundCard[]>(() => match.value?.round?.cards.onMatch ?? []);
const manilhaRank = computed(() => getManilhaNovaRank(match.value?.turnedCard?.label));
const manilhaRankBelow = computed(() => getManilhaRankBelow(match.value?.turnedCard?.label));
const cardType = computed(() => getLobbyOptions(lobby.value).cardType);
const isParaguaia = computed(() => cardType.value === 'manilha-paraguaia');

// Which cards are manilhas depends on the round (manilha paraguaia rotates every round).
const manilhaOf = (card: { label?: string; suit?: string }, roundNumber = game.value?.roundNumber ?? 1) =>
  isManilhaInRound(card, getManilhaMode(cardType.value, match.value?.turnedCard, roundNumber), match.value?.turnedCard);
const finishedRoundNumber = computed(() => {
  const round = game.value?.roundNumber ?? 1;
  return round === 1 ? (match.value?.numRounds ?? 1) : round - 1;
});
const lastRoundManilhaOf = (card: { label?: string; suit?: string }) => manilhaOf(card, finishedRoundNumber.value);
const manilhaPanelText = computed(() => {
  if (!match.value?.turnedCard) return '';
  const displayRound = lastRound.value ? finishedRoundNumber.value : (game.value?.roundNumber ?? 1);
  const mode = getManilhaMode(cardType.value, match.value.turnedCard, displayRound);
  if (!isParaguaia.value) return t('GAME.MANILHAS_ARE', { rank: manilhaRank.value });
  if (mode === 'above') return t('GAME.MANILHAS_ROUND_ABOVE', { rank: manilhaRank.value });
  if (mode === 'below') return t('GAME.MANILHAS_ROUND_BELOW', { rank: manilhaRankBelow.value });
  return t('GAME.MANILHAS_ROUND_FIXED');
});

const makeGuess = (numWins: number) => {
  if (!isMyTurn.value || phase.value !== 'guessing' || numWins === forbiddenGuess.value) return;
  eventsEmitter.match.emitWinRoundsNumberResponse(numWins);
};

const playCard = (cardIndex: number) => {
  if (!isMyTurn.value || phase.value !== 'round' || special.value) return;
  eventsEmitter.round.emitSelectCard(cardIndex);
};
</script>

<template>
  <div
    v-if="lobby && game"
    :class="['card-table flex min-h-screen w-screen flex-col text-white', themeClass]"
  >
    <AppHeader />

    <main class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:flex-row lg:gap-8">
      <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h1 class="font-serif text-3xl font-bold">
          {{ t('GAME.MATCH', { n: game.matchNumber }) }}
        </h1>
        <p
          v-if="match"
          class="text-emerald-100/80"
        >
          {{ t('GAME.ROUND', { n: game.roundNumber }) }} · {{ match.numRounds }}
          {{ t('GAME.CARDS_LABEL') }}
        </p>
      </div>
      <p
        v-if="special"
        class="mt-1 font-semibold text-amber-300"
      >
        {{ t('GAME.SPECIAL_MATCH') }}
      </p>

      <!-- Flipped card (manilha nova): the same for every player in this match -->
      <section
        v-if="match?.turnedCard"
        class="mt-4 flex items-center gap-4 rounded-lg bg-black/25 px-4 py-3"
      >
        <PlayingCard
          :value="match.turnedCard.value"
          :label="match.turnedCard.label"
          :suit="match.turnedCard.suit"
          :manilha="false"
        />
        <div>
          <h2 class="font-serif text-lg font-bold">
            {{ t('GAME.TURNED_CARD') }}
          </h2>
          <p class="text-sm text-emerald-100/80">
            {{ manilhaPanelText }}
          </p>
        </div>
      </section>

      <!-- Countdown to the next automatic action -->
      <div class="mt-4">
        <p
          role="timer"
          class="text-sm font-semibold"
          :class="isMyTurn ? 'text-amber-300' : 'text-emerald-100/80'"
        >
          {{ t('GAME.TIME_REMAINING', { seconds: secondsLeft }) }}
        </p>
        <div
          role="progressbar"
          :aria-valuenow="secondsLeft"
          aria-valuemin="0"
          :aria-valuemax="windowSeconds"
          :aria-label="t('GAME.TIME_REMAINING', { seconds: secondsLeft })"
          class="mt-1 h-2 overflow-hidden rounded-full bg-white/15"
        >
          <div
            class="h-full rounded-full"
            :class="secondsLeft <= 5 ? 'bg-red-400' : 'bg-amber-400'"
            :style="{ width: `${progressPercent}%` }"
          />
        </div>
      </div>

      <!-- Match summary: guesses, rounds won and lives change of the last finished match -->
      <section
        v-if="phase === 'waiting-match' && game.lastMatchSummary"
        class="mt-6 rounded-lg bg-black/25 px-4 py-3"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.MATCH_SUMMARY') }}
        </h2>
        <ul class="mt-2 divide-y divide-white/10">
          <li
            v-for="row in game.lastMatchSummary"
            :key="row.playerId"
            class="flex flex-wrap items-center gap-x-3 gap-y-0.5 py-1.5 text-sm"
          >
            <span class="font-semibold">{{ playerName(row.playerId) }}</span>
            <span class="text-emerald-100/80">{{ t('GAME.SUMMARY_GUESS') }}: {{ row.guessed }}</span>
            <span class="text-emerald-100/80">{{ t('GAME.SUMMARY_WON') }}: {{ row.won }}</span>
            <span
              v-if="row.won === row.guessed"
              class="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-200"
            >
              {{ t('GAME.EXACT_GUESS') }}
            </span>
            <span
              class="ml-auto font-semibold"
              :class="row.healthDelta < 0 ? 'text-red-300' : 'text-emerald-200'"
            >
              {{ row.healthDelta > 0 ? '+' : '' }}{{ row.healthDelta }} {{ t('GAME.SUMMARY_LIVES') }}
            </span>
          </li>
        </ul>
      </section>
      <!-- Power-ups the player holds -->
      <section
        v-if="groupedPowerups.length > 0"
        class="mt-6 rounded-lg bg-black/25 px-4 py-3"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('POWERUPS.TITLE') }}
        </h2>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="powerup in groupedPowerups"
            :key="powerup.type"
            type="button"
            :disabled="!canUsePowerup(powerup.type)"
            :title="t(`POWERUPS.${powerup.type}_DESC`)"
            class="rounded-full px-4 py-1.5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-amber-200/50 disabled:cursor-not-allowed disabled:opacity-40"
            :class="targetingPowerup === powerup.type
              ? 'bg-amber-300 text-emerald-950 ring-2 ring-white'
              : 'bg-amber-400 text-emerald-950 hover:bg-amber-300'"
            @click="onPowerupClick(powerup.type)"
          >
            {{ t(`POWERUPS.${powerup.type}`) }} ×{{ powerup.count }}
          </button>
        </div>
        <div
          v-if="targetingPowerup"
          class="mt-3"
        >
          <p class="text-sm font-semibold text-amber-200">
            {{ t('POWERUPS.CHOOSE_TARGET') }}: {{ t(`POWERUPS.${targetingPowerup}`) }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              v-for="target in targetCandidates"
              :key="target.id"
              type="button"
              class="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50"
              @click="useTargetedPowerup(target.id)"
            >
              {{ target.name }}
            </button>
            <button
              type="button"
              class="rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-100/80 underline hover:text-white"
              @click="targetingPowerup = null"
            >
              {{ t('POWERUPS.CANCEL_TARGETING') }}
            </button>
          </div>
        </div>
        <p
          v-if="powerupErrorMessage"
          role="alert"
          class="mt-2 text-sm font-semibold text-red-300"
        >
          {{ powerupErrorMessage }}
        </p>
      </section>

      <section
        v-if="peekedCard"
        class="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-black/25 px-4 py-3"
      >
        <p class="font-semibold text-amber-200">
          {{ t('POWERUPS.PEEKED', { name: playerName(peekedCard.targetPlayerId) }) }}
        </p>
        <PlayingCard :card="peekedCard.card" />
        <button
          type="button"
          class="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/50"
          @click="peekedCard = null"
        >
          {{ t('POWERUPS.PEEK_CLOSE') }}
        </button>
      </section>

      <!-- Players -->
      <section class="mt-6">
        <ul class="grid gap-3 sm:grid-cols-2">
          <li
            v-for="player in lobby.players"
            :key="player.id"
            class="rounded-lg bg-black/25 px-4 py-3"
            :class="[
              turnPlayerId === player.id ? 'ring-2 ring-amber-300' : '',
              healthOf(player.id) <= 0 ? 'opacity-50' : ''
            ]"
          >
            <div class="flex flex-wrap items-center gap-2">
              <PlayerAvatar :emote="player.emote" :color="player.color" size="sm" />
              <span class="font-semibold">{{ player.name }}</span>
              <span
                v-if="player.id === currentPlayer?.id"
                class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
              >
                {{ t('LOBBY.YOU') }}
              </span>
              <span
                v-if="player.leader"
                class="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-emerald-950"
              >
                {{ t('LOBBY.LEADER') }}
              </span>
              <span
                v-if="player.bot"
                class="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-emerald-100"
              >
                {{ t('LOBBY.BOT') }}
              </span>
              <span
                v-if="healthOf(player.id) <= 0"
                class="rounded-full bg-red-900/60 px-2 py-0.5 text-xs font-semibold text-red-200"
              >
                {{ t('GAME.ELIMINATED') }}
              </span>
            </div>
            <p class="mt-1 text-sm">
              <span class="text-red-400"><span v-for="n in Math.max(0, healthOf(player.id))" :key="n">♥</span><span v-if="recentlyLostLife.has(player.id)" class="heart-break text-red-300">♥</span></span>
              <span class="ml-1 text-emerald-100/80">{{ healthOf(player.id) }} {{ t('GAME.LIVES') }}</span>
            </p>
            <p
              v-if="match?.players[player.id]"
              class="mt-1 text-sm text-emerald-100/80"
            >
              {{ t('GAME.GUESS_LABEL') }}:
              <span
                v-if="match.players[player.id].numWinsNeeded !== undefined"
                :key="match.players[player.id].numWinsNeeded"
                class="guess-pop font-bold text-white"
              >{{ match.players[player.id].numWinsNeeded }}</span>
              <template v-else>{{ t('GAME.GUESS_PENDING') }}</template>
              · {{ t('GAME.WON_LABEL') }}: {{ match.players[player.id].numWonRounds }}
              · {{ t('GAME.CARDS_LABEL') }}: {{ match.players[player.id].numCards }} <span v-if="match.pendingStrength?.[player.id]" class="ml-1 rounded-full bg-red-400/25 px-2 py-0.5 text-xs font-bold text-red-200">{{ t('POWERUPS.PENDING', { delta: (match.pendingStrength[player.id] > 0 ? '+' : '') + match.pendingStrength[player.id] }) }}</span>
            </p>
          </li>
        </ul>
      </section>

      <!-- Waiting for the next match (final table of the last round stays visible) -->
      <section
        v-if="phase === 'waiting-match'"
        class="mt-8"
      >
        <div v-if="lastRound">
          <h2 class="font-serif text-xl font-bold">
            {{ t('GAME.LAST_ROUND') }}
          </h2>
          <p class="mt-1 font-semibold text-amber-300">
            {{ lastRound.points > 0
              ? t('GAME.ROUND_WINNER', { name: lastRoundWinnerName })
              : t('GAME.ROUND_TIE') }}
          </p>
          <RoundTable
            :cards="lastRound.cards"
             :winner-id="lastRound.points > 0 ? lastRound.winnerId : undefined"
            :manilha-of="lastRoundManilhaOf"
          />
        </div>
        <p
          role="status"
          class="mt-4 rounded-lg bg-black/25 px-4 py-3 font-semibold text-emerald-200"
        >
          {{ t('GAME.WAITING_MATCH') }}
        </p>
      </section>

      <!-- Guessing -->
      <section
        v-else-if="phase === 'guessing'"
        class="mt-8 rounded-lg bg-black/25 p-4"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.GUESS_TITLE') }}
        </h2>
        <template v-if="isMyTurn">
          <p class="mt-1 text-emerald-100/80">
            {{ t('GAME.GUESS_PROMPT') }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="n in guessOptions"
              :key="n"
              type="button"
              :disabled="n === forbiddenGuess"
              class="h-12 w-12 rounded-full bg-amber-400 font-serif text-lg font-bold text-emerald-950 hover:bg-amber-300 focus:outline-none focus:ring-4 focus:ring-amber-200/60 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
              @click="makeGuess(n)"
            >
              {{ n }}
            </button>
          </div>
          <p
            v-if="forbiddenGuess !== null"
            class="mt-3 text-sm text-amber-200"
          >
            {{ t('GAME.FORBIDDEN_GUESS', { n: forbiddenGuess }) }}
          </p>
        </template>
        <p
          v-else
          class="mt-1 text-emerald-100/80"
        >
          {{ t('GAME.WAITING_GUESS', { name: turnPlayerName }) }}
        </p>
      </section>

      <!-- Between rounds: show the final table and who won before the next round -->
      <section
        v-else-if="phase === 'transition'"
        class="mt-8"
      >
        <template v-if="lastRound">
          <h2 class="font-serif text-xl font-bold">
            {{ t('GAME.LAST_ROUND') }}
          </h2>
          <p class="mt-1 font-semibold text-amber-300">
            {{ lastRound.points > 0
              ? t('GAME.ROUND_WINNER', { name: lastRoundWinnerName })
              : t('GAME.ROUND_TIE') }}
          </p>
          <RoundTable
            :cards="lastRound.cards"
             :winner-id="lastRound.points > 0 ? lastRound.winnerId : undefined"
            :manilha-of="lastRoundManilhaOf"
          />
          <p
            role="status"
            class="mt-4 text-emerald-100/80"
          >
            {{ t('GAME.WAITING_ROUND') }}
          </p>
        </template>
        <p
          v-else
          role="status"
          class="rounded-lg bg-black/25 px-4 py-3 font-semibold text-emerald-200"
        >
          {{ t('GAME.WAITING_ROUND') }}
        </p>
      </section>

      <p v-if="phase === 'round' && match?.round?.reversed" class="mt-4 inline-block rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-emerald-950">{{ t('POWERUPS.REVERSED') }}</p>

      <!-- Round: table and hand -->
      <template v-else-if="phase === 'round'">
        <section class="mt-8">
          <h2 class="font-serif text-xl font-bold">
            {{ special ? t('GAME.OTHERS_CARDS') : t('GAME.TABLE') }}
          </h2>
          <RoundTable
            v-if="match?.round"
            :cards="match.round.cards"
            :manilha-of="manilhaOf"
          />
        </section>

        <section class="mt-8">
          <h2 class="font-serif text-xl font-bold">
            {{ t('GAME.YOUR_HAND') }}
          </h2>
          <p
            v-if="isMyTurn && !special"
            class="mt-1 font-semibold text-amber-300"
          >
            {{ t('GAME.PLAY_CARD_PROMPT') }}
          </p>
          <p
            v-else-if="!special"
            class="mt-1 text-emerald-100/80"
          >
            {{ t('GAME.WAITING_PLAY', { name: turnPlayerName }) }}
          </p>

          <div
            v-if="special"
            class="mt-3 flex items-center gap-3"
          >
            <div :class="[cardBackClass, 'flex h-24 w-16 shrink-0 items-center justify-center rounded-md font-serif text-2xl font-bold text-emerald-100 shadow-lg ring-1 ring-white/30']">
              ?
            </div>
            <p class="text-emerald-100/80">
              {{ t('GAME.YOUR_CARD_HIDDEN') }}
            </p>
          </div>
          <div
            v-else
            class="mt-3 flex flex-wrap px-2 pt-4"
          >
            <div
              v-for="(card, index) in match?.currentPlayerCards ?? []"
              :key="index"
              class="fan-card -ml-5 first:ml-0"
              :style="fanStyle(index, match?.currentPlayerCards.length ?? 1)"
            >
              <PlayingCard
              :key="index"
              :value="card.value"
              :label="card.label"
              :suit="card.suit"
              :manilha="manilhaOf(card)"
              interactive
              :disabled="!isMyTurn"
              @click="playCard(index)"
            />
            </div>
          </div>
        </section>
      </template>

      <!-- Hand while guessing (normal match: look at your cards before guessing) -->
      <section
        v-if="phase === 'guessing' && !special && (match?.currentPlayerCards.length ?? 0) > 0"
        class="mt-8"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.YOUR_HAND') }}
        </h2>
        <div class="mt-3 flex flex-wrap px-2 pt-4">
          <div
            v-for="(card, index) in match?.currentPlayerCards ?? []"
            :key="index"
            class="fan-card -ml-5 first:ml-0"
            :style="fanStyle(index, match?.currentPlayerCards.length ?? 1)"
          >
            <PlayingCard
            :key="index"
            :value="card.value"
              :label="card.label"
              :suit="card.suit"
              :manilha="manilhaOf(card)"
          />
          </div>
        </div>
      </section>
      <section
        v-if="phase === 'guessing' && special"
        class="mt-8"
      >
        <h2 class="font-serif text-xl font-bold">
          {{ t('GAME.OTHERS_CARDS') }}
        </h2>
        <div class="mt-3 flex flex-wrap gap-4">
          <div
            v-for="roundCard in tableCards"
            :key="roundCard.playerId"
            class="flex flex-col items-center gap-1"
          >
            <PlayingCard
           :value="roundCard.card.value"
            :label="roundCard.card.label"
            :suit="roundCard.card.suit"
            :manilha="manilhaOf(roundCard.card)"
          />
            <span class="max-w-16 truncate text-xs text-emerald-100/80">{{ playerName(roundCard.playerId) }}</span>
          </div>
        </div>
        <p class="mt-3 text-emerald-100/80">
          {{ t('GAME.YOUR_CARD_HIDDEN') }}
        </p>
      </section>
      </div>

      <!-- Game history: sidebar on wide screens, collapsible below the game on small ones -->
      <aside class="mt-8 hidden w-80 shrink-0 lg:mt-0 lg:block">
        <GameHistoryPanel :entries="game.history ?? []" />
      </aside>
      <details class="mt-8 rounded-lg bg-black/25 px-4 py-3 lg:hidden">
        <summary class="cursor-pointer font-serif text-lg font-bold">
          {{ t('GAME.HISTORY') }}
        </summary>
        <div class="mt-2">
          <GameHistoryPanel
            :entries="game.history ?? []"
            hide-title
          />
        </div>
      </details>
    </main>
  </div>
</template>
