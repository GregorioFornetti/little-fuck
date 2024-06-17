import Lobby from '../../interfaces/Lobby';

/**
 *  Coleta o próximo jogador da lista, logo depois do jogador fornecido atualmente. O jogador coletado será um jogador vivo.
 *  Caso chege ao final da lista, será dado uma "volta" na lista, voltando ao primeiro jogador da lista.
 *  Caso o jogador fornecido não seja encontrado ou o lobby não tenha um jogo em andamento, será lançado um erro.
 *
 *  @param currentPlayerId id do jogador atual, será coletado o id próximo à ele
 *  @param lobby informações do lobby (e do jogo) atual
 *  @returns o próximo id
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getNextPlayerId(currentPlayerId: string, lobby: Lobby): string {

}
