
import '../setupTests';
import { handleInternalServerError } from '@/events/general/handlers/internalServerError';
import { lobby } from '@/connection';

describe('handleInternalServerError', () => {

  test('Deve definir o lobby como null', () => {
    lobby.value = {
      lobbyId: '123',
      players: [
        {
          id: '12345',
          name: 'leader player',
          leader: true,
          ready: true
        },
        {
          id: '123',
          name: 'John joe',
          leader: false,
          ready: false
        }
      ]
    };

    handleInternalServerError();

    expect(lobby.value).toBe(null);
  });
});
