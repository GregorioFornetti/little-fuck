import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando que um jogador alterou a própria aparência (emote e cor).
 *
 *  @param playerId id do jogador que alterou a aparência
 *  @param emote novo emote do jogador
 *  @param color nova cor do jogador
 */
export function handleAppearanceUpdate(playerId: string, emote: string, color: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  const player = lobby.value.players.find((candidate) => candidate.id === playerId);
  if (player) {
    player.emote = emote;
    player.color = color;
  }
}
