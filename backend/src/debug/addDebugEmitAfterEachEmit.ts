
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

    socket.onAny((event, ...args) => {
      console.log(`Received event: ${event}`);
      console.log(`From player with id: ${socket.id}`);
      console.log(`With the following arguments: ${JSON.stringify(args)}\n`);
    });

    next();
  });
}
