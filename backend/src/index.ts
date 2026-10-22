import express from 'express';
import path from 'node:path';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import addEventsListeners from './events/addEventsListeners';
import EventsEmitter from './events/Emitter';
import type Lobby from './interfaces/Lobby';
import { buildClientLobby } from './events/lobby/functions/buildClientLobby';
import { cancelOfflineRemoval } from './events/general/functions/offlineRemoval';
import { players } from './global';

dotenv.config();

const app = express();
const server = createServer(app);
const cors = process.env.NODE_ENV === 'production' ? {} : { cors: { origin: 'http://localhost:5173' } };
const io = new Server(server, {
  ...cors,
  path: process.env.SERVER_PATH ? `${process.env.SERVER_PATH}/socket.io` : '/socket.io'
});

const port = process.env.PORT || 3000;

app.use(process.env.SERVER_PATH || '/', express.static('../frontend/dist'));

// Links de convite (/<codigo-da-sala>) e qualquer outra rota do frontend caem no index.html.
// O socket.io intercepta suas próprias rotas antes do Express, então isso não o afeta.
app.get(`${process.env.SERVER_PATH || ''}/*`, (_request, response) => {
  response.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
});

io.on('connection', (socket) => {
  // O frontend envia um id estável (guardado no navegador).
  // É ele que reconhece o jogador ao reconectar. Sem ele, o id do socket é usado como antes.
  const authPlayerId = socket.handshake.auth?.playerId;
  const playerId = typeof authPlayerId === 'string' && authPlayerId.length > 0 ? authPlayerId : socket.id;

  const existing = players[playerId];
  if (existing && existing.socket.id !== socket.id) {
    // Uma conexão mais nova assumiu o lugar da anterior (ex: página recarregada).
    existing.socket.disconnect(true);
  }

  players[playerId] = { socket: socket, lobby: existing?.lobby };
  socket.join(playerId);

  // Reconectou: cancela a remoção por offline e limpa a marcação
  cancelOfflineRemoval(playerId);
  players[playerId].offlineSince = undefined;

  addEventsListeners(io, socket, playerId);

  if (existing?.lobby) {
    // O jogador já estava em uma sala: devolve o estado atual para ele voltar de onde parou
    const clientLobby = buildClientLobby(existing.lobby, playerId);
    new EventsEmitter(io, socket, existing.lobby.lobbyId).Lobby
      .emitReconnect(clientLobby as unknown as Lobby);
  }
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

export { io };
