
import { handleDebug } from "./handleDebug";
import { handleUpdateEventHistory } from "./handleUpdateEventHistory";
import { handleUpdateFrontendHistory } from "./handleUpdateFrotendHistory";
import type { Socket } from "socket.io-client";


/**
 *  Adiciona todos os handlers necessários para o modo de debug. Estes handlers não devem ser usados em outro modo.
 *  Estes handlers são:
 *  - `debug`: lida com o evento de debug emitido pelo servidor, adicionando o 
 *  lobby informado pelo servidor ao histórico (em `backendLobbyHistoryList`)
 *  - `updateFrontendHistory`: a cada evento emitido pelo servidor, adiciona o lobby do cliente ao histórico (em `frontendHistoryList`)
 *  - `updateEventHistory`: a cada evento emitido pelo servidor, adiciona o evento emitido ao histórico (em `eventHistoryList`)
 * 
 *  @param socket o socket em que serão adicionados os handlers
 */
export function addHandlersForDebugMode(socket: Socket) {
    socket.on('debug', handleDebug)

    socket.onAny((event: string, ...args: any[]) => {
        handleUpdateFrontendHistory(event, ...args)
        handleUpdateEventHistory(event, ...args)
    })
}