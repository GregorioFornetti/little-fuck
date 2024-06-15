
import { eventsHistoryList } from "../globals";


/**
 *  Adiciona o evento emitido pelo servidor ao histórico (em `eventsHistoryList`). Não atualiza o histórico se o evento for `debug`.
 *  
 *  @param event nome do evento que foi chamado
 *  @param args parâmetros deste evento
 */
export function handleUpdateEventHistory(event: string, ...args: any[]) {
    if (event !== 'debug') {
        eventsHistoryList.value = [...eventsHistoryList.value, { event: event, params: args }]
    }
}
