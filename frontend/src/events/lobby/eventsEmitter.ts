
/**
 *  Evento chamado para criar um lobby. O lobby é uma sala em que vários jogadores podem se conectar a partir de um código.
 *  O jogador que criar a sala será o lider da mesma. Caso o usuário escolha um nome válido (com pelo menos um caractere)
 *  e ele mesmo não esteja em uma outra sala, este irá criar a sala, recebendo a mensgem `join-lobby-sucess`. 
 *  Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`
 * 
 *  @param name Nome do jogador
 */
export function emitCreateLobby(name: string) {
    // globalThis.socket.emit('create-lobby', name);
}


export default class LobbyEventsEmitter {
    static emitCreateLobby = emitCreateLobby;
}