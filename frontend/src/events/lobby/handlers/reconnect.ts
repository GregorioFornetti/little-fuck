
import type Lobby from "@/interfaces/Lobby";
import type Player from "@/interfaces/Player";


/**
 *  Evento enviado para um usuário que acabou de reconectar.
 *  Este usuário perdeu a conexão em algum momento, seja por causa de queda na internet, ou por ter saído da página do jogo.
 * 
 *  @param player informações do jogador atual
 *  @param lobby informações da sala em que o jogador está
 */
export function handleReconnect(player: Player, lobby: Lobby) {

}