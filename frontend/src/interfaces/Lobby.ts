
/**
 *  Interface que contém as informações
 */
export type CardSuit = 'clubs'|'hearts'|'spades'|'diamonds';

export interface Card {
    /** Tipo da carta */
    type: 'common',
    /** O poder da carta. Cartas com valores mais altos ganham das outras com valores mais baixos. */
    value: number,
    /** Naipe da carta. Presente apenas nas cartas do tipo manilha velha */
    suit?: CardSuit,
    /** Rotulo da carta (4, 5, 6, 7, Q, J, K, A, 2, 3). Presente apenas nas cartas do tipo manilha velha */
    label?: string
}

/**
 *  Interface que contém as informações de uma carta que está na mesa de uma rodada.
 */
export interface RoundCard {
    /** Informações da carta contida na mesa da rodada */
    card: Card,
    /** ID do jogador que colocou essa carta na mesa */
    playerId: string
    /** Verdadeiro se a força desta carta está escondida dos jogadores (poder hide-card-strength) */
    hidden?: boolean
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
    cards: RoundCards | SpecialMatchCards,
    /** Id do jogador que deve jogar a carta atualmente. undefined caso todas já tenham jogado suas cartas */
    nextPlayerId?: string
    /** Verdadeiro se a força das cartas está invertida nesta rodada (poder reverse-card-strengths) */
    reversed?: boolean,
    /** Jogadores que tiveram a jogada cancelada nesta rodada (poder cancel-card) */
    skippedPlayerIds?: string[]
}

/**
 * Interface que contém as informações de um jogador na Partida
 */
export interface PlayerMatch {
    /** Quantidade de cartas que o jogador possui */
    numCards: number,
    /** Quantidade de rodadas ganhas até o momento pelo usuário em questão */
    numWonRounds: number,
    /** Quantidade de vitórias palpitadas pelo jogador. Pode ser undefined caso não tenha palpitado ainda */
    numWinsNeeded?: number
}

/**
 *  Interface que contém as informações de uma partida, como as cartas dos jogadores, os seus palpites, etc.
 */
export interface Match {
    /** Modificadores de força pendentes (poderes increase/decrease), aplicados na próxima carta jogada de cada jogador */
    pendingStrength?: { [playerId: string]: number },
    /** Informações de cada jogadores na partida */
    players: {
        [playerId: string]: PlayerMatch;
    },
    /** Cartas que o jogador atual possui */
    currentPlayerCards: Card[],
    /** Quantidade de rodadas que devem ocorrer nessa partida (número de cartas que foram dadas à cada jogador). */
    numRounds: number,
    /** Id do jogador que deve palpitar atualmente. undefined caso todos já tenham palpitado */
    nextPlayerId?: string,
    /** Carta virada no início da partida (apenas no tipo manilha nova). Define as manilhas da partida */
    turnedCard?: Card,
    /** Informações da rodada. Pode ser undefined se ainda não estiver ocorrendo uma rodada */
    round?: Round
}

/**
 *  Interface que contém o resultado de uma rodada já finalizada, como as cartas que ficaram na mesa e o vencedor.
 */
export interface FinishedRound {
    /** Cartas que ficaram na mesa ao final da rodada */
    cards: RoundCards,
    /** Id do jogador que venceu a rodada. Será um id qualquer do lobby em caso de empate */
    winnerId: string,
    /** Pontos ganhos pelo vencedor. Será 0 em caso de empate */
    points: number
}

/**
 *  Interface que contém as informações de um jogo completo de "little fuck".
 *  Contém informações da quantidade de vidas dos jogadores, de partidas e rodadas em andamento
 */
/** Resumo de um jogador em uma partida finalizada, para exibição entre partidas e no histórico. */
export interface MatchSummaryRow {
    /** Id do jogador */
    playerId: string,
    /** Quantidade de rodadas que o jogador palpitou que ganharia */
    guessed: number,
    /** Quantidade de rodadas que o jogador realmente ganhou */
    won: number,
    /** Variação de vidas do jogador na partida (negativo quando ele perdeu vidas) */
    healthDelta: number
}

/** Registro de uma partida finalizada no histórico do jogo. */
export interface MatchHistoryEntry {
    /** Número da partida */
    matchNumber: number,
    /** Resumo de cada jogador na partida */
    rows: MatchSummaryRow[],
    /** Vencedores de cada rodada da partida, na ordem em que aconteceram */
    roundWinners: { winnerId: string, points: number }[],
    /** Mesa final de cada rodada da partida, para o replay */
    rounds?: FinishedRound[],
    /** Carta virada da partida (manilha nova/paraguaia) */
    turnedCard?: Card,
    /** Tipo de cartas da partida */
    cardType?: CardType
}

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
    match?: Match,
    /** Resultado da última rodada finalizada, para exibir a mesa final antes da próxima rodada. Pode ser undefined se nenhuma rodada terminou ainda */
    lastRound?: FinishedRound
    /** Resumo da última partida finalizada. Pode ser undefined se nenhuma partida terminou ainda */
    lastMatchSummary?: MatchSummaryRow[],
    /** Histórico de todas as partidas finalizadas deste jogo */
    history?: MatchHistoryEntry[],
    /** Vencedores das rodadas da partida atual, para montar o histórico ao final dela */
    currentRoundWinners?: { winnerId: string, points: number }[],
    /** Mesas finais das rodadas da partida atual, para o replay no histórico */
    currentRounds?: FinishedRound[]

}

/**
 *  Interface que contém as informações de um lobby, por exemplo, jogadores, informações do jogo em andamento, etc.
 */
/**
 *  Opções de jogo configuráveis pelo líder da sala antes do jogo começar.
 */
export type PowerupType = 'swap-cards'|'cancel-card'|'reverse-card-strengths'|'random-card'|'hide-card-strength'|'increase-card-strength'|'decrease-card-strength'|'peek-card'|'shield';

export interface PowerupOptions {
    /** Poderes ativados pelo líder para o jogo */
    enabled: PowerupType[],
    /** Quantidade de poderes aleatórios que cada jogador recebe por vez */
    perGrant: number,
    /** Quando os poderes são dados: no início de cada partida ou apenas no início do jogo */
    grantTiming: 'match'|'game'
}

export type CardBackDesign = 'classic'|'stripes'|'lozenges'|'dots';

export type TableTheme = 'classic'|'midnight'|'wine'|'charcoal';

export type CardType = 'numbered'|'manilha-velha'|'manilha-nova'|'manilha-paraguaia';

export interface GameOptions {
    /** Quantidade de vidas que cada jogador começa o jogo */
    initialHealth: number,
    /** Segundos que um jogador tem para palpitar ou jogar uma carta antes da ação automática */
    playerActionTimeSeconds: number,
    /** Segundos que a mesa final de uma rodada fica visível antes da próxima rodada */
    roundEndTimeSeconds: number,
    /** Tipo de cartas do jogo: numeradas (padrao) ou manilha velha */
    cardType: CardType
    /** Cartas numeradas personalizadas do jogo (apenas no tipo numbered). Sem ela, as cartas padrão são usadas */
    customCards?: number[],
    /** Tema visual da mesa de jogo */
    theme?: TableTheme,
    /** Desenho do verso das cartas */
    cardBack?: CardBackDesign,
    /** Configurações dos poderes do jogo. Pode ser undefined em salas antigas (sem poderes) */
    powerups?: PowerupOptions,
}

export interface Lobby {
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
        /** Verdadeiro se for um bot (jogador controlado pelo computador). Pode ser undefined para jogadores humanos */
        bot?: boolean,
        /** Emote (emoji) que representa o jogador. Único dentro da sala */
        emote?: string,
        /** Cor que representa o jogador (hex). Única dentro da sala */
        color?: string,
        /** Poderes que o jogador possui guardados. Só vem preenchido para o próprio jogador */
        powerups?: PowerupType[],
        /** Quantidade de poderes guardados (visível para todos) */
        powerupCount?: number,
        /** Verdadeiro se o jogador estiver pronto. Pode ser undefined caso jogo esteja em andamento */
        ready?: boolean
    }[],
    /** Informações do jogo. Pode ser undefined se ainda não estiver ocorrendo um jogo */
    game?: Game,
    /** Classificação final do último jogo, com ids de jogadores do vencedor ao primeiro eliminado. Pode ser undefined se nenhum jogo terminou */
    gameRanking?: string[],
    /** Opções do jogo definidas pelo líder da sala */
    options?: GameOptions
}
