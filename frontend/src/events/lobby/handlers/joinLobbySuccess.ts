
import type Lobby from "@/interfaces/Lobby";
import { lobby } from '@/connection'
import { i18n } from "@/plugins/i18n";

/**
 *  Indica ao usuário que ele conseguiu entrar na sala.
 *  Este receberá uma lista de todos os outros jogadores da sala e suas informações.
 *  Logo após isso, será enviado para todos os outros jogadores o evento `player-join`,
 *  para que todos adicionem este jogador ao lobby também (incluindo ele mesmo).
 * 
 *  @param lobby informações da sala que o jogador entrou
 */
export function handleJoinLobbySuccess(lobbyResponse: Lobby) {
    if (lobby.value !== null) {
        throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'))
    }

    lobby.value = lobbyResponse
}