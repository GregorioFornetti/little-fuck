import { clientSocket, serverSocket } from '../setupTests';
import addDefaultLobbyHandlers from '@/events/lobby/eventsHandlers';

describe('join-lobby-error dispatch', () => {
  test('um listener registrado depois do handler padrão ainda deve receber o evento', (done) => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    // Igual à produção: os handlers padrão são registrados na conexão.
    // Eles vêm antes de qualquer listener específico da interface (ex: o modal da HomePage).
    addDefaultLobbyHandlers(clientSocket);

    clientSocket.on('join-lobby-error', (type: string) => {
      expect(type).toBe('inexistent-lobby');
      done();
    });

    serverSocket.emit('join-lobby-error', 'inexistent-lobby');
  });
});
