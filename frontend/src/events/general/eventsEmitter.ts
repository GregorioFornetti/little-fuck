
import EventsEmitterBase from "../EventsEmitterBase";


/**
 *  Objetos dessa classe emitem eventos a respeito de um lobby (sala).
 *  
 *  Uma sala consiste em um conjunto de jogadores que desejam jogar juntos o jogo "Little fuck".
 *  Os eventos desta categoria estão ligados à criação de salas, entrar em salas, sistema de preparação, etc.
 */
export default class GeneralEventsEmitter extends EventsEmitterBase {

    /**
     *  Evento criado quando um jogador deseja sair de uma sala.
     *  O jogador sairá da sala caso ele esteja em uma, sendo enviado o evento `player-logout` (que será enviado para todos os outros da sala,
     *  para que removam ele da sala também), caso contrário será enviado o evento `logout-error` (apenas para o jogador que tentou sair).
     */
    public emitLogout() {
        this.socket.emit('logout');
    }
}