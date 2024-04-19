
import { lobby } from '@/connection'


/**
 *  Evento enviado para indicar o fim da partida. Uma partida acaba quando todos os jogadores já jogaram todas as suas cartas, ou seja,
 *  todas as rodadas dessa partida foram finalizadas, podendo atualizar as vidas dos jogadores dependendo das vitórias e palpites feitos.
 * 
 *  @param playerHealthUpdate É um objeto tendo como chaves todos os ids dos jogadores do lobby.
 *  É um objeto mapeando id de jogadores para o valor que deve ser modificado em sua vida final. 
 *  Ex: { 123: -1 } = jogador com id 123 perdeu uma vida

 */
export function handleEndMatch(playerHealthUpdate: { [playerId: string]: number }) {

}