
import type { Card } from "@/interfaces/Lobby";
import { lobby } from '@/connection'


/**
 *  Evento enviado para indicar o início da partida.
 * 
 *  @param cards cartas que o jogador atual possui
 *  @param firstPlayerId id do jogador que deve começar a partida
 */
export function handleStartMatch(cards: Card[], firstPlayerId: string) {

}