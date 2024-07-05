
import { i18n } from '@/plugins/i18n';

/**
 *  Evento indicando que ocorreu um erro ao iniciar a partida.
 *  Esse erro pode ocorrer caso o solicitante não esteja em um sala, ou que está já está em jogo.
 *  Outro possível erro pode ocorrer caso ele não seja o líder ou se nem todos jogadores estão prontos para começar.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleStartGameError(type: 'not-leader'|'not-all-ready'|'not-in-lobby'|'already-in-game') {
  if (type === 'not-leader') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_LEADER'));
  } else if (type === 'not-all-ready') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_ALL_READY'));
  } else if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  } else if (type === 'already-in-game') {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  }
}
