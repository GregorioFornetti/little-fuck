
import { lobby } from '@/connection'


/**
 *  Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.
 * 
 *  @param winnerId id do jogador que ganhou a rodada
 *  @param points pontos que o jogador ganhador fez nessa rodada
 */
export function handleEndRound(winnerId: string, points: number) {

}