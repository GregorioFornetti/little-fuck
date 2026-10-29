import type { Lobby } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

type LobbyPlayer = Lobby['players'][number];

/**
 *  Evento indicando que um bot foi adicionado na sala pelo líder.
 *
 *  @param bot informações do bot adicionado
 */
export function handleBotAdded(bot: LobbyPlayer) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.players.some((player) => player.id === bot.id)) {
    lobby.value.players.push(bot);
  }
}
