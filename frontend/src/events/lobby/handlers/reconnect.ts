import type { Lobby } from '@/interfaces/Lobby';
import { lobby } from '@/connection';

/**
 *  Evento enviado para um usuário que acabou de reconectar.
 *  Este usuário perdeu a conexão em algum momento, seja por causa de queda na internet, ou por ter saído da página do jogo.
 *  O servidor devolve o estado atual da sala para o jogador voltar exatamente de onde parou.
 *
 *  @param lobby informações da sala em que o jogador está
 */
export function handleReconnect(lobbyResponse: Lobby) {
  // Se o jogo já tinha acabado nesta sessão, mantém a classificação na tela
  const gameRanking = lobby.value?.gameRanking;

  lobby.value = lobbyResponse;

  if (gameRanking && !lobbyResponse.game) {
    lobby.value.gameRanking = gameRanking;
  }
}
