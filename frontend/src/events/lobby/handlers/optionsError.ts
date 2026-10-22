import { i18n } from '@/plugins/i18n';

/**
 *  Indica ao usuário que ocorreu um erro ao tentar alterar as opções do jogo.
 *  Isso pode ocorrer caso ele não esteja em uma sala, não seja o líder, o jogo já
 *  tenha começado ou as opções enviadas sejam inválidas.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleOptionsError(type: 'not-leader'|'already-in-game'|'not-in-lobby'|'invalid-options') {
  if (type === 'not-leader') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_LEADER'));
  } else if (type === 'already-in-game') {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  } else if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  } else if (type === 'invalid-options') {
    throw new Error(i18n.t('OPTIONS.INVALID'));
  }
}
