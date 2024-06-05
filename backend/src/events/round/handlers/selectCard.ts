import Player from '../../../interfaces/Player';

/**
 *  Evento enviado para selecionar a carta que o jogador jogará na rodada atual.
 *  Caso seja de fato a vez do jogdor selecinar sua carta e ele fornecer um índice de carta válido, será colocado a nova carta
 *  na mesa para que todos possam vê-la (evento `table-update`). Caso contrário, o servidor informará o erro ao cliente
 *  (`evento select-card-error ).
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 *  @param cardIndex Índice da carta que o jogador deseja jogar
 */
export function handleSelectCard(player: Player, cardIndex: number) {

}
