
import type Player from "@/interfaces/Player";


/**
 *  Indica que um jogador acaba de ficar despreparado para um jogo.
 *  Este evento só é acionado caso o jogador que solicitou o "unready" ainda não estivesse despreparado.
 * 
 *  @param player informações do jogador atual
 *  @param id identificador do jogador que acabou de ficar despreparado
 */
export function handlePlayerUnready(player: Player, id: string) {

}