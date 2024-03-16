
/**
 *  Interface que contém as informações 
 */
interface Card {
    /** Tipo da carta */
    type: "common",
    /** O poder da carta. Cartas com valores mais altos ganham das outras com valores mais baixos. */
    value: number
}

/**
 *  Interface que contém as informações de uma carta que está na mesa de uma rodada.
 */
interface RoundCard {
    /** Informações da carta contida na mesa da rodada */
    card: Card,
    /** ID do jogador que colocou essa carta na mesa */
    playerId: string
}

/**
 *  Interface que contém as informações de uma rodada, como as cartas que estão na mesa e seus rankings.
 */
export interface Round {
    /** Cartas que estão atualmente na mesa */
    cards: {
        /** Todas as cartas que foram que ainda não foram anuladas ou empatadas. Essa lista está ordenada da carta mais forte para a mais fraca. */
        onMatch: RoundCard[],
        /** Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa. */
        anulledCards: RoundCard[]
    },
    /** id do jogador que deve jogar a carta atualmente. undefined caso todas já tenham jogado suas cartas */
    nextPlayerId?: string
}

/**
 *  Interface que contém as informações de uma partida, como as cartas dos jogadores, os seus palpites, etc.
 */
export interface Match {
    /** Informações de cada jogadores na partida */
    players: {
        [playerId: string]: {
            /** Quantidade de cartas que o jogador possui */
            numCards: number,
            /** Quantidade de rodadas ganhas até o momento pelo usuário em questão */
            numWonRounds: number,
            /** Quantidade de vitórias palpitadas pelo jogador. Pode ser undefined caso não tenha palpitado ainda */
            numWinsNeeded?: number
        }
    },
    /** Cartas que o jogador atual possui */
    currentPlayerCards: Card[],
    /** Quantidade de rodadas que devem ocorrer nessa partida (número de cartas que foram dadas à cada jogador). */
    numRounds: number,
    /** Id do jogador que deve palpitar atualmente. undefined caso todos já tenham palpitado */
    nextPlayerId?: string,
    /** Informações da rodada. Pode ser undefined se ainda não estiver ocorrendo uma rodada */
    round?: Round
}


/**
 *  Interface que contém as informações de um jogo completo de "little fuck". 
 *  Contém informações da quantidade de vidas dos jogadores, de partidas e rodadas em andamento
 */
export interface Game {
    /** Objeto mapeando jogadores às suas quantidades de vidas */
    playersHealth: {
        [playerId: string]: number
    },
    /** Tempo máximo em segundos até a ocorrência do próximo evento automático. Ex: começar uma rodada, selecionar a carta aleatória de um jogdor que demorou muito para jogar, etc */
    currentWaitTime: number,
    /** Número da partida atual */
    matchNumber: number,
    /** Número da rodada atual */
    roundNumber: number,
    /** Informações da partida. Pode ser undefined se ainda não estiver ocorrendo uma partida */
    match?: Match
}

/**
 *  Interface que contém as informações de um lobby, por exemplo, jogadores, informações do jogo em andamento, etc.
 */
export default interface Lobby {
    /** Informações dos jogadores que estão no lobby */
    players: {
        /** Identificador único do jogador */
        id: string,
        /** Nome do jogador. Este nome que será visto por todos os outros jogadores */
        name: string,
        /** Verdadeiro se for o líder da sala. */
        leader: boolean,
        /** Verdadeiro se o jogador estiver pronto. Pode ser undefined caso jogo esteja em andamento */
        ready?: boolean
    }[],
    /** Informações do jogo. Pode ser undefined se ainda não estiver ocorrendo um jogo */
    game?: Game
}
