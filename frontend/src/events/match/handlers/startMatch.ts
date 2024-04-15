
import type { Card } from "@/interfaces/Lobby";
import type Player from "@/interfaces/Player";


/**
 *  Evento enviado para indicar o início da partida.
 * 
 *  @param player informações do jogador atual
 *  @param cards cartas que o jogador atual possui
 *  @param firstPlayerId id do jogador que deve começar a partida
 */
export function handleStartMatch(player: Player, cards: Card[], firstPlayerId: string) {

}