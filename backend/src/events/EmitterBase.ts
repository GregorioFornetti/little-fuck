import { Socket, Server } from 'socket.io';
import { Socket as ClientSocket } from 'socket.io-client';
import { lobbys } from '../global';

/**
 *  Classe base para emissão de eventos (enviar mensagens aos clientes).
 *
 *  Os emitters extedem essa classe para usar métodos genéricos de envio de mensagens.
 */
export default class EmitterBase {
  private socket: Socket|ClientSocket;
  private io: Server;
  private lobbyId?: string;

  constructor(io: Server, socket: Socket|ClientSocket, lobbyId?: string) {
    this.io = io;
    this.socket = socket;
    this.lobbyId = lobbyId;
  }

  /**
     *  Emite um evento para o jogador do socket especificado no construtor.
     *
     *  @param event Nome do evento a ser emitido.
     *  @param args Argumentos a serem passados para o evento.
     */
  protected emitToUser(event: string, ...args: any[]) {
    this.socket.emit(event, ...args);
  }

  /**
     *  Emite um evento para todos os jogadores da sala do jogador do socket especificado no construtor.
     *
     *  @param event Nome do evento a ser emitido.
     *  @param args Argumentos a serem passados para o evento.
     */
  protected emitToLobby(event: string, ...args: any[]) {
    if (this.lobbyId) {
      for (const player of lobbys[this.lobbyId].players) {
        this.io.to(player.id).emit(event, ...args);
      }
    } else {
      throw new Error(`Jogador de id ${this.socket.id} tentou emitir um evento para a sala, mas não está em nenhuma sala.`);
    }
  }

  /**
     *  Emite um evento para todos jogadores da sala do jogador do socket especificado no construtor.
     *  As informações passadas para cada jogador podem ser diferentes.
     *
     *  @param event Nome do evento a ser emitido.
     *  @param playersInfos Objeto onde a chave é o id do jogador e o
     *  valor é um objeto com as informações a serem passadas para o jogador em questão.
     */
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

  public get isPlayerInLobby() {
    return this.lobbyId !== undefined;
  }
}
