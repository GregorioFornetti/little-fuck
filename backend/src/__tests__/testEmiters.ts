
import { clientSocket, eventsEmitter } from "./setupTests";


describe("Testes de envio de mensagem / eventos pelo servidor", () => {
    
    describe("Lobby events", () => {

        test("join-lobby-success", () => {
            clientSocket.on('join-lobby-success', (lobby) => {
                expect(lobby.lobbyId).toBe('1');
                expect(lobby.players).toHaveLength(1);
                expect(lobby.players[0].id).toBe('1');
                expect(lobby.players[0].name).toBe('player1');
                expect(lobby.players[0].leader).toBe(true);
                expect(lobby.players[0].ready).toBe(false);
            })

            eventsEmitter.Lobby.emitJoinLobbySuccess({
                lobbyId: '1',
                players: [
                    {
                        id: '1',
                        name: 'player1',
                        leader: true,
                        ready: false
                    }
                ]
            })
        })

        test("join-lobby-error", () => {
            clientSocket.on('join-lobby-error', (errorType) => {
                expect(errorType).toBe('no-name');
            })

            eventsEmitter.Lobby.emitJoinLobbyError('no-name');
        })
    })
})