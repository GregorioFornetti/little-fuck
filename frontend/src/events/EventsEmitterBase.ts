
import type { Socket } from 'socket.io-client';

/**
 *  Classe base para emissão de eventos (enviar mensagens ao servidor).
 *
 *  Os emitters extedem essa classe para usar métodos genéricos de envio de mensagens.
 */
export default class EventsEmitterBase {

  protected socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }
}

