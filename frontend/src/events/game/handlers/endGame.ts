import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando o final de um jogo completo de "Little Fuck".
 *
 *  @param playerRanks lista da classificação final dos jogadores. A primeira posição é o jogador vencedor,
 *  a segunda é o jogador que ficou em segundo lugar, e assim por diante.
 */
export function handleEndGame(_playerRanks: string[]) {
  if (lobby.value === null) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }

  if (!lobby.value.game) {
    throw new Error(i18n.t('COMMON.ERROR.GAME_NOT_STARTED'));
  }

  lobby.value.game = undefined;
}
