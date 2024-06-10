import Lobby from '../../interfaces/Lobby';
import EmitterBase from '../EmitterBase';
import i18n from '../../plugins/i18n'

/**
 *  Objetos dessa classe emitem eventos a respeito de um lobby (sala).
 *
 *  Uma sala consiste em um conjunto de jogadores que desejam jogar juntos o jogo "Little fuck".
 *  Os eventos desta categoria estão ligados à criação de salas, entrar em salas, sistema de preparação, etc.
 */
export default class GeneralEventsEmitter extends EmitterBase {

  /**
     *  Evento indicando que um jogador acaba de sair da sala.
     *
     *  @param id identificador único do jogador que acaba de sair da partida
     */
  public emitPlayerLogout(id: string) {
    this.emitToLobby('player-logout', id);
  }

  /**
     *  Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.
     *
     *  @param type tipo de erro que ocorreu ao tentar sair da sala
     */
  public emitPlayerLogoutError(type: 'not-in-lobby') {
    this.emitToUser('player-logout-error', type);
  }

  /**
     *  Evento indicando que um erro ocorreu no servidor.
     *  Esse erro não era esperado, e provavelmente faria com que o servidor parasse, mas foi "contido".
     *  Quando isso ocorrer, o lobby será desfeito imediatamente,
     *  e um log desse evento será feito no servidor para posterior correção...
     */
  public emitInternalServerError() {
    this.emitToLobby('internal-server-error');
  }

  /**
   *  Evento que é enviado após cada modificação ocorrida no `backend`. 
   *  Esse evento irá transmitir o estado das informações de forma "cru" para o frontend, para fins de debug.
   *  Este evento só sera acionado quando o servidor for executado em modo de debug (através do comando `npm run debug`).
   */
  public emitDebug(lobby: Lobby) {
    if (!process.env.DEBUG) {
      throw new Error(i18n.t('COMMON.ERROR.NO_DEBUG_MODE'))
    }
    this.emitToLobby('debug', lobby);
    // this.emitToLobby('debug', lobby);
  }
}
