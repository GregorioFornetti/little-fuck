
import Timer from "easytimer.js";

/**
 *  Interface que contém as informações 
 */
export interface Card {
    /** Tipo da carta */
    type: "common",
    /** O poder da carta. Cartas com valores mais altos ganham das outras com valores mais baixos. */
    value: number
}

/**
 *  Interface que contém as informações de uma carta que está na mesa de uma rodada.
 */
export interface RoundCard {
    /** Informações da carta contida na mesa da rodada */
    card: Card,
    /** ID do jogador que colocou essa carta na mesa */
    playerId: string
}

/**
 *  Interface que contém as informações de uma partida especial, como as cartas que estão na mesa e seus rankings. No caso, os jogadores 
 *  verão as cartas de todos os outros jogadores, e não as suas próprias.
 */
export interface SpecialMatchCards {
    /** Todas as cartas (dos outros jogadores) que ainda não foram anuladas ou empatadas. Essa lista está ordenada da carta mais forte para a mais fraca. */
    onMatch: RoundCard[],
    /** Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa. Apenas contém cartas de outros jogadores */
    anulledCards: RoundCard[]
}

/**
 *  Interface que contém as informações das cartas de uma rodada.
 */
export interface RoundCards {
    /** Todas as cartas que foram que ainda não foram anuladas ou empatadas. Essa lista está ordenada da carta mais forte para a mais fraca. */
    onMatch: RoundCard[],
    /** Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa. */
    anulledCards: RoundCard[]
}

/**
 *  Interface que contém as informações de uma rodada, como as cartas que estão na mesa e seus rankings.
 */
export interface Round {
    /** Cartas que estão atualmente na mesa */
    cards: RoundCards,
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
            /** Cartas que o jogador possui para a partida */
            cards: Card[],
            /** Quantidade de rodadas ganhas até o momento pelo usuário em questão */
            numWonRounds: number,
            /** Quantidade de vitórias palpitadas pelo jogador. Pode ser undefined caso não tenha palpitado ainda */
            numWinsNeeded?: number
        }
    },
    /** Id do jogador que deve palpitar atualmente. undefined caso todos já tenham palpitado */
    nextPlayerId?: string,
    /** Id do jogador que deve jogar (ou jogou) a primeira carta da rodada que estiver em andamento */
    roundFirstPlayerId?: string,
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
    /** Timer countdown até a ocorrência do próximo evento automático. Ex: começar uma rodada, selecionar a carta aleatória de um jogdor que demorou muito para jogar, etc */
    timer: Timer,
    /** Número da partida atual */
    matchNumber: number,
    /** Número da rodada atual */
    roundNumber: number,
    /** O id do jogador que iniciou palpitando na última (ou atual) partida */
    currentPlayerId: string,
    /** Quantidade de rodadas (ou cartas) que devem ocorrer na última (ou atual) partida */
    numRounds: number,
    /** Lista de ids de jogadores que "morreram" (não possuem mais vidas / foram eliminados). Estará em ordem inversa de eliminação, ou seja, o primeiro da lista será o último que foi eliminado até o momento */
    deadPlayersIds: string[],
    /** Status do jogo é um texto indicando em qual situação está o jogo. Importante para o momento de recadastrar funções no timer caso um jogador faça logout */
    status: "starting_match"|"waiting_num_win_response"|"starting_round"|"waiting_select_card"|"ending_match"|"ending_game",
    /** Informações da partida. Pode ser undefined se ainda não estiver ocorrendo uma partida */
    match?: Match
}

/**
 *  Interface que contém as informações de um lobby, por exemplo, jogadores, informações do jogo em andamento, etc.
 */
export default interface Lobby {
    /** Identficador único do lobby atual */
    lobbyId: string,
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
