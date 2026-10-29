import { i18n } from '@/plugins/i18n';

export type RematchErrorType = 'not-leader' | 'already-in-game' | 'not-in-lobby';

/**
 *  Evento indicando que ocorreu um erro ao pedir uma revanche.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleRematchError(type: RematchErrorType) {
  if (type === 'not-leader') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_LEADER'));
  } else if (type === 'already-in-game') {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  } else if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }
}
