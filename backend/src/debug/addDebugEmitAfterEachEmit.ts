
import { Server } from 'socket.io';
import { createPlayer } from '../events/functions/createPlayer';

export function addDebugEmitAfterEachEmit(io: Server) {
  io.use((socket, next) => {
    const originalEmit = socket.emit;

    socket.emit = function(event, ...args) {
      originalEmit.call(this, event, ...args);

      if (event !== 'debug') {
        const player = createPlayer(io, socket.id);
        originalEmit.call(this, 'debug', player.lobby);
      }
      return true;
    };
    next();
  });
}
