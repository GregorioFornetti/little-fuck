
import { Socket, Server } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { lobbys } from "../global";


export default class EmitterBase {
    private socket: Socket|ClientSocket;
    private io: Server;
    private lobbyId?: string;

    constructor(io: Server, socket: Socket|ClientSocket, lobbyId?: string) {
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

    protected emitToSpecificLobbyPlayers(event: string, playersInfos: { [playerId: string] : any }) {
        if (this.lobbyId) {
            for (const playerId in playersInfos) {
                if (!lobbys[this.lobbyId].players.find(player => player.id === playerId)) {
                    throw new Error(`Tentativa de emitir evento para jogador de id ${playerId} que não está na sala ${this.lobbyId}`);
                }
                this.io.to(playerId).emit(event, ...Object.values(playersInfos[playerId]));
            }
        } else {
            throw new Error(`Jogador de id ${this.socket.id} tentou emitir um evento para a sala, mas não está em nenhuma sala.`);
        }
    }
}