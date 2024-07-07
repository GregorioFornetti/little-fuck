
import { i18n } from '@/plugins/i18n';

/**
 *  Mensagem enviada quando ocorrer algum erro no palpite escolhido pelo usuário.
 *  Este erro pode ocorrer quando um jogador palpitar um número negativo, não estiver em um lobby ou não for o turno do jogador.
 *
 *  OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias
 *  igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador
 *  já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar
 *  0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleWinRoundsNumberError(type: 'not-your-turn'|'negative-is-invalid'|'not-in-lobby'|'num-wins-equals-num-cards') {
  if (type === 'not-your-turn') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_YOUR_TURN'));
  } else if (type === 'negative-is-invalid') {
    throw new Error(i18n.t('COMMON.ERROR.NEGATIVE_IS_INVALID'));
  } else if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  } else if (type === 'num-wins-equals-num-cards') {
    throw new Error(i18n.t('COMMON.ERROR.NUM_WINS_EQUALS_NUM_CARDS'));
  }
}
