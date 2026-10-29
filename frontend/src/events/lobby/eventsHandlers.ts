
import type { GameOptions, Lobby } from '@/interfaces/Lobby';

type LobbyPlayer = Lobby['players'][number];
import EventsListenersAdderBase from '../EventsListenersAdderBase';

import { handleJoinLobbyError } from './handlers/joinLobbyError';
import { handleOptionsUpdate } from './handlers/optionsUpdate';
import { handleOptionsError } from './handlers/optionsError';
import { handleJoinLobbySuccess } from './handlers/joinLobbySuccess';
import { handlePlayerJoin } from './handlers/playerJoin';
import { handlePlayerReady } from './handlers/playerReady';
import { handlePlayerReadyError } from './handlers/playerReadyError';
import { handlePlayerUnready } from './handlers/playerUnready';
import { handlePlayerUnreadyError } from './handlers/playerUnreadyError';
import { handleReconnect } from './handlers/reconnect';
import { handleStartGameError } from './handlers/startGameError';
import { handleBotAdded } from './handlers/botAdded';
import { handleBotRemoved } from './handlers/botRemoved';
import { handleBotError, type BotErrorType } from './handlers/botError';
import { handleRematch } from './handlers/rematch';
import { handleRematchError, type RematchErrorType } from './handlers/rematchError';
import { handleAppearanceUpdate } from './handlers/appearanceUpdate';
import { handleAppearanceError, type AppearanceErrorType } from './handlers/appearanceError';
import type { Socket } from 'socket.io-client';

export class LobbyEventsHandlersAdder extends EventsListenersAdderBase {

  /**
     *  Indica ao usuÃ¡rio que ele conseguiu entrar na sala.
     *  Este receberÃ¡ uma lista de todos os outros jogadores da sala e suas informaÃ§Ãµes.
     *  Logo apÃ³s isso, serÃ¡ enviado para todos os outros jogadores o evento `player-join`,
     *  para que todos adicionem este jogador ao lobby tambÃ©m (incluindo ele mesmo).
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public joinLobbySuccess(handlerFunction: (lobby: Lobby) => void): void {
    this.socket.on('join-lobby-success', handlerFunction);
  }

  /**
     *  Indica ao usuÃ¡rio que ocorreu algum erro ao entrar na sala (ou criÃ¡-la).
     *  Isso pode ocorrer devido Ã  um nome invÃ¡lido (nenhum caractere ou nome repetido),
     *  um lobby inexistente ou em partida, ou o jogador jÃ¡ estar em um outro lobby.
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public joinLobbyError(handlerFunction: (type: 'lobby-in-game'|'inexistent-lobby'|'no-name'|'repeated-name'|'player-already-in-lobby') => void): void {
    this.socket.on('join-lobby-error', handlerFunction);
  }

  /**
     *  Evento enviado para todos os jogadores indicando que um novo jogador entrou na sala.
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public playerJoin(handlerFunction: (id: string, name: string) => void): void {
    this.socket.on('player-join', handlerFunction);
  }

  /**
     *  Indica que um jogador acaba de ficar preparado para um jogo.
     *  Este evento sÃ³ Ã© acionado caso o jogador que solicitou o "ready" ainda nÃ£o estivesse pronto.
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public playerReady(handlerFunction: (id: string) => void): void {
    this.socket.on('player-ready', handlerFunction);
  }

  /**
     *  Evento enviado ao cliente que tentou se preparar para a partida, mas falhou.
     *  Isso pode acontecer quando este cliente nÃ£o estiver em uma sala, ou a sala dele jÃ¡ estÃ¡ com um jogo em andamento.
     *  Outro motivo pode ser que o lÃ­der tente se preparar, mas este nÃ£o precisa fazer isso, ele sÃ³ precisa iniciar a partida.
     *  OBS: caso o jogador solicite a preparaÃ§Ã£o e este jÃ¡ estÃ¡ preparado, nada deve acontecer (este evento nÃ£o deve ser acionado).
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public playerReadyError(handlerFunction: (type: 'in-game'|'not-in-lobby'|'leader') => void): void {
    this.socket.on('player-ready-error', handlerFunction);
  }

  /**
     *  Indica que um jogador acaba de ficar despreparado para um jogo.
     *  Este evento sÃ³ Ã© acionado caso o jogador que solicitou o "unready" ainda nÃ£o estivesse despreparado.
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public playerUnready(handlerFunction: (id: string) => void): void {
    this.socket.on('player-unready', handlerFunction);
  }

  /**
     *  Evento enviado ao cliente que tentou se despreparar para a partida, mas falhou.
     *  Isso pode acontecer quando este cliente nÃ£o estiver em uma sala, ou a sala dele jÃ¡ estÃ¡ com um jogo em andamento.
     *  Outro motivo pode ser que o lÃ­der tente se despreparar, mas este nÃ£o precisa fazer isso, ele sÃ³ precisa iniciar a partida.
     *  OBS: caso o jogador solicite a despreparaÃ§Ã£o e este jÃ¡ estÃ¡ despreparado, nada deve acontecer (este evento nÃ£o deve ser acionado).
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public playerUnreadyError(handlerFunction: (type: 'in-game'|'not-in-lobby'|'leader') => void): void {
    this.socket.on('player-unready-error', handlerFunction);
  }

  /**
     *  Evento indicando que ocorreu um erro ao iniciar a partida.
     *  Esse erro pode ocorrer caso o solicitante nÃ£o esteja em um sala, ou que estÃ¡ jÃ¡ estÃ¡ em jogo.
     *  Outro possÃ­vel erro pode ocorrer caso ele nÃ£o seja o lÃ­der ou se nem todos jogadores estÃ£o prontos para comeÃ§ar.
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public startGameError(handlerFunction: (type: 'not-leader'|'not-all-ready'|'not-in-lobby'|'already-in-game') => void): void {
    this.socket.on('start-game-error', handlerFunction);
  }

  /**
     *  Evento enviado para um usuÃ¡rio que acabou de reconectar.
     *  Este usuÃ¡rio perdeu a conexÃ£o em algum momento, seja por causa de queda na internet, ou por ter saÃ­do da pÃ¡gina do jogo.
     *
     *  @param handlerFunction funÃ§Ã£o que serÃ¡ chamada quando o evento for recebido
     */
  public reconnect(handlerFunction: (lobby: Lobby) => void): void {
    this.socket.on('reconnect', handlerFunction);
  }

  public optionsUpdate(handlerFunction: (options: GameOptions) => void): void {
    this.socket.on('options-update', handlerFunction);
  }

  public optionsError(handlerFunction: (type: 'not-leader'|'already-in-game'|'not-in-lobby'|'invalid-options') => void): void {
    this.socket.on('options-error', handlerFunction);
  }
  public botAdded(handlerFunction: (bot: LobbyPlayer) => void): void {
    this.socket.on('bot-added', handlerFunction);
  }

  public botRemoved(handlerFunction: (botId: string) => void): void {
    this.socket.on('bot-removed', handlerFunction);
  }

  public botError(handlerFunction: (type: BotErrorType) => void): void {
    this.socket.on('bot-error', handlerFunction);
  }

  public rematch(handlerFunction: () => void): void {
    this.socket.on('rematch', handlerFunction);
  }

  public rematchError(handlerFunction: (type: RematchErrorType) => void): void {
    this.socket.on('rematch-error', handlerFunction);
  }

  public appearanceUpdate(handlerFunction: (playerId: string, emote: string, color: string) => void): void {
    this.socket.on('appearance-update', handlerFunction);
  }

  public appearanceError(handlerFunction: (type: AppearanceErrorType) => void): void {
    this.socket.on('appearance-error', handlerFunction);
  }
}

export default function addDefaultLobbyHandlers(socket: Socket) {
  const lobbyEventsHandlersAdder = new LobbyEventsHandlersAdder(socket);

  lobbyEventsHandlersAdder.joinLobbySuccess(handleJoinLobbySuccess);
  // O erro de entrar na sala Ã© exibido pela interface (modal da HomePage).
  // A interface registra seu prÃ³prio listener depois deste.
  // Por isso o erro Ã© apenas registrado aqui, sem lanÃ§Ã¡-lo.
  // LanÃ§ar o erro interromperia os demais listeners do evento (ver Emitter do socket.io).
  lobbyEventsHandlersAdder.joinLobbyError((type) => {
    try {
      handleJoinLobbyError(type);
    } catch (error) {
      console.error(error);
    }
  });
  lobbyEventsHandlersAdder.playerJoin(handlePlayerJoin);
  lobbyEventsHandlersAdder.playerReady(handlePlayerReady);
  lobbyEventsHandlersAdder.playerReadyError(handlePlayerReadyError);
  lobbyEventsHandlersAdder.playerUnready(handlePlayerUnready);
  lobbyEventsHandlersAdder.playerUnreadyError(handlePlayerUnreadyError);
  lobbyEventsHandlersAdder.reconnect(handleReconnect);
  lobbyEventsHandlersAdder.optionsUpdate(handleOptionsUpdate);
  // O erro ao alterar as opÃ§Ãµes Ã© exibido pela interface (modal de opÃ§Ãµes).
  // A interface registra seu prÃ³prio listener depois deste.
  // Por isso o erro Ã© apenas registrado aqui, sem lanÃ§Ã¡-lo.
  // LanÃ§ar o erro interromperia os demais listeners do evento (ver Emitter do socket.io).
  lobbyEventsHandlersAdder.optionsError((type) => {
    try {
      handleOptionsError(type);
    } catch (error) {
      console.error(error);
    }
  });
  lobbyEventsHandlersAdder.startGameError(handleStartGameError);
  lobbyEventsHandlersAdder.botAdded(handleBotAdded);
  lobbyEventsHandlersAdder.botRemoved(handleBotRemoved);
  // O erro de bots Ã© exibido pela pÃ¡gina da sala a partir do seu prÃ³prio listener.
  lobbyEventsHandlersAdder.botError((type) => {
    try {
      handleBotError(type);
    } catch (error) {
      console.error(error);
    }
  });
  lobbyEventsHandlersAdder.appearanceUpdate(handleAppearanceUpdate);
  // O erro de aparência é exibido pela página da sala a partir do seu próprio listener.
  lobbyEventsHandlersAdder.appearanceError((type) => {
    try {
      handleAppearanceError(type);
    } catch (error) {
      console.error(error);
    }
  });
  lobbyEventsHandlersAdder.rematch(handleRematch);
  lobbyEventsHandlersAdder.rematchError((type) => {
    try {
      handleRematchError(type);
    } catch (error) {
      console.error(error);
    }
  });
}
