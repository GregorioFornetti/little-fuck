
import EventsListenersAdderBase from '../EventsListenersAdderBase';

import { handlePlayerLogout } from './handlers/playerLogout';
import { handlePlayerLogoutError } from './handlers/playerLogoutError';
import { handleInternalServerError } from './handlers/internalServerError';
import { handleDebug } from './handlers/debug';
import type { Socket } from 'socket.io-client';

export class GeneralEventsHandlersAdder extends EventsListenersAdderBase {

  /**
     *  Evento indicando que um jogador acaba de sair da sala.
     *
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
  public playerLogout(handlerFunction: (id: string) => void): void {
    this.socket.on('player-logout', handlerFunction);
  }

  /**
     *  Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.
     *
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
  public playerLogoutError(handlerFunction: (type: 'not-in-lobby') => void): void {
    this.socket.on('player-logout-error', handlerFunction);
  }

  /**
     *  Evento indicando que um erro ocorreu no servidor.
     *  Esse erro não era esperado, e provavelmente faria com que o servidor parasse, mas foi "contido".
     *  Quando isso ocorrer, o lobby será desfeito imediatamente,
     *  e um log desse evento será feito no servidor para posterior correção...
     *
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
  public internalServerError(handlerFunction: () => void): void {
    this.socket.on('internal-server-error', handlerFunction);
  }

  /**
     *  Evento que é enviado após cada modificação ocorrida no `backend`. Esse evento irá transmitir o estado das informações de forma "cru"
     *  para o frontend, para fins de debug. Este evento só sera acionado quando o servidor for executado em modo de debug
     *  (através do comando `npm run debug`).
     *
     *  Esse evento sempre será chamado logo em seguida da chamada de qualquer outro evento (tirando ele mesmo).
     *  Logo, se o evento acionado for para o lobby, o debug será para o lobby inteiro também. Caso seja para um jogador específico,
     *  o debug também será para esse jogador específico
     *
     *  @param handlerFunction função que será chamada quando o evento for recebido
     */
  public debug(handlerFunction: (lobby: any) => void): void {
    this.socket.on('debug', handlerFunction);
  }
}

export default function addDefaultGeneralHandlers(socket: Socket) {
  const generalEventsHandlersAdder = new GeneralEventsHandlersAdder(socket);

  generalEventsHandlersAdder.playerLogout(handlePlayerLogout);
  generalEventsHandlersAdder.playerLogoutError(handlePlayerLogoutError);
  generalEventsHandlersAdder.internalServerError(handleInternalServerError);
  generalEventsHandlersAdder.debug(handleDebug);
}
