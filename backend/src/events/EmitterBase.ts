
import { Socket, Server } from "socket.io";


export default class EmitterBase {
    private socket: Socket;
    private io: Server;
    private lobbyId?: string;

    constructor(io: Server, socket: Socket, lobbyId?: string) {
        this.io = io
        this.socket = socket
        this.lobbyId = lobbyId;
    }

    protected emitToUser(event: string, ...args: any[]) {
        this.socket.emit(event, ...args);
    }

    protected emitToLobby(event: string, ...args: any[]) {
        if (this.lobbyId) {
            this.io.to(this.lobbyId).emit(event, ...args);
        } else {
            throw new Error(`Jogador de id ${this.socket.id} tentou emitir um evento para a sala, mas não está em nenhuma sala.`);
        }
    }
}