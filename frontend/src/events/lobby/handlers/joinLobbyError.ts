
import { i18n } from '@/plugins/i18n';

/**
 *  Indica ao usuário que ocorreu algum erro ao entrar na sala (ou criá-la).
 *  Isso pode ocorrer devido à um nome inválido (nenhum caractere ou nome repetido),
 *  um lobby inexistente ou em partida, ou o jogador já estar em um outro lobby.
 *
 *  @param type tipo de erro que ocorreu
 */
export function handleJoinLobbyError(type: 'lobby-in-game'|'inexistent-lobby'|'no-name'|'repeated-name'|'player-already-in-lobby') {
  if (type === 'lobby-in-game') {
    throw new Error(i18n.t('COMMON.ERROR.GAME_ALREADY_STARTED'));
  } else if (type === 'inexistent-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.LOBBY_NOT_FOUND'));
  } else if (type === 'no-name') {
    throw new Error(i18n.t('COMMON.ERROR.NO_NAME'));
  } else if (type === 'repeated-name') {
    throw new Error(i18n.t('COMMON.ERROR.REPEATED_NAME'));
  } else if (type === 'player-already-in-lobby') {
    throw new Error(i18n.t('COMMON.ERROR.ALREADY_IN_LOBBY'));
  }
}
