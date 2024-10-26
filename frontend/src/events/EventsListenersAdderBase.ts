
import type { Socket } from 'socket.io-client';

/**
 *  Classe base para os adicionadores de listeners de eventos.
 *
 *  Os listenersAdder extedem essa classe para usar métodos genéricos de envio de mensagens.
 */
export default class EventsListenersAdderBase {

  protected socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }
}

