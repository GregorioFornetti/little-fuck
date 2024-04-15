
import type Player from "@/interfaces/Player";
import type { SpecialMatchCards } from "@/interfaces/Lobby";


/**
 *  Iniciará a partida especial, quando todos os jogadores possuem apenas uma carta. 
 *  Todos os jogadores poderão ver as cartas dos outros, porém, não poderão ver a própria carta.
 * 
 *  Após todos os jogadores palpitarem, será acionado o evento table-update, mostrando o estado final da mesa para todos os jogadores
 *  e logo em seguida o evento `end-round` será também acionado. Depois de um tempo, será acionado o evento `end-match`.
 * 
 *  @param player informações do jogador atual
 *  @param cards cartas dos outros jogadores
 *  @param firstPlayerId id do jogador que deve começar palpitando
 */
export function handleStartSpecialMatch(player: Player, cards: SpecialMatchCards, firstPlayerId: string) {

}