
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handlePlayerLogoutError(type: 'not-in-lobby') {
  if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }
}
