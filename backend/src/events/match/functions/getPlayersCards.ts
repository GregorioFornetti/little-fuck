
import Lobby, { Card } from '../../../interfaces/Lobby';

/**
 *  Sorteia `numCards` cartas aleatórias para os jogadores de uma partida.
 *
 *  @param lobby lobby contendo as informações dos jogadores da partida
 *  @param cards cartas disponíveis para serem sorteadas. As cartas sorteadas não podem ser repetidas.
 *  @param numCards número de cartas a serem sorteadas para cada jogador
 *  @returns um objeto contendo as cartas sorteadas para cada jogador. A chave é o id do jogador e o valor é um
 *  array de `numCards` cartas.
 */
export default function getPlayersCards(lobby: Lobby, cards: Card[], numCards: number): { [playerId: string]: Card[] } {

}
