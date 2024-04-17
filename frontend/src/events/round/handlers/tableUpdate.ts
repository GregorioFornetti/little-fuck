
import type { Round } from "@/interfaces/Lobby";
import { lobby } from '@/connection'


/**
 *  Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala atualizem
 *  o status da mesa e saibam qual é o próximo jogador que deve jogar
 * 
 *  @param player informações do jogador atual
 *  @param cards cartas jogadas até o momento
 *  @param nextPlayerId id do próximo jogador que deve jogar. Pode ser null caso todos os jogadores já tenham jogado
 */
export function handleTableUpdate(cards: Round, nextPlayerId: string|null) {

}