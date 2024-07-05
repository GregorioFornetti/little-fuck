
import { i18n } from '@/plugins/i18n';

/**
 *  Mensagem enviada quando ocorrer algum erro na seleção de carta de um jogador.
 *  Este erro pode ocorrer quando um jogador enviar uma seleção de carta quando não é sua vez
 *  (pode ser que ele tenha tentado selecionar a carta, só que o tempo acabou antes da mensagem chegar ao servidor).
 *  Outro motivo é a seleção de um índice inválido, por exemplo, contando que temos 5 cartas, -1 e 5 (índice começa em 0)
 *  seriam índices inválidos. Para finalizar, outro motivo possível é que ele tenha mandado essa mensagem sem estar em um lobby.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleSelectCardError(type: 'not-your-turn'|'invalid-index'|'not-in-lobby') {
  if (type === 'not-your-turn') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_YOUR_TURN'));
  } else if (type === 'invalid-index') {
    throw new Error(i18n.t('COMMON.ERROR.INVALID_INDEX'));
  } else if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  }
}
