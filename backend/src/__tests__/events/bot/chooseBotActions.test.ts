import Lobby, { Card } from '../../../interfaces/Lobby';
import { chooseBotGuess } from '../../../events/bot/chooseBotGuess';
import { chooseBotCardIndex } from '../../../events/bot/chooseBotCardIndex';
import { Timer } from 'easytimer.js';

const card = (value: number): Card => ({ value, type: 'common' });

function makeLobby(botCards: Card[], otherCards: Card[], onTable: Card[] = []): Lobby {
  return {
    lobbyId: 'l1',
    options: { initialHealth: 3, playerActionTimeSeconds: 18, roundEndTimeSeconds: 10, cardType: 'numbered' },
    players: [
      { id: 'bot', name: 'Bot 1', leader: false, ready: true, bot: true },
      { id: 'human', name: 'Human', leader: true, ready: false }
    ],
    game: {
      playersHealth: { bot: 3, human: 3 },
      timer: new Timer(),
      matchNumber: 1,
      roundNumber: 1,
      currentPlayerId: 'human',
      numRounds: botCards.length,
      deadPlayersIds: [],
      status: 'waiting_num_win_response',
      match: {
        nextPlayerId: 'bot',
        roundFirstPlayerId: 'human',
        players: {
          bot: { cards: botCards, numWonRounds: 0 },
          human: { cards: otherCards, numWonRounds: 0, numWinsNeeded: 0 }
        },
        round: onTable.length
          ? { cards: { onMatch: onTable.map((c, i) => ({ card: c, playerId: `p${i}` })), anulledCards: [] }, nextPlayerId: 'bot' }
          : undefined
      }
    }
  } as Lobby;
}

describe('chooseBotGuess', () => {
  test('palpita a quantidade de cartas fortes da mão', () => {
    const lobby = makeLobby([card(16), card(13), card(2), card(3)], [card(1), card(1), card(1), card(1)]);
    expect(chooseBotGuess(lobby, 'bot')).toBe(2);
  });

  test('na partida especial, palpita 1 apenas se sua carta for a mais forte', () => {
    const botGuessesFirst = (lobby: Lobby) => {
      // O bot é o primeiro a palpitar: ninguém palpitou antes dele
      delete lobby.game!.match!.players.human.numWinsNeeded;
      lobby.game!.match!.roundFirstPlayerId = 'bot';
      return lobby;
    };
    expect(chooseBotGuess(botGuessesFirst(makeLobby([card(16)], [card(15)])), 'bot')).toBe(1);
    expect(chooseBotGuess(botGuessesFirst(makeLobby([card(14)], [card(15)])), 'bot')).toBe(0);
  });

  test('nunca viola a regra do último a palpitar', () => {
    // Humano já palpitou 0 em uma partida de 2 cartas: o bot não pode palpitar 2
    const lobby = makeLobby([card(16), card(15)], [card(1), card(1)]);
    const guess = chooseBotGuess(lobby, 'bot');
    expect(guess).not.toBe(2);
  });
});

describe('chooseBotCardIndex', () => {
  test('começando a mesa, joga a carta mais fraca', () => {
    const lobby = makeLobby([card(9), card(3), card(14)], [card(1), card(1), card(1)], []);
    // Sem rodada criada ainda, a mesa está vazia
    expect(chooseBotCardIndex(lobby, 'bot')).toBe(1);
  });

  test('joga a carta mais fraca que ainda vence a mesa', () => {
    const lobby = makeLobby([card(9), card(3), card(14)], [card(1), card(1), card(1)], [card(8)]);
    expect(chooseBotCardIndex(lobby, 'bot')).toBe(0); // 9 é a vencedora mais barata
  });

  test('sem carta vencedora, descarta a mais fraca', () => {
    const lobby = makeLobby([card(9), card(3), card(14)], [card(1), card(1), card(1)], [card(16)]);
    expect(chooseBotCardIndex(lobby, 'bot')).toBe(1); // 3
  });
});
