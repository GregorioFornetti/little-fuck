
import EventsListenersAdderBase from '../EventsListenersAdderBase';

import { handleEndGame } from './handlers/endGame';
import { handleStartGame } from './handlers/startGame';
import type { Socket } from 'socket.io-client';

export class GameEventsHandlersAdder extends EventsListenersAdderBase {
  /**
     *  Evento indicando o início de um jogo completo de "Little Fuck"
     *
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
  public startGame(handlerFunction: () => void): void {
    this.socket.on('start-game', handlerFunction);
  }

  /**
     *  Evento indicando o final de um jogo completo de "Little Fuck".
     *
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
  public endGame(handlerFunction: (playersRanks: string[]) => void): void {
    this.socket.on('end-game', handlerFunction);
  }
}

export default function addDefaultGameHandlers(socket: Socket) {
  const gameEventsHandlersAdder = new GameEventsHandlersAdder(socket);

  gameEventsHandlersAdder.startGame(handleStartGame);
  gameEventsHandlersAdder.endGame(handleEndGame);
}
