
import { handleDebug } from "@/debug/handlers/handleDebug";
import { backendLobbyHistoryList } from "@/debug/globals";

beforeEach(() => {
    backendLobbyHistoryList.value = []
})

describe('handleDebug', () => {

    test("Deve ser possível cadastrar um lobby de backend no histórico", (done) => {
        handleDebug({ lobbyId: '123', players: []})

        expect(backendLobbyHistoryList.value).toHaveLength(1)
        expect(backendLobbyHistoryList.value[0].lobbyId).toBe('123')
        expect(backendLobbyHistoryList.value[0].players).toHaveLength(0)
        done()
    })

    test("Deve ser possível cadastrar dois lobbys de backend no histórico em seguida", (done) => {
        handleDebug({ lobbyId: '123', players: []})
        handleDebug({ lobbyId: '123', players: [{
            id: '123',
            name: 'Teste',
            leader: true,
            ready: false
        }]})

        expect(backendLobbyHistoryList.value).toHaveLength(2)
        expect(backendLobbyHistoryList.value[0].lobbyId).toBe('123')
        expect(backendLobbyHistoryList.value[1].lobbyId).toBe('123')
        expect(backendLobbyHistoryList.value[0].players).toHaveLength(0)
        expect(backendLobbyHistoryList.value[1].players).toHaveLength(1)
        expect(backendLobbyHistoryList.value[1].players[0].id).toBe('123')
        expect(backendLobbyHistoryList.value[1].players[0].name).toBe('Teste')
        expect(backendLobbyHistoryList.value[1].players[0].leader).toBe(true)
        expect(backendLobbyHistoryList.value[1].players[0].ready).toBe(false)
        done()
    })
})