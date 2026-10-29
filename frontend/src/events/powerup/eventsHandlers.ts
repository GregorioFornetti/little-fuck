import type { Socket } from 'socket.io-client';
import type { Card, PowerupType } from '@/interfaces/Lobby';
import { handlePowerupsUpdate } from './handlers/powerupsUpdate';
import { handlePowerupUsed, type PowerupUsedInfo } from './handlers/powerupUsed';
import { handlePowerupError, type PowerupErrorType } from './handlers/powerupError';
import { handleHandUpdate } from './handlers/handUpdate';
import { handlePeekResult } from './handlers/peekResult';

/**
 *  Objetos dessa classe adicionam listeners relativos aos poderes do jogo.
 */
export class PowerupEventsHandlersAdder {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public powerupsUpdate(handlerFunction: (powerups: PowerupType[], counts: { [playerId: string]: number }) => void): void {
    this.socket.on('powerups-update', handlerFunction);
  }

  public powerupUsed(handlerFunction: (info: PowerupUsedInfo) => void): void {
    this.socket.on('powerup-used', handlerFunction);
  }

  public powerupError(handlerFunction: (type: PowerupErrorType) => void): void {
    this.socket.on('powerup-error', handlerFunction);
  }

  public handUpdate(handlerFunction: (cards: Card[]) => void): void {
    this.socket.on('hand-update', handlerFunction);
  }

  public peekResult(handlerFunction: (card: Card, targetPlayerId: string) => void): void {
    this.socket.on('peek-result', handlerFunction);
  }
}

export default function addDefaultPowerupEventsHandlers(socket: Socket) {
  const powerupEventsHandlersAdder = new PowerupEventsHandlersAdder(socket);

  powerupEventsHandlersAdder.powerupsUpdate(handlePowerupsUpdate);
  powerupEventsHandlersAdder.powerupUsed(handlePowerupUsed);
  powerupEventsHandlersAdder.handUpdate(handleHandUpdate);
  powerupEventsHandlersAdder.peekResult(handlePeekResult);
  // O erro ao usar um poder é exibido pela página do jogo a partir do seu próprio listener.
  powerupEventsHandlersAdder.powerupError((type) => {
    try {
      handlePowerupError(type);
    } catch (error) {
      console.error(error);
    }
  });
}
