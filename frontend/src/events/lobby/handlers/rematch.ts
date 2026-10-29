import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando que o líder pediu uma revanche ao final do jogo.
 *  Todos voltam para a sala: o ranking é limpo e o status de prontidão é
 *  resetado (bots continuam sempre prontos).
 */
export function handleRematch() {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  lobby.value.game = undefined;
  lobby.value.gameRanking = undefined;
  for (const player of lobby.value.players) {
    player.ready = player.bot === true;
  }
}
