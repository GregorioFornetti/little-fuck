import Player from '../../../interfaces/Player';
import type { GameOptions } from '../../../interfaces/Lobby';

const isValidOption = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;

const isValidOptions = (options: unknown): options is GameOptions => {
  if (typeof options !== 'object' || options === null) {
    return false;
  }
  const candidate = options as Partial<GameOptions>;
  return isValidOption(candidate.initialHealth, 1, 10) &&
    isValidOption(candidate.playerActionTimeSeconds, 5, 60) &&
    isValidOption(candidate.roundEndTimeSeconds, 3, 30) &&
    (candidate.cardType === 'numbered' || candidate.cardType === 'manilha-velha');
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
