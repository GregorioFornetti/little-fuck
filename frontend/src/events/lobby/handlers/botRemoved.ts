import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando que um bot foi removido da sala pelo líder.
 *
 *  @param botId id do bot removido
 */
export function handleBotRemoved(botId: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  lobby.value.players = lobby.value.players.filter((player) => player.id !== botId);
}
