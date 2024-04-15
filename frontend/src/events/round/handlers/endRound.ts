
import type Player from "@/interfaces/Player";


/**
 *  Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.
 * 
 *  @param player informações do jogador atual
 *  @param winnerId id do jogador que ganhou a rodada
 *  @param points pontos que o jogador ganhador fez nessa rodada
 */
export function handleEndRound(player: Player, winnerId: string, points: number) {

}