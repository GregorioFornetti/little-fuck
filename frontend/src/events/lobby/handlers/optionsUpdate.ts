import type { GameOptions } from '@/interfaces/Lobby';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento enviado para todos os jogadores da sala quando o líder altera as opções do jogo.
 *
 *  @param options novas opções de jogo da sala
 */
export function handleOptionsUpdate(options: GameOptions) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  lobby.value.options = options;
}
