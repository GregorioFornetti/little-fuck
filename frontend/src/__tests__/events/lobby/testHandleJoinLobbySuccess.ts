

import "../setupTests";
import type Lobby from "@/interfaces/Lobby";
import { handleJoinLobbySuccess } from "@/events/lobby/handlers/joinLobbySuccess";
import { i18n } from "@/plugins/i18n";

describe("handleJoinLobbySuccess", () => {

    test("Deve guardar as informações do lobby caso o jogador não estivesse em nenhum antes", () => {
        const lobbyParam: Lobby = {
            lobbyId: '123',
            players: [
                {
                    id: '123456',
                    name: 'Player1',
                    ready: false,
                    leader: true
                }
            ]
        }
        handleJoinLobbySuccess(lobbyParam)
        expect(require('@/connection').lobby.value).toEqual(lobbyParam)  // Precisa atualizar a variável global com as informações do lobby fornecida pelo servidor
    })

    test("Deve gerar erro caso o jogador já estiver em um lobby", () => {
        const lobbyParam: Lobby = {
            lobbyId: '123',
            players: [
                {
                    id: '123456',
                    name: 'Player1',
                    ready: false,
                    leader: true
                }
            ]
        }
        require('@/connection').lobby.value = lobbyParam  // Variável global de lobby definida marca que jogador já está em um lobby, e não poderia entrar em outro.

        expect(() => handleJoinLobbySuccess(lobbyParam)).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')))
    })
})