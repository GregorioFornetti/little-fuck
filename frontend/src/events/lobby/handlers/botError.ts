import { i18n } from '@/plugins/i18n';

export type BotErrorType = 'not-leader' | 'already-in-game' | 'not-in-lobby' | 'lobby-full' | 'bot-not-found';

/**
 *  Evento indicando que ocorreu um erro ao adicionar ou remover um bot.
 *  A mensagem amigável é exibida pela página da sala a partir do seu próprio
 *  listener deste evento.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleBotError(type: BotErrorType) {
  if (type === 'not-leader') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_LEADER'));
  } else if (type === 'already-in-game') {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  } else if (type === 'not-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY'));
  } else if (type === 'lobby-full') {
    throw new Error(i18n.t('LOBBY.BOT_ERROR_LOBBY_FULL'));
  } else if (type === 'bot-not-found') {
    throw new Error(i18n.t('LOBBY.BOT_ERROR_NOT_FOUND'));
  }
}
