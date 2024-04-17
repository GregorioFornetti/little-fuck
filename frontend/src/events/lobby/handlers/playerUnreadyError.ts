
import { lobby } from '@/connection'


/**
 *  Evento enviado ao cliente que tentou se despreparar para a partida, mas falhou.
 *  Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento.
 *  Outro motivo pode ser que o líder tente se despreparar, mas este não precisa fazer isso, ele só precisa iniciar a partida.
 *  OBS: caso o jogador solicite a despreparação e este já está despreparado, nada deve acontecer (este evento não deve ser acionado).
 * 
 *  @param player informações do jogador atual
 *  @param type tipo de erro que ocorreu
 */
export function handlePlayerUnreadyError(type: "in-game"|"not-in-lobby"|"leader") {

}