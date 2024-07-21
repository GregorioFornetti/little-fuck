
<script setup lang="ts">
import { frontendLobbyHistoryList, backendLobbyHistoryList, eventsHistoryList } from '@/debug/globals';
eventsHistoryList.value = [
  {
    event: 'win-rounds-number-update',
    params: [
      2
    ]
  },
  {
    event: 'start-game-request',
    params: []
  },
  {
    event: 'ready',
    params: []
  }
];

frontendLobbyHistoryList.value = [
  {
    lobbyId: '123',
    players: [
      {
        id: '1',
        name: 'Player 1',
        leader: true,
        ready: true
      },
      {
        id: '2',
        name: 'Player 2',
        leader: false,
        ready: false
      }
    ]
  },
  {
    lobbyId: '123',
    players: [
      {
        id: '1',
        name: 'Player 1',
        leader: true,
        ready: true
      },
      {
        id: '2',
        name: 'Player 2',
        leader: false,
        ready: false
      }
    ],
    game: {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {
        1: 3,
        2: 3
      },
    }
  },
  {
    lobbyId: '123',
    players: [
      {
        id: '1',
        name: 'Player 1',
        leader: true,
        ready: true
      },
      {
        id: '2',
        name: 'Player 2',
        leader: false,
        ready: false
      }
    ],
    game: {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {
        1: 3,
        2: 3
      },
      match: {
        players: {
          1: {
            numCards: 1,
            numWonRounds: 0,
            numWinsNeeded: 1
          },
          2: {
            numCards: 1,
            numWonRounds: 0,
            numWinsNeeded: 1
          }
        },
        nextPlayerId: '1',
        currentPlayerCards: [
          {
            value: 1,
            type: 'common'
          }
        ],
        numRounds: 1
      }
    }
  }
];

backendLobbyHistoryList.value = [
  {
    lobbyId: '123',
    players: [
      {
        id: '1',
        name: 'Player 1',
        leader: true,
        ready: true
      },
      {
        id: '2',
        name: 'Player 2',
        leader: false,
        ready: false
      }
    ]
  },
  {
    lobbyId: '123',
    players: [
      {
        id: '1',
        name: 'Player 1',
        leader: true,
        ready: true
      },
      {
        id: '2',
        name: 'Player 2',
        leader: false,
        ready: false
      }
    ],
    game: {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {
        1: 3,
        2: 3
      },
      timer: 'infos do timer',
      currentPlayerId: '1',
      numRounds: 1,
      deadPlayersIds: [],
      status: 'starting-match'
    }
  },
  {
    lobbyId: '123',
    players: [
      {
        id: '1',
        name: 'Player 1',
        leader: true,
        ready: true
      },
      {
        id: '2',
        name: 'Player 2',
        leader: false,
        ready: false
      }
    ],
    game: {
      currentWaitTime: 1,
      matchNumber: 1,
      roundNumber: 1,
      playersHealth: {
        1: 3,
        2: 3
      },
      timer: 'infos do timer',
      currentPlayerId: '1',
      numRounds: 1,
      deadPlayersIds: [],
      status: 'starting-match',
      match: {
        players: {
          1: {
            cards: [
              {
                value: 1,
                type: 'common'
              }
            ],
            numWonRounds: 0,
            numWinsNeeded: 1
          },
          2: {
            cards: [
              {
                value: 2,
                type: 'common'
              }
            ],
            numCards: 1,
            numWonRounds: 0,
            numWinsNeeded: 1
          }
        },
        nextPlayerId: '1',
        roundFirstPlayerId: '1'
      }
    }
  }
];

import LobbyContainer from '@/debug/components/LobbyContainer.vue';
import EventsContainer from '@/debug/components/EventsContainer.vue';
import NextEventTimer from '@/debug/components/NextEventTimer.vue';
import CommandsContainer from '@/debug/components/CommandsContainer/CommandsContainer.vue';
</script>

<template>
  <div class="w-full h-screen flex justify-center">
    <div class="max-w-screen-2xl w-full h-full grid grid-cols-5 grid-rows-5 gap-5 p-5">
      <div class="row-span-full col-span-2">
        <LobbyContainer
          modal-title="Frontend Lobby History"
          json-label="Frontend Lobby"
          :json-list="frontendLobbyHistoryList"
        />
      </div>
      <div class="row-span-full col-span-2">
        <LobbyContainer
          modal-title="Backend Lobby History"
          json-label="Backend Lobby"
          :json-list="backendLobbyHistoryList"
        />
      </div>
      <div>
        <NextEventTimer
          :next-event-time="10"
          next-event-name="start-game-request"
        />
      </div>
      <div class="row-span-4">
        <EventsContainer />
      </div>
    </div>
  </div>
  <CommandsContainer />
</template>
