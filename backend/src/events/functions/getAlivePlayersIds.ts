
import Lobby from '../../interfaces/Lobby';
import i18n from '../../plugins/i18n';

/**
 *  Coleta todos os ids de jogadores que ainda estão "vivos". Jogadores "vivos" são aqueles que ainda possuem pontos de vida > 0
 *  Caso o lobby não tenha um jogo em andamento, será lançado um erro.
 *
 *  @param lobby informações do lobby (e do jogo) atual
 *  @returns um array contendo todos os ids dos jogadores vivos
 */
export function getAlivePlayersIds(lobby: Lobby): string[] {
  if (!lobby.game) {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_GAME'));
  }

  const alivePlayersIds: string[] = [];
  for (const player of lobby.players) {
    if (lobby.game.playersHealth[player.id] > 0) {
      alivePlayersIds.push(player.id);
    }
  }

  return alivePlayersIds;
}
