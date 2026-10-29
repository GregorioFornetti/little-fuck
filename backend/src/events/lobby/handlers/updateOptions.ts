import Player from '../../../interfaces/Player';
import type { GameOptions } from '../../../interfaces/Lobby';

const isValidOption = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;

const ALL_POWERUP_TYPES = ['swap-cards', 'cancel-card', 'reverse-card-strengths', 'random-card', 'hide-card-strength', 'increase-card-strength', 'decrease-card-strength', 'peek-card', 'shield'];

const isValidPowerups = (powerups: unknown): boolean => {
  if (powerups === undefined) return true;
  if (typeof powerups !== 'object' || powerups === null) return false;
  const candidate = powerups as { enabled?: unknown, perGrant?: unknown, grantTiming?: unknown };
  return Array.isArray(candidate.enabled) &&
    candidate.enabled.every((type) => ALL_POWERUP_TYPES.includes(type as string)) &&
    new Set(candidate.enabled).size === candidate.enabled.length &&
    isValidOption(candidate.perGrant, 1, 5) &&
    (candidate.grantTiming === 'match' || candidate.grantTiming === 'game');
};

const isValidCustomCards = (customCards: unknown): boolean => {
  if (customCards === undefined) return true;
  return Array.isArray(customCards) &&
    customCards.length >= 1 &&
    customCards.length <= 500 &&
    customCards.every((value) => isValidOption(value, 1, 999));
};
const isValidOptions = (options: unknown): options is GameOptions => {
  if (typeof options !== 'object' || options === null) {
    return false;
  }
  const candidate = options as Partial<GameOptions>;
  return isValidOption(candidate.initialHealth, 1, 10) &&
    isValidOption(candidate.playerActionTimeSeconds, 5, 60) &&
    isValidOption(candidate.roundEndTimeSeconds, 3, 30) &&
    (candidate.cardType === 'numbered' || candidate.cardType === 'manilha-velha' || candidate.cardType === 'manilha-nova' || candidate.cardType === 'manilha-paraguaia') &&
    isValidCustomCards(candidate.customCards) &&
    (candidate.theme === undefined || candidate.theme === 'classic' || candidate.theme === 'midnight' || candidate.theme === 'wine' || candidate.theme === 'charcoal') &&
    (candidate.cardBack === undefined || candidate.cardBack === 'classic' || candidate.cardBack === 'stripes' || candidate.cardBack === 'lozenges' || candidate.cardBack === 'dots') &&
    isValidPowerups(candidate.powerups);
};

/**
 *  Evento enviado pelo líder quando ele altera as opções do jogo na sala.
 *  Apenas o líder pode alterar, e apenas antes do jogo começar. Em caso de sucesso,
 *  todos na sala recebem as novas opções pelo evento `options-update`.
 *  Caso contrário, o erro é informado pelo evento `options-error`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param options novas opções de jogo desejadas
 */
export function handleUpdateOptions(player: Player, options: unknown) {
  const playerInLobby = player.lobby?.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);

  if (!player.lobby || !playerInLobby) {
    player.eventsEmitter.Lobby.emitOptionsError('not-in-lobby');
    return;
  }

  if (!playerInLobby.leader) {
    player.eventsEmitter.Lobby.emitOptionsError('not-leader');
    return;
  }

  if (player.lobby.game) {
    player.eventsEmitter.Lobby.emitOptionsError('already-in-game');
    return;
  }

  if (!isValidOptions(options)) {
    player.eventsEmitter.Lobby.emitOptionsError('invalid-options');
    return;
  }

  player.lobby.options = { ...options };
  player.eventsEmitter.Lobby.emitOptionsUpdate(player.lobby.options);
}
