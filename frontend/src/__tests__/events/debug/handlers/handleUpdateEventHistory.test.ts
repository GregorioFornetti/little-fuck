
import { handleUpdateEventHistory } from "@/debug/handlers/handleUpdateEventHistory";
import { eventsHistoryList } from "@/debug/globals";

beforeEach(() => {
    eventsHistoryList.value = []
})


describe('handleUpdateFrontendHistory', () => {

    test("Deve ser possível cadastrar um evento e seus parâmetros no histórico", (done) => {
        handleUpdateEventHistory('any event', 'arg1', 'arg2')

        expect(eventsHistoryList.value).toHaveLength(1)
        expect(eventsHistoryList.value[0].event).toBe('any event')
        expect(eventsHistoryList.value[0].params).toHaveLength(2)
        expect(eventsHistoryList.value[0].params[0]).toBe('arg1')
        expect(eventsHistoryList.value[0].params[1]).toBe('arg2')

        done()
    })

    test("Deve ser possível cadastrar dois eventos no histórico em seguida", (done) => {
        handleUpdateEventHistory('any event', 'arg1', 'arg2')

        expect(eventsHistoryList.value).toHaveLength(1)
        expect(eventsHistoryList.value[0].event).toBe('any event')
        expect(eventsHistoryList.value[0].params).toHaveLength(2)
        expect(eventsHistoryList.value[0].params[0]).toBe('arg1')
        expect(eventsHistoryList.value[0].params[1]).toBe('arg2')

        handleUpdateEventHistory('new event', 1, 2)

        expect(eventsHistoryList.value).toHaveLength(2)
        expect(eventsHistoryList.value[0].event).toBe('any event')
        expect(eventsHistoryList.value[0].params).toHaveLength(2)
        expect(eventsHistoryList.value[0].params[0]).toBe('arg1')
        expect(eventsHistoryList.value[0].params[1]).toBe('arg2')
        expect(eventsHistoryList.value[1].event).toBe('new event')
        expect(eventsHistoryList.value[1].params).toHaveLength(2)
        expect(eventsHistoryList.value[1].params[0]).toBe(1)
        expect(eventsHistoryList.value[1].params[1]).toBe(2)
        
        done()
    })

    test("Não deve adicionar evento ao histórico se o evento for 'debug'", (done) => {
        handleUpdateEventHistory('debug', 'arg1', 'arg2')

        expect(eventsHistoryList.value).toHaveLength(0)

        done()
    })
})