
import "../../setupTests"
import { handleUpdateFrontendHistory } from "@/debug/handlers/handleUpdateFrotendHistory";
import { frontendLobbyHistoryList } from "@/debug/globals";

beforeEach(() => {
    frontendLobbyHistoryList.value = []
})


describe('handleUpdateFrontendHistory', () => {

    test("Deve ser possível cadastrar um lobby de frontend no histórico", (done) => {
        const connection = require('@/connection');

        connection.lobby.value = {
            lobbyId: '123',
            players: []
        }

        handleUpdateFrontendHistory('any event', 'arg1', 'arg2')

        expect(frontendLobbyHistoryList.value).toHaveLength(1)
        expect(frontendLobbyHistoryList.value[0]?.lobbyId).toBe('123')
        expect(frontendLobbyHistoryList.value[0]?.players).toHaveLength(0)

        done()
    })

    test("Deve ser possível cadastrar dois lobbys de frontend no histórico em seguida", (done) => {
        const connection = require('@/connection');

        connection.lobby.value = null

        handleUpdateFrontendHistory('any event', 'arg1', 'arg2')

        expect(frontendLobbyHistoryList.value).toHaveLength(1)
        expect(frontendLobbyHistoryList.value[0]).toBe(null)

        connection.lobby.value = {
            lobbyId: '123',
            players: [{
                id: '123',
                name: 'Teste',
                leader: true,
                ready: false
            }]
        }

        handleUpdateFrontendHistory('any event', 'arg1', 'arg2')

        expect(frontendLobbyHistoryList.value).toHaveLength(2)
        expect(frontendLobbyHistoryList.value[0]).toBe(null)
        expect(frontendLobbyHistoryList.value[1]?.lobbyId).toBe('123')
        expect(frontendLobbyHistoryList.value[1]?.players).toHaveLength(1)
        expect(frontendLobbyHistoryList.value[1]?.players[0].id).toBe('123')
        expect(frontendLobbyHistoryList.value[1]?.players[0].name).toBe('Teste')
        expect(frontendLobbyHistoryList.value[1]?.players[0].leader).toBe(true)
        expect(frontendLobbyHistoryList.value[1]?.players[0].ready).toBe(false)

        done()
    })

    test("Não deve adicionar lobby ao histórico se o evento for 'debug'", (done) => {
        const connection = require('@/connection');

        connection.lobby.value = {
            lobbyId: '123',
            players: []
        }

        handleUpdateFrontendHistory('debug', 'arg1', 'arg2')

        expect(frontendLobbyHistoryList.value).toHaveLength(0)

        done()
    })
})