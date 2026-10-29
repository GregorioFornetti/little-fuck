import '../setupTests';
import { handleBotAdded } from '@/events/lobby/handlers/botAdded';
import { handleBotRemoved } from '@/events/lobby/handlers/botRemoved';
import { handleRematch } from '@/events/lobby/handlers/rematch';
import { lobby } from '@/connection';

describe('bots e revanche (frontend)', () => {
  const leader = { id: 'p1', name: 'Leader', leader: true, ready: false };
  const guest = { id: 'p2', name: 'Guest', leader: false, ready: true };

  test('adiciona o bot na sala sem duplicar', () => {
    lobby.value = { lobbyId: '123', players: [leader, guest] };
    const bot = { id: 'bot-1', name: 'Bot 1', leader: false, ready: true, bot: true };

    handleBotAdded(bot);
    handleBotAdded(bot);

    expect(lobby.value.players).toHaveLength(3);
    expect(lobby.value.players[2]).toEqual(bot);
  });

  test('remove o bot da sala', () => {
    lobby.value = {
      lobbyId: '123',
      players: [leader, { id: 'bot-1', name: 'Bot 1', leader: false, ready: true, bot: true }]
    };

    handleBotRemoved('bot-1');

    expect(lobby.value.players.map((player) => player.id)).toEqual(['p1']);
  });

  test('revanche limpa o jogo e o ranking e reseta a prontidão', () => {
    lobby.value = {
      lobbyId: '123',
      players: [
        { ...leader, ready: true },
        { ...guest, ready: true },
        { id: 'bot-1', name: 'Bot 1', leader: false, ready: false, bot: true }
      ],
      gameRanking: ['p2', 'p1', 'bot-1']
    };

    handleRematch();

    expect(lobby.value.game).toBeUndefined();
    expect(lobby.value.gameRanking).toBeUndefined();
    expect(lobby.value.players.map((player) => player.ready)).toEqual([false, false, true]);
  });
});
