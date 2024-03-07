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

## Jogo (Game)

## Partida (Match)

## Rodada (Round)

Uma rodada consiste em todos os jogadores jogarem uma das suas cartas. Ao final da rodada, será verificado qual for a maior carta para definir um campeão daquela rodada.

### start-round

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o início da rodada. 

#### Parâmetros

- player: string do id do jogador que jogará a primeira carta da rodada.

### select-card

Cliente ----> Servidor (cliente envia a mensagem ao servidor)

#### Descrição

Evento enviado para selecionar a carta que o jogador jogará na rodada atual. Caso seja de fato a vez do jogdor selecinar sua carta e ele fornecer um índice de carta válido, será colocado a nova carta na mesa para que todos possam vê-la (evento `table-update`). Caso contrário, o servidor informará ao cliente (evento `select-card-error`).

#### Parâmetros

- cardIndex: um inteiro dizendo o índice da carta selecionada.

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
- nextPlayer: string contendo o id do jogador que deverá jogar agora. Caso não tenha um próximo jogador (todos ja escolheram as cartas), esse valor será `null`

### select-card-error

Servidor ----> Cliente (servidor envia uma mensagem à um cliente específico)

#### Descrição

Mensagem enviada quando ocorrer algum erro na seleção de carta de um jogador. Este erro pode ocorrer quando um jogador enviar uma seleção de carta quando não é sua vez (pode ser que ele tenha tentado selecionar a carta, só que o tempo acabou antes da mensagem chegar ao servidor). Outro motivo é a seleção de um índice inválido, por exemplo, contando que temos 5 cartas, -1 e 5 (índice começa em 0) seriam índices inválidos. Para finalizar, outro motivo possível é que ele tenha mandado essa mensagem sem estar em um lobby.

#### Parâmetros

- type: "not-your-turn" | "invalid-index" | "not-in-lobby"

### end-round

Servidor ----> Lobby (servidor envia para todos clientes do lobby)

#### Descrição

Evento enviado para indicar o fim da rodada.

#### Parâmetros

- winner: string com o id do jogador que ganhou rodada. O valor será `null` caso ninguém tenha ganho a rodada.

- points: inteiro indicando a quantidade de pontos ganhos pelo vencedor nessa rodada.