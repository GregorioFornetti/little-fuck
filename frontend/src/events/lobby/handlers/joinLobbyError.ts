
/**
 *  Indica ao usuário que ocorreu algum erro ao entrar na sala (ou criá-la).
 *  Isso pode ocorrer devido à um nome inválido (nenhum caractere ou nome repetido),
 *  um lobby inexistente ou em partida, ou o jogador já estar em um outro lobby.
 *
 *  @param type tipo de erro que ocorreu
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleJoinLobbyError(type: 'lobby-in-game'|'inexistent-lobby'|'no-name'|'repeated-name'|'player-already-in-lobby') {

}
