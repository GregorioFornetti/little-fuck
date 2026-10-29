import EventsEmitterBase from '../EventsEmitterBase';
import type { PowerupType } from '@/interfaces/Lobby';

/**
 *  Objetos dessa classe emitem eventos a respeito dos poderes (power-ups) do jogo.
 */
export default class PowerupEventsEmitter extends EventsEmitterBase {
  /**
   *  Evento enviado para usar um dos poderes guardados do jogador.
   *
   *  @param type tipo do poder que será usado
   *  @param targetPlayerId id do jogador alvo, quando o poder precisa de um alvo
   */
  public emitUsePowerup(type: PowerupType, targetPlayerId?: string) {
    this.socket.emit('use-powerup', { type, targetPlayerId });
  }
}
