
import { lobby } from '@/connection'


/**
 *  Evento indicando que ocorreu um erro ao iniciar a partida.
 *  Esse erro pode ocorrer caso o solicitante não esteja em um sala, ou que está já está em jogo.
 *  Outro possível erro pode ocorrer caso ele não seja o líder ou se nem todos jogadores estão prontos para começar.
 * 
 *  @param type tipo de erro que ocorreu
 */
export function handleStartGameError(type: "not-leader"|"not-all-ready"|"not-in-lobby"|"already-in-game") {

}