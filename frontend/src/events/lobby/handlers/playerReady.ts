
import type Player from "@/interfaces/Player";


/**
 *  Indica que um jogador acaba de ficar preparado para um jogo.
 *  Este evento só é acionado caso o jogador que solicitou o "ready" ainda não estivesse pronto.
 * 
 *  @param player informações do jogador atual
 *  @param id identificador do jogador que acabou de ficar pronto
 */
export function handlePlayerReady(player: Player, id: string) {

}