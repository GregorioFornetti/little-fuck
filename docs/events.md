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

Abaixo, estão definidos todos os eventos que estão sendo utilizados no sistema do jogo "Little Fuck". Nele é definido os nomes dos eventos, qual é o emissor e receptor, os parâmetros que podem ser passados e uma descrição.

## Sala (Lobby)

TEXTO

---









### create-lobby

#### Descrição

#### Parâmetros

---










### join-lobby

#### Descrição

#### Parâmetros

---










### join-lobby-success

#### Descrição

#### Parâmetros

---










### join-lobby-error

#### Descrição

#### Parâmetros

---










### player-join

#### Descrição

#### Parâmetros

---










### logout

#### Descrição

#### Parâmetros

---










### player-logout

#### Descrição

#### Parâmetros

---










### ready

#### Descrição

#### Parâmetros

---










### player-ready

#### Descrição

#### Parâmetros

---










### unready

#### Descrição

#### Parâmetros

---










### player-unready

#### Descrição

#### Parâmetros

---










### start-game-request

#### Descrição

#### Parâmetros

---










### start-game-error

#### Descrição

#### Parâmetros

---










### reconnect

#### Descrição

#### Parâmetros

---










## Jogo (Game)

TEXTO

---








### start-game

#### Descrição

#### Parâmetros

---









### end-game

#### Descrição

#### Parâmetros

---









## Partida (Match)

O jogo possui diversas partidas até que sobre apenas um jogador com vidas. No começo de cada partida, cartas aleatórias do baralho serão distribuídas aos jogadores. Na primeira partida, será distribuído apenas uma carta a cada um dos jogadores, na segunda partida, duas cartas, e assim por diante. Quando o número de cartas do baralho não for suficiente para entregar cartas para todos jogadores, voltará a ser distribuido apenas uma carta.

No começo de cada partida, os jogadores verão as suas próprias cartas recebidas e deverão fazer os seus palpites. O palpite consiste em dizer quantas rodadas você acredita ganhar com as cartas que está em mão. Por exemplo, se você estiver com cartas “altas” (como alguma manilha), palpitar alguma vitória pode ser uma boa ideia. Agora, se você está com cartas “fracas”, poderá não ganhar muitas rodadas. Dependendo da sua posição na fila de palpites, você terá informação dos palpites dos outros jogadores, o que pode te ajudar a fazer o seu próprio palpite.

A primeira partida de todas sorteia aleatoriamente um jogador que iniciará palpitando, e os próximos a palpitar seguirão uma ordem. Por exemplo, no jogo de baralho, pode ser o sentido horário, mas no jogo “Little Fuck” será a ordem de entrada no lobby. Então, se o terceiro jogador for sorteado a palpitar, o próximo na mesma partida será o quarto, depois o quinto, até o último que será o segundo jogador. Na próxima partida, o primeiro a palpitar será o quarto jogador, e na próxima partida será o quinto, e assim por diante (segue a mesma ordem de palpites). 

O último jogador a palpitar possui uma restrição: este não pode palpitar um número de rodadas que o somatório de todos palpites resulte no mesmo número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).

Cada partida é composta por rodadas, definidas na próxima seção. Cada rodada pode ser vencida por apenas um jogador ou resultar em um empate (sendo uma rodada sem pontos). Os palpites são relacionados à vitórias dessas rodadas. Caso o palpite do jogador for correto, este não perderá nenhuma vida. Caso contrário, este perderá vidas, dependendo do tamanho do erro (por exemplo, se palpitar 5 e fazer apenas 2 rodadas, perde 3 vidas).

A partida com apenas uma carta é especial. Nessa partida, os jogadores não poderão ver as suas próprias cartas, mas poderão ver as cartas de todos os outros jogadores. Os palpites e a mesma mecânica se mantém, apenas essa visualização das cartas que é modificado nesse caso especial.

---










### start-match

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

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
- firstPlayer: id do primeiro jogador que deve palpitar.

---








### win-rounds-number-response

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Mensagem que o cliente enviará para indicar o seu palpite. O palpite consiste em dizer, a partir das cartas ganhas e dos outros palpites préviso, quantas cartas que o jogador acha que irá vencer. Caso seja a vez do jogador palpitar, e o palpite for válido (não é negativo), este palpite será passado para todos os outros jogadores e o próximo na fila deve palpitar (o servidor chamará o evento `win-rounds-number-update`). Caso não seja um palpite válido ou não seja a vez do jogador, o servidor irá informar esse erro a partir do evento `win-rounds-number-error`

OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).

#### Parâmetros

- numWinRounds: inteiro informando o número de rodadas que o jogador espera ganhar (palpite)

---








### win-rounds-number-update

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Após um jogador fazer um palpite válido, essa mensagem será enviada para que todos clientes da sala atualizem o status dos palpites e saibam qual é o próximo jogador que deve palpitar

#### Parâmetros

- numWinMatches: inteiro indicando o palpite do jogador que acabou de palpitar.

- nextPlayer: string indicando o id do próximo jogador que deverá palpitar. Pode ser `null` caso todos os jogadores já tenham palpitado.

---








### win-rounds-number-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Mensagem enviada quando ocorrer algum erro na seleção de carta de um jogador. Este erro pode ocorrer quando um jogador palpitar um número negativo, não estiver em um lobby ou não for o turno do jogador.

OBS: também é considerado um palpite inválido no caso do último jogador palpitar um valor que gerará um somatório de vitórias igual ao número de cartas. Por exemplo, considerando uma partida com 5 cartas, e que no momento do palpite do último jogador já foram palpitadas 4 vitórias, o último jogador não poderá palpitar apena uma vitória, ele poderá apenas palpitar 0 vitórias ou 2 ou mais vitórias (para que o somatório não dê 5 (4 + 1 = 5)).

#### Parâmetros

- type: "not-your-turn" | "negative-is-invalid" | "not-in-lobby" | "num-wins-equals-num-cards"

---





### end-match

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o fim da partida.

#### Parâmetros

- playerHealthUpdate:
```javascript
{
    idPlayer: healthUpdate,
    ...
}
// É um objeto tendo como chaves todos os ids dos jogadores do lobby. É um objeto mapeando id de jogadores para o valor que deve ser modificado em sua vida final. Ex: { 123: -1 } = jogador com id 123 perdeu uma vida
```

---







### start-special-match

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

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
                player: ...  // string: id do player que jogou a carta
            },
            ...  // São vários objetos deste tipo
        ],
        anulledCards: [ ... ]  // Uma lista de cartas e seus donos (igual o onMatch). Nesse caso, as cartas estão anuladas (por causa de empate, por exemplo), e não serão contadas na disputa.
    }
    ```
- nextPlayer: string contendo o id do jogador que deverá palpitar agora. Caso não tenha um próximo jogador (todos já palpitaram), esse valor será `null`

---











## Rodada (Round)

Uma rodada consiste em todos os jogadores jogarem uma das suas cartas. Ao final da rodada, será verificado qual for a maior carta para definir um campeão daquela rodada.

---







### start-round

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o início da rodada. 

#### Parâmetros

- player: string do id do jogador que jogará a primeira carta da rodada.

---






### select-card

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento enviado para selecionar a carta que o jogador jogará na rodada atual. Caso seja de fato a vez do jogdor selecinar sua carta e ele fornecer um índice de carta válido, será colocado a nova carta na mesa para que todos possam vê-la (evento `table-update`). Caso contrário, o servidor informará ao cliente (evento `select-card-error`).

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
- nextPlayer: string contendo o id do jogador que deverá jogar agora. Caso não tenha um próximo jogador (todos já escolheram as cartas), esse valor será `null`

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

Evento enviado para indicar o fim da rodada.

#### Parâmetros

- winner: string com o id do jogador que ganhou rodada. O valor será `null` caso ninguém tenha ganho a rodada.

- points: inteiro indicando a quantidade de pontos ganhos pelo vencedor nessa rodada.