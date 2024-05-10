
import type { RoundCards } from "@/interfaces/Lobby";
import { lobby } from '@/connection'


/**
 *  Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala atualizem
 *  o status da mesa e saibam qual é o próximo jogador que deve jogar
 * 
 *  @param cards cartas jogadas até o momento
 *  @param nextPlayerId id do próximo jogador que deve jogar. Pode ser undefined caso todos os jogadores já tenham jogado
 */
export function handleTableUpdate(cards: RoundCards, nextPlayerId?: string) {

}