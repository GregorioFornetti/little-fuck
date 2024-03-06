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