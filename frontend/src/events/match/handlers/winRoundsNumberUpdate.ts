
import { lobby } from '@/connection'


/**
 *  Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala
 *  atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar
 * 
 *  @param player informações do jogador atual
 *  @param numWinRounds número de rodadas que o jogador atual acredita que irá vencer (palpite)
 *  @param nextPlayerId id do próximo jogador que deve palpitar. Pode ser null caso todos os jogadores já tenham palpitado
 */
export function handleWinRoundsNumberUpdate(numWinRounds: number, nextPlayerId: string|null) {

}