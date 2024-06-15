
import { clientSocket, serverSocket } from "../../setupTests"
import { addHandlersForDebugMode } from "@/debug/handlers/addHandlersForDebugMode";
import { handleDebug } from "@/debug/handlers/handleDebug";
import { handleUpdateEventHistory } from "@/debug/handlers/handleUpdateEventHistory";
import { handleUpdateFrontendHistory } from "@/debug/handlers/handleUpdateFrotendHistory";

jest.mock('@/debug/handlers/handleDebug')
jest.mock('@/debug/handlers/handleUpdateEventHistory')
jest.mock('@/debug/handlers/handleUpdateFrotendHistory')


describe("addHandlersForDebugMode", () => {
    test("Deve adicionar o handler de debug ao socket", (done) => {
        addHandlersForDebugMode(clientSocket)

        clientSocket.on('debug', (lobby: any) => {
            expect(handleDebug).toHaveBeenCalledWith(lobby)
            done()
        })
        
        serverSocket.emit('debug', { lobbyId: '123', players: []})
    })

    test("Deve adicionar o handler de updateFrontendHistory ao socket", (done) => {
        addHandlersForDebugMode(clientSocket)

        clientSocket.onAny((event: string, ...args: any[]) => {
            expect(handleUpdateFrontendHistory).toHaveBeenCalledWith(event, ...args)
            done()
        })
        
        serverSocket.emit('any event', 'arg1', 'arg2')
    })

    test("Deve adicionar o handler de updateEventHistory ao socket", (done) => {
        addHandlersForDebugMode(clientSocket)

        clientSocket.onAny((event: string, ...args: any[]) => {
            expect(handleUpdateEventHistory).toHaveBeenCalledWith(event, ...args)
            done()
        })
        
        serverSocket.emit('any event', 'arg1', 'arg2')
    })
})