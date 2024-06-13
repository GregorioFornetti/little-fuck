import EmitterBase from '../EmitterBase';

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
}
