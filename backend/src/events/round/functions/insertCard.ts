import { RoundCard, RoundCards } from '../../../interfaces/Lobby';

/**
 *  Insere uma carta na mesa da rodada atual. Essa função irá inserir de forma ordenada a nova carta nas cartas que estão em partida (onMatch),
 *  caso não exista nenhuma carta igual a ela. Caso exista, a carta será inserida na lista de cartas anuladas (anulledCards),
 *  também de forma ordenada. A função não atualiza o objeto original de cartas (mesa), mas sim retorna um novo objeto com as cartas atualizadas.
 *
 *  @param cards São as cartas (mesa) da rodada atual
 *  @param card É a carta que será inserida na mesa
 */
export function insertCard(cards: RoundCards, card: RoundCard): RoundCards {

}
