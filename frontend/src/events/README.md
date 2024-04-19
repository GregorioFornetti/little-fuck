# Eventos

Os eventos são as mensagens trocadas entre o servidor e os clientes usando a biblioteca [Socket.io](https://socket.io/). Todo evento possui um emissor (cliente ou servidor) e receptores (um cliente só, um grupo de clientes ou o servidor).

Neste repositório atual temos todos os handlers, funções que recebem os eventos do servidor e realizam ações sobre eles, e emitters, funções que emitem mensagens para o servidor.

Nesta pasta, os subrepositórios agregam as funções de eventos específicos. Por exemplo, existe o subrepositório `round` que possui todas as funções handlers e emitters relacionados a uma rodada.

Cada subrepositório possui os seguintes arquivos:

- handlers: uma pasta contendo um arquivo `.ts` para cada handler de evento. O nome do arquivo está relacionado ao nome do eventos que está sendo tratado. Por exemplo, o arquivo `createLobby.ts` trata do evento `create-lobby`.
- eventsEmitter.ts: exporta uma classe que possui métodos para emitir os eventos relacionados ao tema do subrepositório (ex - todos os emissores relacionados à rodada).
- eventsHandlers.ts: exporta uma classe que auxilia na adição de novos handlers (EventsListenersAdder). Também exporta uma função que adiciona a um socket todos os handlers padrões (definidos na pasta `handlers`).

Além disso, dentro do repositório principal, também temos os seguintes arquivos:

- addDefaultEventsListeners.ts: exporta uma função que adiciona todos os handlers (ou listeners) do sistema à um socket especifico.
- EventsEmitter.ts: exporta uma classe para a criação de um Emitter. O Emitter recebe um socket e permite que sejam emitidos todos os eventos do sistema a partir desse socket.
- EventsEmitterBase.ts: uma classe com métodos padrões para serem usados nos Emitters específicos (de `rodada`, por exemplo). Todos eventsEmitters são filhos dessa classe.
- EventsListenersAdder.ts: exporta uma classe que auxilia na adição de novos handlers para os eventos do sistema. Isso pode ser útil pois podem ser adicionados mais de um handler a um evento. Por exemplo, um handler pode atualizar as informações do lobby e outro pode modificar coisas bem específicas da interface.
- EventsListenersAdderBase.ts: uma classe com métodos padrões para serem usados nos EventsListenersAdder específicos (de `rodada`, por exemplo). Todos EventsListenersAdder são filhos dessa classe.

Todos os eventos do jogo estão descritos em `docs/events.md` (a partir do diretório raíz do projeto).

## Adicionando um novo handler

Ao adicionar um novo evento emitido pelo servidor, é preciso adicionar um novo handler no cliente. Para isso, seguir os passos abaixo:

1. Criar o código handler em um dos subrepositório. Por exemplo, se for adicionar um novo evento chamado `skip-turn` à rodada, o handler deve ser criado em `round/handlers/skipTurn.ts`;

2. No arquivo `eventsHandlers.ts` do subrepositório específico, adicionar um novo método na classe de EventsListenersAdder e adicionar o handler na função adicionadore de handlers padrão. Seguindo o mesmo exemplo da etapa anterior, deverá ser criado o método `skipTurn` na classe `RoundEventsHandlersAdder`, e o handler padrão deverá ser cadastrado na função `addDefaultRoundHandlers` da seguinte forma: `roundEventsHandlersAdder.skipTurn(handleSkipTurn)`;

3. Adicionar um novo teste em `src/\_\_tests\_\_/events/testHandlers.ts` para verificar se o handler foi cadastrado corretamente, ou seja, se a função correta está sendo chamada ao emitir o evento;

4. Adicionar testes automatizados para verificar se o handler está se comportando da forma esperada. Seguindo os exemplos anteriores, o teste deveria ser criado em `src/\_\_tests\_\_/events/round/testHandleSkipTurn.ts`.

## Adicionando um novo emitter

Ao adicionar um novo evento emitido pelo cliente, é preciso adicionar um novo emitter no cliente. Para isso, seguir os passos abaixo:

1. Criar um método emissor, no arquivo `eventsEmitter.ts`, em um dos subrepositórios. Por exemplo, se for adicionar um novo evento chamado `skip-turn` à rodada, o emitter deve ser adicionado em `round/eventsEmitter.ts`, com o método se chamando `emitSkipTurn`;

2. Adicionar um novo teste em `src/\_\_tests\_\_/events/testEmitters.ts` para verificar se o emitter está enviando a mensagem corretamente ao cliente.