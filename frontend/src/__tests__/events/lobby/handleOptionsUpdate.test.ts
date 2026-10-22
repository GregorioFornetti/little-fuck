import '../setupTests';
import { handleOptionsUpdate } from '@/events/lobby/handlers/optionsUpdate';
import { lobby } from '@/connection';
import { i18n } from '@/plugins/i18n';

describe('handleOptionsUpdate', () => {
  const players = [
    { id: 'p1', name: 'One', leader: true, ready: false },
    { id: 'p2', name: 'Two', leader: false, ready: true }
  ];

  test('atualiza as opções da sala', () => {
    lobby.value = { lobbyId: '123', players };

    handleOptionsUpdate({ initialHealth: 5, playerActionTimeSeconds: 20, roundEndTimeSeconds: 15, cardType: 'manilha-velha' });

    expect(lobby.value.options).toEqual({
      initialHealth: 5,
      playerActionTimeSeconds: 20,
      roundEndTimeSeconds: 15,
      cardType: 'manilha-velha'
    });
  });

  test('gera erro se não estiver em uma sala', () => {
    lobby.value = null;

    expect(() =>
      handleOptionsUpdate({ initialHealth: 5, playerActionTimeSeconds: 20, roundEndTimeSeconds: 15, cardType: 'manilha-velha' })
    ).toThrow(Error(i18n.t('COMMON.ERROR.NOT_IN_LOBBY')));
  });
});
