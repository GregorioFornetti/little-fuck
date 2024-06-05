import Lobby from '../../interfaces/Lobby';

/**
 *  Coleta todos os ids de jogadores que ainda estão "vivos". Jogadores "vivos" são aqueles que ainda possuem pontos de vida > 0
 *  Caso o lobby não tenha um jogo em andamento, será lançado um erro.
 *
 *  @param lobby informações do lobby (e do jogo) atual
 *  @returns um array contendo todos os ids dos jogadores vivos
 */
export function getAlivePlayersIds(lobby: Lobby): string[] {

}
