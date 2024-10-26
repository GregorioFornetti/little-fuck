
import type { Lobby } from '@/interfaces/Lobby';
import { ref } from 'vue';

export interface EventLog {
    event: string,
    params: any[]
}

const frontendLobbyHistoryList = ref<(Lobby|null)[]>([]);
const backendLobbyHistoryList = ref<any[]>([]);
const eventsHistoryList = ref<EventLog[]>([]);

export { frontendLobbyHistoryList, backendLobbyHistoryList, eventsHistoryList };
