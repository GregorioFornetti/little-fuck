import { randomUUID } from 'node:crypto';
import type { Socket } from 'socket.io';
import Player from '../../../interfaces/Player';
import { MAX_LOBBY_PLAYERS, players } from '../../../global';
import { assignFreeAppearance } from '../functions/appearance';

/**
 *  Evento enviado pelo líder quando ele deseja adicionar um bot na sala.
 *  Apenas o líder pode adicionar, apenas antes do jogo começar e apenas se
 *  ainda houver vagas na sala. O bot entra sempre pronto para jogar e é
 *  registrado como um jogador comum (com um socket falso que ignora emissões),
 *  para que toda a lógica do jogo o trate como qualquer outro jogador.
 *  Todos na sala recebem o evento `bot-added`.
 *
 *  @param player Objeto contendo informações do jogador que acaba de chamar o evento
 */
export function handleAddBot(player: Player) {
  const playerInLobby = player.lobby?.players.find((lobbyPlayer) => lobbyPlayer.id === player.playerId);

  if (!player.lobby || !playerInLobby) {
    player.eventsEmitter.Lobby.emitBotError('not-in-lobby');
    return;
  }

  if (!playerInLobby.leader) {
    player.eventsEmitter.Lobby.emitBotError('not-leader');
    return;
  }

  if (player.lobby.game) {
    player.eventsEmitter.Lobby.emitBotError('already-in-game');
    return;
  }

  if (player.lobby.players.length >= MAX_LOBBY_PLAYERS) {
    player.eventsEmitter.Lobby.emitBotError('lobby-full');
    return;
  }

  let botNumber = 1;
  while (player.lobby.players.some((lobbyPlayer) => lobbyPlayer.name === `Bot ${botNumber}`)) {
    botNumber++;
  }

  const bot = {
    id: `bot-${randomUUID()}`,
    name: `Bot ${botNumber}`,
    leader: false,
    ready: true,
    bot: true,
    emote: undefined as string | undefined,
    color: undefined as string | undefined
  };
  assignFreeAppearance(player.lobby, bot);
  player.lobby.players.push(bot);

  // Socket falso: o bot nunca recebe eventos diretamente, ele só precisa
  // existir como jogador para a lógica do jogo (turnos, cartas, vidas).
  const fakeSocket = { id: bot.id, emit: () => true } as unknown as Socket;
  players[bot.id] = { socket: fakeSocket, lobby: player.lobby };

  player.eventsEmitter.Lobby.emitBotAdded(bot);
}
