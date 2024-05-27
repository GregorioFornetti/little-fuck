
import Lobby from "../../../interfaces/Lobby";
import Player from "../../../interfaces/Player";
import { players } from "../../../global";

/**
 *  Gera uma resposta automática para o palpite de um usuário. Isso deve acontecer quando o usuário demora muito para palpitar.
 *  Sempre palpitará 0 vitórias quando for possível. Caso contrário, será palpitado o valor 1.
 * 
 *  @param lobby 
 */
export function generateAutomaticNumWinResponse(lobby?: Lobby): void {

}