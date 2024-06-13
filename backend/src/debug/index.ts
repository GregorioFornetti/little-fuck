
import { io } from "../index"
import { addDebugEmitAfterEachEmit } from "./addDebugEmitAfterEachEmit"

process.env.DEBUG = 'true'  // Quando executado em modo de debug, essa flag faz com que erros sejam gerados de funções que deveriam ser usadas apenas em modo de debug

addDebugEmitAfterEachEmit(io)