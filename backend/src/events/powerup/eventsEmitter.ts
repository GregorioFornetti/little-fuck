import EmitterBase from '../EmitterBase';
import { Card, PowerupType } from '../../interfaces/Lobby';

export type PowerupErrorType = 'no-powerup'|'invalid-target'|'wrong-phase'|'not-in-lobby'|'not-in-game'|'not-in-match';
export interface PowerupUsedInfo {
  type: PowerupType,
  userId: string,
  targetPlayerId?: string,
  pendingStrengthTotal?: number
}

/**
 *  Objetos dessa classe emitem eventos a respeito dos poderes (power-ups) do jogo.
 */
export default class PowerupEventsEmitter extends EmitterBase {

  /**
   *  Evento enviado para cada jogador com os seus próprios poderes guardados
   *  e a quantidade de poderes de todos os jogadores da sala.
   *
   *  @param powerupsByPlayerId mapa com os poderes (próprios) e contagens por jogador
   */
  public emitPowerupsUpdate(powerupsByPlayerId: { [playerId: string]: { powerups: PowerupType[], counts: { [playerId: string]: number } } }) {
    this.emitToSpecificLobbyPlayers('powerups-update', powerupsByPlayerId);
  }

  /**
   *  Evento enviado para todos os jogadores da sala indicando que um poder foi usado.
   *
   *  @param info informações sobre o poder usado, quem usou e o alvo
   */
  public emitPowerupUsed(info: PowerupUsedInfo) {
    this.emitToLobby('powerup-used', info);
  }

  /**
   *  Evento enviado para um usuário indicando que ocorreu um erro ao tentar usar um poder.
   *
   *  @param type tipo de erro que ocorreu
   */
  public emitPowerupError(type: PowerupErrorType) {
    this.emitToUser('powerup-error', type);
  }

  /**
   *  Evento enviado para um jogador com a nova mão dele (após uma troca de cartas, por exemplo).
   *
   *  @param cards nova mão do jogador
   */
  /**
   *  Evento enviado apenas ao jogador que usou o poder peek-card, revelando
   *  uma carta da mão do jogador alvo.
   *
   *  @param card carta revelada do alvo
   *  @param targetPlayerId id do jogador alvo
   */
  public emitPeekResult(card: Card, targetPlayerId: string) {
    this.emitToUser('peek-result', card, targetPlayerId);
  }

  public emitHandUpdate(cards: Card[]) {
    this.emitToUser('hand-update', cards);
  }
}
