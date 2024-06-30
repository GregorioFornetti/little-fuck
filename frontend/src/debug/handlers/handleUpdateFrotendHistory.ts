
import { frontendLobbyHistoryList } from '../globals';
import { lobby } from '@/connection';

/**
 *  Adiciona o lobby do cliente atual ao histórico (em `frontendLobbyHistoryList`). Não atualiza o histórico se o evento for `debug`.
 *
 *  @param event nome do evento que foi chamado
 *  @param args parâmetros deste evento
 */
export function handleUpdateFrontendHistory(event: string, ..._args: any[]) {
  if (event !== 'debug') {
    frontendLobbyHistoryList.value = [...frontendLobbyHistoryList.value, lobby.value];
  }
}
