
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento enviado para todos os jogadores indicando que um novo jogador entrou na sala.
 *
 *  @param id id do jogador que acabou de entrar na sala
 *  @param name nome do jogador que acabou de entrar na sala
 */
export function handlePlayerJoin(id: string, name: string) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  }

  lobby.value.players.push({
    id,
    name,
    leader: false,
    ready: false
  });
}
