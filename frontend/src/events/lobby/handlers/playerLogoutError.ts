
import type Player from "@/interfaces/Player";


/**
 *  Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.
 * 
 *  @param player informações do jogador atual
 *  @param type tipo de erro que ocorreu
 */
export function handlePlayerLogoutError(player: Player, type: "not-in-lobby") {

}