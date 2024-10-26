import Player from '../../../interfaces/Player';

/**
 *  Evento criado quando um jogador deseja sair de uma sala.
 *  O jogador sairá da sala caso ele esteja em uma, sendo enviado o evento `player-logout` (que será enviado para todos os outros da
 *  sala, para que removam ele da sala também), caso contrário será enviado o evento `logout-error` (apenas para o jogador que tentou
 *  sair).
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
// Remover comentário abaixo quando implementar a função, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleLogout(player: Player) {

}
