
import addDefaultLobbyEventsHandlers from './lobby/eventsHandlers';
import addDefaultGameEventsHandlers from './game/eventsHandlers';
import addDefaultMatchEventsHandlers from './match/eventsHandlers';
import addDefaultRoundEventsHandlers from './round/eventsHandlers';
import type { Socket } from 'socket.io-client';


/**
 *  Adiciona os handlers padrões para os eventos do sistema. Os listeners padrões, em sua grande maioria, 
 *  são responsáveis por atualizaar o estado do lobby.
 * 
 *  É possível adicionar novos handlers para eventos sem sobrescrever os padrões. Isso pode ser feito para fazer ajustes
 *  bem específicos na interface, que as variáveis só estão acessíveis naquele contexto. Por exemplo, ao receber uma mensagem
 *  de sucesso ao criar um lobby, o modal (que só pode ser acessado em um contexto específico) pode ser fechado.
 *  
 *  @param socket Socket que receberá os listeners.
 */
export default function addDefaultEventsListeners(socket: Socket) {
    addDefaultLobbyEventsHandlers(socket)
    addDefaultGameEventsHandlers(socket)
    addDefaultMatchEventsHandlers(socket)
    addDefaultRoundEventsHandlers(socket)
}