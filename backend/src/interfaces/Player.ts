import { Server, Socket } from 'socket.io';
import EventsEmitter from '../events/Emitter';
import Lobby from './Lobby';

interface Player {
    /** Identificador único do usuário que acionou o evento */
    playerId: string,
    /** Objeto para emitir eventos para o cliente */
    eventsEmitter: EventsEmitter,
    /** Socket do usuário */
    socket: Socket,
    /** Informações do servidor */
    io: Server,
    /** Informações do lobby que o usuário está atualmente. Será undefined se não estiver em um lobby */
    lobby?: Lobby
}
export default Player;
