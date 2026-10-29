import Player from '../../../interfaces/Player';
import { APPEARANCE_COLORS, APPEARANCE_EMOTES } from '../../../global';

export interface UpdateAppearancePayload {
  emote: string,
  color: string
}

/**
 *  Evento enviado por um jogador para alterar a própria aparência (emote e cor)
 *  enquanto está na sala, antes do jogo começar. Nenhum jogador pode usar o
 *  mesmo emote ou a mesma cor de outro jogador da mesma sala. Em caso de
 *  sucesso, todos na sala recebem `appearance-update`. Caso contrário, o
 *  solicitante recebe `appearance-error`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param payload novo emote e nova cor desejados
 */
export function handleUpdateAppearance(player: Player, payload: UpdateAppearancePayload) {
  if (!player.lobby) {
    player.eventsEmitter.Lobby.emitAppearanceError('not-in-lobby');
    return;
  }

  if (player.lobby.game) {
    player.eventsEmitter.Lobby.emitAppearanceError('already-in-game');
    return;
  }

  const me = player.lobby.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);
  if (!me) {
    player.eventsEmitter.Lobby.emitAppearanceError('not-in-lobby');
    return;
  }

  const emote = payload?.emote;
  const color = payload?.color;
  if (!APPEARANCE_EMOTES.includes(emote) || !APPEARANCE_COLORS.includes(color)) {
    player.eventsEmitter.Lobby.emitAppearanceError('invalid-appearance');
    return;
  }

  const others = player.lobby.players.filter((lobbyPlayer) => lobbyPlayer.id !== player.playerId);
  if (others.some((lobbyPlayer) => lobbyPlayer.emote === emote)) {
    player.eventsEmitter.Lobby.emitAppearanceError('emote-taken');
    return;
  }
  if (others.some((lobbyPlayer) => lobbyPlayer.color === color)) {
    player.eventsEmitter.Lobby.emitAppearanceError('color-taken');
    return;
  }

  me.emote = emote;
  me.color = color;
  player.eventsEmitter.Lobby.emitAppearanceUpdate(player.playerId, emote, color);
}
