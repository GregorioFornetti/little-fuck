
import { LobbyEventsHandlersAdder } from './lobby/eventsHandlers';
import { GameEventsHandlersAdder } from './game/eventsHandlers';
import { MatchEventsHandlersAdder } from './match/eventsHandlers';
import { RoundEventsHandlersAdder } from './round/eventsHandlers';
import { GeneralEventsHandlersAdder } from './general/eventsHandlers';
import type { Socket } from 'socket.io-client';;

/**
 *  Classe para facilitar a adição de handlers de eventos. Ao invés de usar o `socket.on(nomeDoEvento, handler)` para adicionar
 *  eventos, essa classe permite adicionar handlers de eventos de forma mais organizada.
 *  Ao usar essa classe, é evitado que os nomes dos eventos sejam escritos de forma errada,
 *  com um erro de digitação (ex: 'join-loby' ao invés de 'join-lobby'). Além disso, com a tipagem é possível saber quais
 *  parâmetros são esperados pelo handler do evento.
 */
export default class EventsListenersAdder {

  public lobby: LobbyEventsHandlersAdder;
  public game: GameEventsHandlersAdder;
  public match: MatchEventsHandlersAdder;
  public round: RoundEventsHandlersAdder;
  public general: GeneralEventsHandlersAdder;

  constructor(socket: Socket) {
    this.lobby = new LobbyEventsHandlersAdder(socket);
    this.game = new GameEventsHandlersAdder(socket);
    this.match = new MatchEventsHandlersAdder(socket);
    this.round = new RoundEventsHandlersAdder(socket);
    this.general = new GeneralEventsHandlersAdder(socket);
  }
}
