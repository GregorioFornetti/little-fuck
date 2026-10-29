import Lobby from '../../../interfaces/Lobby';
import { APPEARANCE_COLORS, APPEARANCE_EMOTES } from '../../../global';

type LobbyPlayer = Lobby['players'][number];

/**
 *  Atribui ao jogador o primeiro emote e a primeira cor ainda não usados
 *  por nenhum outro jogador da sala, garantindo que nenhum jogador tenha
 *  o mesmo emote ou a mesma cor de outro na mesma sala.
 *
 *  @param lobby informações da sala atual
 *  @param player jogador que receberá a aparência
 */
export function assignFreeAppearance(lobby: Lobby, player: LobbyPlayer): void {
  const usedEmotes = new Set(lobby.players.filter((p) => p.id !== player.id).map((p) => p.emote));
  const usedColors = new Set(lobby.players.filter((p) => p.id !== player.id).map((p) => p.color));
  player.emote = APPEARANCE_EMOTES.find((emote) => !usedEmotes.has(emote)) ?? APPEARANCE_EMOTES[0];
  player.color = APPEARANCE_COLORS.find((color) => !usedColors.has(color)) ?? APPEARANCE_COLORS[0];
}
