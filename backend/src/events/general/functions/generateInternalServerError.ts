
import Player from '../../../interfaces/Player';

/**
 *  Essa função deve ser chamada quando ocorrer um erro inesperado no servidor. Essa função irá informar os clientes da ocorrência
 *  do erro, finalizando o lobby de todos os jogadores (para não ocorrer erros piores, podendo "crashar" o servidor). Também
 *  registra o erro no console do servidor.
 *
 *  @param player Player que será usado para emitir o evento de erro para o(s) cliente(s).
 *  @param error Erro que será registrado no console do servidor.
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateInternalServerError(player: Player, error: Error): void {

}
