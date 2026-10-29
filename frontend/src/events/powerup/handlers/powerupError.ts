import { i18n } from '@/plugins/i18n';

export type PowerupErrorType = 'no-powerup'|'invalid-target'|'wrong-phase'|'not-in-lobby'|'not-in-game'|'not-in-match';

/**
 *  Evento indicando que ocorreu um erro ao tentar usar um poder.
 *  A mensagem amigável é exibida pela página do jogo a partir do seu
 *  próprio listener deste evento.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handlePowerupError(type: PowerupErrorType) {
  throw new Error(i18n.t(`POWERUPS.ERROR.${type}`));
}
