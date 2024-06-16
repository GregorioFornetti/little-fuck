import Player from '../../../interfaces/Player';

/**
 *  Evento para tentativa de inicio de jogo. Para que o jogo comece, é preciso que o solicitante esteja em uma sala que não
 *  esteja em andamento e seja o líder dela, além de que todos os jogadores precisam estar prontos.
 *  Caso todas essas condições sejam atendidas, o evento `start-game` será acionado, para que o jogo comece,
 *  caso contrário, será enviado ao solicitante o evento `start-game-error`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleStartGameRequest(player: Player) {

}
