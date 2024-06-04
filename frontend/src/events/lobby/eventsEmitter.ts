
import EventsEmitterBase from "../EventsEmitterBase";


/**
 *  Objetos dessa classe emitem eventos a respeito de um lobby (sala).
 *  
 *  Uma sala consiste em um conjunto de jogadores que desejam jogar juntos o jogo "Little fuck".
 *  Os eventos desta categoria estão ligados à criação de salas, entrar em salas, sistema de preparação, etc.
 */
export default class LobbyEventsEmitter extends EventsEmitterBase {
    
    /**
     *  Evento chamado para criar um lobby. O lobby é uma sala em que vários jogadores podem se conectar a partir de um código.
     *  O jogador que criar a sala será o lider da mesma. Caso o usuário escolha um nome válido (com pelo menos um caractere)
     *  e ele mesmo não esteja em uma outra sala, este irá criar a sala, recebendo a mensgem `join-lobby-sucess`. 
     *  Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`
     * 
     *  @param name Nome do jogador
     */
    public emitCreateLobby(name: string) {
        this.socket.emit('create-lobby', name);
    }

    /**
     *  Evento chamado quando um usuário deseja se conectar a um lobby.
     *  O código do lobby é fornecido ao criador da sala, e precisa ser utilizado para a conexão dos outros jogadores na mesma sala. 
     *  Caso o usuário escolha um nome válido (não igual a nenhum outro do lobby e com pelo menos um caractere), tente entrar em uma 
     *  sala existente e que não esteja em jogo, e ele mesmo não esteja em uma outra sala, este irá entrar na sala,
     *  recebendo a mensagem `join-lobby-sucess`. 
     *  Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`.
     * 
     *  @param lobbyId código (identificador) da sala a qual o jogador deseja se conectar
     *  @param name nome que o jogador deseja utilizar no jogo.
     */
    public emitJoinLoby(lobbyId: string, name: string) {
        this.socket.emit('join-lobby', lobbyId, name);
    }

    /**
     *  Evento enviado quando o jogador está preparado para começar a partida. 
     *  Caso o jogador não estivesse preparado antes, e este esteja em uma sala de um jogo que ainda não está em andamento e não seja o líder,
     *  será atualizado o status desse jogador para todos os outros integrantes da sala (chamando o evento `player-ready`).
     *  Caso contrário, o erro será informado para o cliente pelo evento `player-ready-error`.
     */
    public emitReady() {
        this.socket.emit('ready');
    }

    /**
     *  Evento enviado quando o jogador está se despreparando para começar a partida.
     *  Caso o jogador não estivesse despreparado antes, e este esteja em uma sala de um jogo que ainda não está em andamento e não seja o líder,
     *  será atualizado o status desse jogador para todos os outros integrantes da sala (chamando o evento `player-unready`).
     *  Caso contrário, o erro será informado para o cliente pelo evento `player-unready-error`.
     */
    public emitUnready() {
        this.socket.emit('unready');
    }

    /**
     *  Evento para tentativa de inicio de jogo. 
     *  Para que o jogo comece, é preciso que o solicitante esteja em uma sala que não esteja em andamento e seja o líder dela,
     *  além de que todos os jogadores precisam estar prontos.
     *  Caso todas essas condições sejam atendidas, o evento `start-game` será acionado, para que o jogo comece, caso contrário,
     *  será enviado ao solicitante o evento `start-game-error`.
     */
    public emitStartGameRequest() {
        this.socket.emit('start-game-request');
    }
}