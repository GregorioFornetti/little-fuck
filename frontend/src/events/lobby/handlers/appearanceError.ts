import { i18n } from '@/plugins/i18n';

export type AppearanceErrorType = 'emote-taken'|'color-taken'|'invalid-appearance'|'already-in-game'|'not-in-lobby';

/**
 *  Evento indicando que ocorreu um erro ao tentar alterar a aparência.
 *  A página da sala registra seu próprio listener para exibir o erro;
 *  este manipulador padrão apenas lança o erro traduzido, e o registro
 *  do listener o captura para não interromper os demais listeners.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleAppearanceError(type: AppearanceErrorType) {
  const messages: Record<AppearanceErrorType, string> = {
    'emote-taken': i18n.t('APPEARANCE.ERROR_KEY.emote-taken'),
    'color-taken': i18n.t('APPEARANCE.ERROR_KEY.color-taken'),
    'invalid-appearance': i18n.t('APPEARANCE.ERROR_KEY.invalid-appearance'),
    'already-in-game': i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'),
    'not-in-lobby': i18n.t('COMMON.ERROR.NOT_IN_LOBBY')
  };
  throw new Error(messages[type]);
}
