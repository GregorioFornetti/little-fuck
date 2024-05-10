# Eventos

Os eventos são as mensagens trocadas entre o servidor e os clientes usando a biblioteca [Socket.io](https://socket.io/). Todo evento possui um emissor (cliente ou servidor) e receptores (um cliente só, um grupo de clientes ou o servidor).

Para emitir um evento, o código abaixo poderia ser utilizado:

```javascript
socket.emit("test", arg1, arg2);
```

Nele, estamos emitindo um evento chamado `teste`, e enviando junto com ele os parâmetros `arg1` e `arg2`.

Para recepcionar um evento, é criado uma função que será acionada sempre que um evento for recebido, como no código abaixo:

```javascript
function handleTest(arg1, arg2) {
    // ... Código aqui
}

socket.on("test", handleTest);
```

Nele, toda vez que o evento `teste` for recebido, será chamado a função `handleTest`, recebendo como parâmetros `arg1` e `arg2`, que foram enviados pelo próprio evento, pelo emissor.

Abaixo, estão definidos todos os eventos que estão sendo utilizados no sistema do jogo "Little Fuck". É definido os nomes dos eventos, qual é o emissor e receptor, os parâmetros que podem ser passados e uma descrição.









## Sala (Lobby)

Uma sala consiste em um conjunto de jogadores que desejam jogar juntos o jogo "Little fuck". Os eventos desta categoria estão ligados à criação de salas, entrar em salas, sistema de preparação, etc.

---









### create-lobby

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento chamado quando um usuário deseja criar um lobby. O lobby é uma sala em que vários jogadores podem se conectar a partir de um código. O jogador que criar a sala será o lider da mesma. Caso o usuário escolha um nome válido (com pelo menos um caractere) e ele mesmo não esteja em uma outra sala, este irá criar a sala, recebendo a mensgem `join-lobby-sucess`. Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`

#### Parâmetros

- name: string indicando o nome que o jogador deseja utilizar no jogo.

---










### join-lobby

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento chamado quando um usuário deseja se conectar a um lobby. O código do lobby é fornecido ao criador da sala, e precisa ser utilizado para a conexão dos outros jogadores na mesma sala. Caso o usuário escolha um nome válido (não igual a nenhum outro do lobby e com pelo menos um caractere), tente entrar em uma sala existente e que não esteja em jogo, e ele mesmo não esteja em uma outra sala, este irá entrar na sala, recebendo a mensagem `join-lobby-sucess`. Caso contrário, ocorrerá um erro, recebendo a mensagem `join-lobby-error`

#### Parâmetros

- lobbyId: string contendo o código (identificador) da sala a qual o jogador deseja se conectar

- name: string indicando o nome que o jogador deseja utilizar no jogo.

---










### join-lobby-success

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Indica ao usuário que ele conseguiu entrar na sala. Este receberá uma lista de todos os outros jogadores da sala e suas informações. Logo após isso, será enviado para todos os outros jogadores o evento `player-join`, para que todos adicionem este jogador ao lobby também (incluindo ele mesmo).

#### Parâmetros

- lobbyInfo: 
```javascript
{
    lobbyId: ..., // string - id do lobby
    players: [  // lista de objetos com informações sobre os jogadores
        {
            id: ..., // string - id do jogador
            name: ..., // string - nome do jogador
            leader: ..., // bool - verdadeiro se for o líder da sala
            ready: ... // bool | undefined - true se o jogador estiver pronto. Pode ser undefined caso jogo esteja em andamento
        } 
        ...
    ]
}
```

---










### join-lobby-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Indica ao usuário que ocorreu algum erro ao entrar na sala (ou criá-la). Isso pode ocorrer devido a um nome inválido (nenhum caractere ou nome repetido), um lobby inexistente ou em partida, ou o jogador já estar em um outro lobby.

#### Parâmetros

- type: "lobby-in-game" | "inexistent-lobby" | "no-name" | "repeated-name" | "player-already-in-lobby"

---










### player-join

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para todos os jogadores indicando que um novo jogador entrou na sala. 

#### Parâmetros

- id: string contendo o id do jogador que acaba de entrar na sala

- name: string contendo o nome do jogador que acaba de entrar na sala

---










### logout

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento criado quando um jogador deseja sair de uma sala. O jogador sairá da sala caso ele esteja em uma, sendo enviado o evento `player-logout` (que será enviado para todos os outros da sala, para que removam ele da sala também), caso contrário será enviado o evento `logout-error` (apenas para o jogador que tentou sair).

---









### player-logout

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento indicando que um jogador acaba de sair da sala.

#### Parâmetros

- id: string indicando o jogador que saiu.

---









### player-logout-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Evento indicando que ocorreu um erro ao sair de uma sala. Isso pode acontecer caso o cliente não estivesse em uma sala.

#### Parâmetros

- type: "not-in-lobby"

---










### ready

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento enviado quando o jogador está preparado para começar a partida. Caso o jogador não estivesse preparado antes, e este esteja em uma sala de um jogo que ainda não está em andamento e não seja o líder, será atualizado o status desse jogador para todos os outros integrantes da sala (chamando o evento `player-ready`). Caso contrário, o erro será informado para o cliente pelo evento `player-ready-error`.

---










### player-ready

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Indica que um jogador acaba de ficar preparado para um jogo. Este evento só é acionado caso o jogador que solicitou o "ready" ainda não estivesse pronto.

#### Parâmetros

- id: string do id do jogador que acaba de ficar pronto.

---








### player-ready-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Evento enviado ao cliente que tentou se preparar para a partida, mas falhou. Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento. Outro motivo pode ser que o líder tente se preparar, mas este não precisa fazer isso, ele só precisa iniciar a partida. OBS: caso o jogador solicite a preparação e este já está preparado, nada deve acontecer (este evento não deve ser acionado).

#### Parâmetros

- type: "in-game" | "not-in-lobby" | "leader"

---











### unready

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento enviado quando o jogador está se despreparando para começar a partida. Caso o jogador não estivesse despreparado antes, e este esteja em uma sala de um jogo que ainda não está em andamento e não seja o líder, será atualizado o status desse jogador para todos os outros integrantes da sala (chamando o evento `player-unready`). Caso contrário, o erro será informado para o cliente pelo evento `player-unready-error`.

---










### player-unready

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Indica que um jogador acaba de ficar despreparado para um jogo. Este evento só é acionado caso o jogador que solicitou o "unready" ainda não estivesse despreparado.

#### Parâmetros

- id: string do id do jogador que acaba de ficar despreparado.

---









### player-unready-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Evento enviado ao cliente que tentou se despreparar para a partida, mas falhou. Isso pode acontecer quando este cliente não estiver em uma sala, ou a sala dele já está com um jogo em andamento. Outro motivo pode ser que o líder tente se despreparar, mas este não precisa fazer isso, ele só precisa iniciar a partida. OBS: caso o jogador solicite a despreparação e este já está despreparado, nada deve acontecer (este evento não deve ser acionado).

#### Parâmetros

- type: "in-game" | "not-in-lobby" | "leader"

---










### start-game-request

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento para tentativa de início de jogo. Para que o jogo comece, é preciso que o solicitante esteja em uma sala que não esteja em andamento e seja o líder dela, além de que todos os jogadores precisam estar prontos. Caso todas essas condições sejam atendidas, o evento `start-game` será acionado, para que o jogo comece, caso contrário, será enviado ao solicitante o evento `start-game-error`

---










### start-game-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Evento indicando que ocorreu um erro ao iniciar a partida. Esse erro pode ocorrer caso o solicitante não esteja em uma sala, ou que esta já esteja em jogo. Outro possível erro pode ocorrer caso ele não seja o líder ou se nem todos jogadores estiverem prontos para começar.

#### Parâmetros

- type: "not-leader" | "not-all-ready" | "not-in-lobby" | "already-in-game"

---










### reconnect

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Evento enviado para um usuário que acabou de reconectar. Este usuário perdeu a conexão em algum momento, seja por causa de queda na internet, ou por ter saído da página do jogo.

#### Parâmetros

- info:
```javascript
{
    lobbyId: string,
    players: [
        {
            id: ..., // string: id do jogador
            name: ..., // string: nome do jogador
            leader: ..., // bool: verdadeiro se for o líder da sala
            ready: ... // bool | undefined: true se o jogador estiver pronto. Pode ser undefined caso jogo esteja em andamento
        } ...
    ],
    game: {  // Pode ser undefined caso não esteja em jogo
        playersHealth: {  // objeto mapeando jogadores às suas vidas
            id: ... // int: health,
            ...
        },
        currentWaitTime: ..., // int: tempo máximo em segundos até a ocorrência do próximo evento automático: ex: começar uma rodada, selecionar a carta aleatória de um jogdor que demorou muito para jogar, etc
        matchNumber: ...,  // int: número da partida atual
        roundNumber: ...,  // int: número da rodada atual
        match: {  // Pode ser undefined caso não esteja ocorrendo uma partida
            players: {  // informações de cada jogadores na partida
                id: {
                    numWonRounds: ... // int: quantidade de rodadas ganhas até o momento pelo usuário em questão
                    numWinsNeeded: ... // int | undefined: quantidade de vitórias palpitadas pelo jogador. Pode ser undefined caso não tenha palpitado ainda
                    numCards: ... // int: numero de cartas que este jogador possui no momento
                },
                ...
            },
            currentPlayerCards: [  // lista de cartas que o jogador contém
                {
                    type: ...,  // string: tipo da carta. Ex: common, joker, etc
                    value: ...  // int: poder da carta
                }
            ],
            numRounds: ..., // int: quantidade de rodadas que devem ocorrer nessa partida (número de cartas que foram dadas à cada jogador).
            nextPlayerId: ..., // string | undefined: id do jogador que deve palpitar atualmente. undefined caso todos já tenham palpitado
            round: {  // Pode ser undefined caso não esteja ocorrendo uma partida
                cards: {
                    onMatch: [  // Todas as cartas que foram que ainda não foram anuladas ou empatadas. Essa lista está ordenada da carta mais forte para a mais fraca.
                        {
                            card: {
                                type: ...,  // string: tipo da carta. Ex: common, joker, etc
                                value: ...  // inteiro: poder da carta
                            },
                            playerId: ...  // string: id do player que jogou a carta
                        },
                        ...  // São vários objetos deste tipo
                    ],
                    anulledCards: [ ... ]  // Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa.
                },
                nextPlayerId: ...  // string | undefined: id do jogador que deve jogar a carta atualmente. undefined caso todas já tenham jogado suas cartas
            }
        }
    }
}
```

---










## Jogo (Game)

Um jogo completo de "Little Fuck" consiste de diversas partidas. Todos os jogadores iniciam com uma quantidade de vida, e vão perdendo elas ao decorrer das partidas. O jogo acaba quando restar apenas um jogador com vidas.

---








### start-game

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento indicando o início de um jogo completo de "Little Fuck"

---









### end-game

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento indicando o final de um jogo completo de "Little Fuck".

#### Parâmetros

- playersRanks: uma lista de strings de ids de jogadores ordenadas. A primeira posição é o jogador que ganhou (único sobrevivente), o último a ser eliminado fica na segunda posição, até a última posição que tem o primeiro a ser eliminado.


---









## Partida (Match)

No começo de cada partida, cartas aleatórias do baralho serão distribuídas aos jogadores. Na primeira partida, será distribuído apenas uma carta a cada um dos jogadores, na segunda partida, duas cartas, e assim por diante. Quando o número de cartas do baralho não for suficiente para entregar cartas para todos jogadores, voltará a ser distribuído apenas uma carta.

No começo de cada partida, os jogadores verão as suas próprias cartas recebidas e deverão fazer os seus palpites. O palpite consiste em dizer quantas rodadas você acredita ganhar com as cartas que está em mão. Por exemplo, se você estiver com cartas “altas” (como alguma manilha), palpitar alguma vitória pode ser uma boa ideia. Agora, se você está com cartas “fracas”, poderá não ganhar muitas rodadas. Dependendo da sua posição na fila de palpites, você terá informação dos palpites dos outros jogadores, o que pode te ajudar a fazer o seu próprio palpite.

A primeira partida de todas sorteia aleatoriamente um jogador que iniciará palpitando, e os próximos a palpitar seguirão uma ordem. Por exemplo, no jogo de baralho, pode ser o sentido horário, mas no jogo “Little Fuck” será a ordem de entrada no lobby. Então, se o terceiro jogador for sorteado a palpitar, o próximo na mesma partida será o quarto, depois o quinto, até o último que será o segundo jogador. Na próxima partida, o primeiro a palpitar será o quarto jogador, e na próxima partida será o quinto, e assim por diante (segue a mesma ordem de palpites). 

O último jogador a palpitar possui uma restrição: este não pode palpitar um número de rodadas que o somatório de todos palpites resulte no mesmo número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).

Cada partida é composta por rodadas, definidas na próxima seção. Cada rodada pode ser vencida por apenas um jogador ou resultar em um empate (sendo uma rodada sem pontos). Os palpites estão relacionados à vitórias dessas rodadas. Caso o palpite do jogador for correto, este não perderá nenhuma vida. Caso contrário, este perderá vidas, dependendo do tamanho do erro (por exemplo, se palpitar 5 e fazer apenas 2 rodadas, perde 3 vidas).

A partida com apenas uma carta é especial. Nessa partida, os jogadores não poderão ver as suas próprias cartas, mas poderão ver as cartas de todos os outros jogadores. Os palpites e a mesma mecânica se mantém, apenas essa visualização das cartas que é modificada nesse caso especial.

---










### start-match

Servidor ----> Lobby (servidor envia para todos clientes do lobby, porém as mensagens são específicas para cada jogador)

#### Descrição

Evento enviado para indicar o início da partida.

#### Parâmetros

- cards: 
```javascript
[  // Lista contendo todas as cartas que o jogador tem para aquela partida
    {
        type: ...,  // string: tipo da carta. Ex: common, joker, etc
        value: ...  // inteiro: poder da carta
    },
    ...
]
```
- firstPlayerId: id do primeiro jogador que deve palpitar.

---








### win-rounds-number-response

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Mensagem que o cliente enviará para indicar o seu palpite. O palpite consiste em dizer, a partir das cartas recebidas e dos outros palpites prévios, quantas rodadas que o jogador acha que irá vencer. Caso seja a vez do jogador palpitar, e o palpite for válido (não é negativo), este palpite será passado para todos os outros jogadores e o próximo na fila deve palpitar (o servidor chamará o evento `win-rounds-number-update`). Caso não seja um palpite válido ou não seja a vez do jogador, o servidor irá informar esse erro a partir do evento `win-rounds-number-error`

OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apenas uma vitória, e sim palpitar 0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).

#### Parâmetros

- numWinRounds: inteiro informando o número de rodadas que o jogador espera ganhar (palpite)

---








### win-rounds-number-update

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar

#### Parâmetros

- numWinRounds: inteiro indicando o palpite do jogador.

- nextPlayerId: string indicando o id do próximo jogador que deverá palpitar. Pode ser `undefined` caso todos os jogadores já tenham palpitado.

---








### win-rounds-number-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Mensagem enviada quando ocorrer algum erro no palpite escolhido pelo usuário. Este erro pode ocorrer quando um jogador palpitar um número negativo, não estiver em um lobby ou não for o turno do jogador.

OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).

#### Parâmetros

- type: "not-your-turn" | "negative-is-invalid" | "not-in-lobby" | "num-wins-equals-num-cards"

---





### end-match

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o fim da partida. Uma partida acaba quando todos os jogadores já jogaram todas as suas cartas, ou seja, todas as rodadas dessa partida foram finalizadas, podendo atualizar as vidas dos jogadores dependendo das vitórias e palpites feitos.

#### Parâmetros

- playerHealthUpdate:
```javascript
{
    playerId: healthUpdate,
    ...
}
// É um objeto tendo como chaves todos os ids dos jogadores do lobby. É um objeto mapeando id de jogadores para o valor que deve ser modificado em sua vida final. Ex: { 123: -1 } = jogador com id 123 perdeu uma vida
```

---







### start-special-match

Servidor ----> Lobby (servidor envia para todos clientes do lobby, porém as mensagens são específicas para cada jogador)

#### Descrição

Iniciará a partida especial, quando todos os jogadores possuem apenas uma carta. Todos os jogadores poderão ver as cartas dos outros, porém, não poderão ver a própria carta.

Após todos os jogadores palpitarem, será acionado o evento `table-update`, mostrando o estado final da mesa para todos os jogadores e logo em seguida o evento `end-round` será também acionado. Depois de um tempo, será acionado o evento `end-match`.

#### Parâmetros

- cards: um objeto contendo as cartas de todos os outros jogadores
    ```javascript
    {
        onMatch: [  // Todas as cartas que foram que ainda não foram anuladas ou empatadas. Essa lista está ordenada da carta mais forte para a mais fraca.
            {
                cardInfo: {
                    type: ...,  // string: tipo da carta. Ex: common, joker, etc
                    value: ...  // inteiro: poder da carta
                },
                playerId: ...  // string: id do player que jogou a carta
            },
            ...  // São vários objetos deste tipo
        ],
        anulledCards: [ ... ]  // Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa.
    }
    ```
- firstPlayerId: id do primeiro jogador que deve palpitar.

---











## Rodada (Round)

Uma rodada consiste em todos os jogadores jogarem uma das suas cartas. Ao final da rodada, será verificado qual foi a maior carta para definir um campeão daquela rodada. Podem ocorrer empates também, caso todas as cartas empatem, não concedendo a vitória a nenhum dos jogadores.

---







### start-round

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o início da rodada. 

#### Parâmetros

- playerId: string do id do jogador que jogará a primeira carta da rodada.

---










### select-card

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento enviado para selecionar a carta que o jogador jogará na rodada atual. Caso seja de fato a vez do jogador selecionar sua carta e ele fornecer um índice de carta válido, será colocado a nova carta na mesa para que todos possam vê-la (evento `table-update`). Caso contrário, o servidor informará o erro ao cliente (evento `select-card-error`).

#### Parâmetros

- cardIndex: um inteiro dizendo o índice da carta selecionada.

---










### table-update

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Após um jogador selecionar uma carta, essa mensagem será enviada para que todos clientes da sala atualizem o status da mesa e saibam qual é o próximo jogador que deve jogar

#### Parâmetros

- cards: 
    ```javascript
    {
        onMatch: [  // Todas as cartas que foram jogadas na rodada e que ainda não foram anuladas ou empatadas. Essa lista está ordenada da carta mais forte para a mais fraca.
            {
                cardInfo: {
                    type: ...,  // string: tipo da carta. Ex: common, joker, etc
                    value: ...  // inteiro: poder da carta
                },
                player: ...  // string: id do player que jogou a carta
            },
            ...  // São vários objetos deste tipo
        ],
        anulledCards: [ ... ]  // Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa.
    }
    ```
- nextPlayerId: string contendo o id do jogador que deverá jogar agora. Caso não tenha um próximo jogador (todos já escolheram as cartas), esse valor será `undefined`

---












### select-card-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Mensagem enviada quando ocorrer algum erro na seleção de carta de um jogador. Este erro pode ocorrer quando um jogador enviar uma seleção de carta quando não é sua vez (pode ser que ele tenha tentado selecionar a carta, só que o tempo acabou antes da mensagem chegar ao servidor). Outro motivo é a seleção de um índice inválido, por exemplo, contando que temos 5 cartas, -1 e 5 (índice começa em 0) seriam índices inválidos. Para finalizar, outro motivo possível é que ele tenha mandado essa mensagem sem estar em um lobby.

#### Parâmetros

- type: "not-your-turn" | "invalid-index" | "not-in-lobby"

---












### end-round

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o fim da rodada. Uma rodada acaba quando todos os jogadores já jogaram as suas cartas.

#### Parâmetros

- winnerId: string com o id do jogador que ganhou rodada. O valor será `undefined` caso ninguém tenha ganho a rodada.

- points: inteiro indicando a quantidade de pontos ganhos pelo vencedor nessa rodada.