import Player from '../../../interfaces/Player';

/**
 *  Evento enviado quando o jogador está se despreparando para começar a partida.
 *  Caso o jogador não estivesse despreparado antes, e este esteja em uma sala de um jogo que ainda não está em andamento
 *  e não seja o líder, será atualizado o status desse jogador para todos os outros integrantes da sala
 *  (chamando o evento player-unready). Caso contrário, o erro será informado para o cliente pelo evento player-unready-error.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleUnready(player: Player) {

}
