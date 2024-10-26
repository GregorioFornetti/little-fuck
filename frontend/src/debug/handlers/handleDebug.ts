
import { backendLobbyHistoryList } from '../globals';

/**
 *  Evento que é enviado após cada modificação ocorrida no `backend`. Esse evento irá transmitir o estado das informações de forma "cru"
 *  para o frontend, para fins de debug. Este evento só sera acionado quando o servidor for executado em modo de debug
 *  (através do comando `npm run debug`).
 *
 *  Esse evento sempre será chamado logo em seguida da chamada de qualquer outro evento (tirando ele mesmo).
 *  Logo, se o evento acionado for para o lobby, o debug será para o lobby inteiro também. Caso seja para um jogador específico,
 *  o debug também será para esse jogador específico
 *
 *  @param lobby um objeto (JSON) contendo as informações "cru" do lobby no servidor.
 *  Pode ser indefinido caso não tenha nenhuma informação de lobby para ser informada.
 */
export function handleDebug(lobby: any) {
  backendLobbyHistoryList.value = [...backendLobbyHistoryList.value, lobby];
}
