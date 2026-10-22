import { buildRoomLink, getRoomCodeFromUrl } from '@/roomLink';

const CODE = 'cfe3fe34-1234-4abc-8def-0123456789ab';

describe('roomLink', () => {
  test('builds a join link from origin and room code', () => {
    expect(buildRoomLink(CODE, 'https://game.example.com')).toBe(`https://game.example.com/${CODE}`);
    expect(buildRoomLink(CODE, 'http://localhost:3000/')).toBe(`http://localhost:3000/${CODE}`);
  });

  test('extracts the room code from a join link path', () => {
    expect(getRoomCodeFromUrl(`/${CODE}`)).toBe(CODE);
    expect(getRoomCodeFromUrl(`/${CODE}/`)).toBe(CODE);
  });

  test('returns null when there is no room code in the path', () => {
    expect(getRoomCodeFromUrl('/')).toBeNull();
    expect(getRoomCodeFromUrl('')).toBeNull();
    expect(getRoomCodeFromUrl('/not-a-room-code')).toBeNull();
    expect(getRoomCodeFromUrl(`/${CODE}/extra`)).toBeNull();
    expect(getRoomCodeFromUrl('/assets/index.js')).toBeNull();
  });
});
