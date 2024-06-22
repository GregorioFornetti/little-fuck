
import type { Lobby } from '@/interfaces/Lobby';

/**
 *  Evento enviado para um usuário que acabou de reconectar.
 *  Este usuário perdeu a conexão em algum momento, seja por causa de queda na internet, ou por ter saído da página do jogo.
 *
 *  @param lobby informações da sala em que o jogador está
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleReconnect(lobbyResponse: Lobby) {

}
