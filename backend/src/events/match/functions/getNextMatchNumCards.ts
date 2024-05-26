
import { Card } from "../../../interfaces/Lobby";


/**
 *  Coleta o próximo número de cartas que é possível de fornecer para todos os jogadores vivos. 
 *  Caso o número atual seja o maior possível, será retornado 1.
 *  Caso seja fornecido uma lista vazia de jogadores ou cartas, será lançado um erro.
 *  
 * 
 *  @param currentMatchNumCards número atual de cartas que foi fornecido
 *  @param alivePlayersIds lista de ids dos jogadores vivos
 *  @param possibleCards lista de cartas que podem ser fornecidas
 *  @returns o próximo número de cartas que pode ser fornecido
 */
function getNextMatchNumCards(currentMatchNumCards: number, alivePlayersIds: string[], possibleCards: Card[]): number {
    
}