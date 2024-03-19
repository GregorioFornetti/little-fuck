<script setup lang="ts">
    import { ref } from "vue";
    import Modal from "../modal/Modal.vue";
    import PrimaryModalBtn from "../modal/PrimaryModalBtn.vue";
    import SecundaryModalBtn from "../modal/SecundaryModalBtn.vue";
    import ModalInput from "../modal/ModalInput.vue";
    import EventsEmitter from "@/events/Emitter";
    import Spinner from "../Spinner.vue";

    type JoinLobbyErrorType = "lobby-in-game"|"inexistent-lobby"|"no-name"|"repeated-name"|"player-already-in-lobby"

    const createLobbyModalStatus = ref<'closed'|'input'|'loading'|'error'>('closed');
    const joinLobbyModalStatus = ref<'closed'|'input'|'loading'|'error'>('closed');

    const createLobbyName = ref('');
    const joinLobbyCode = ref('');
    const joinLobbyName = ref('');
    const errorType = ref<JoinLobbyErrorType>("inexistent-lobby");

    const errorMessageMap: Record<JoinLobbyErrorType, string> = {
        "lobby-in-game": "A sala já está em jogo",
        "inexistent-lobby": "A sala não existe",
        "no-name": "Digite um nome",
        "repeated-name": "Nome já em uso",
        "player-already-in-lobby": "Você já está em uma sala"
    }


    const openCreateLobbyModal = () => {
        createLobbyModalStatus.value = 'input';
    }

    const openJoinLobbyModal = () => {
        joinLobbyModalStatus.value = 'input';
    }


    const closeCreateLobbyModal = () => {
        createLobbyModalStatus.value = 'closed';
        createLobbyName.value = '';
    }

    const closeJoinLobbyModal = () => {
        joinLobbyModalStatus.value = 'closed';
        joinLobbyCode.value = '';
        joinLobbyName.value = '';
    }


    const createLobby = () => {
        EventsEmitter.Lobby.emitCreateLobby(createLobbyName.value);
        createLobbyModalStatus.value = 'loading';
    }

    globalThis.socket.on('join-lobby-success', (lobbyInfo: any) => {
        closeJoinLobbyModal()
        closeCreateLobbyModal()
        console.log('join-lobby-success')
    })

    globalThis.socket.on('join-lobby-error', (errorTypeParam: JoinLobbyErrorType) => {
        if (joinLobbyModalStatus.value === 'loading') {
            joinLobbyModalStatus.value = 'error';
        } else if (createLobbyModalStatus.value === 'loading') {
            createLobbyModalStatus.value = 'error';
        }

        errorType.value = errorTypeParam;
    })
</script>

<template>
    <div class="w-screen h-screen flex justify-center items-center">
        <div class="p-12 flex flex-col gap-y-10">
            <button @click="openCreateLobbyModal" class="text-white bg-sky-500/100 hover:bg-blue-600 py-3 rounded-3xl px-10">Criar uma sala</button>
            <button @click="openJoinLobbyModal" class="text-white bg-sky-500/100 hover:bg-blue-600 py-3 rounded-3xl px-10">Entrar em uma sala</button>
        </div>
    </div>


    <!-- CreateLobbyModal -->
    <Modal title="Criar uma sala" :show="createLobbyModalStatus !== 'closed'" :close-modal="createLobbyModalStatus !== 'loading' ? closeCreateLobbyModal : undefined">
        <template #body>
            <!-- input -->
            <div v-if="createLobbyModalStatus === 'input'">
                <ModalInput label="Nome do jogador" v-model="createLobbyName" />
            </div>
            <!-- waiting response -->
            <div v-if="createLobbyModalStatus === 'loading'" class="flex items-center justify-center">
                <Spinner :size="50" />
            </div>
            <!-- error -->
            <div v-if="createLobbyModalStatus === 'error'">
                <p class="text-center">{{ errorMessageMap[errorType] }}</p>
            </div>
        </template>
        
        <template #footer>
            <!-- input -->
            <div v-if="createLobbyModalStatus === 'input'">
                <PrimaryModalBtn @click="createLobby">Criar sala</PrimaryModalBtn>
                <SecundaryModalBtn @click="closeCreateLobbyModal">Fechar</SecundaryModalBtn>
            </div>
            <!-- waiting response -->
            <div v-if="createLobbyModalStatus === 'loading'">
                
            </div>
            <!-- error -->
            <div v-if="createLobbyModalStatus === 'error'">
                <PrimaryModalBtn @click="openCreateLobbyModal">Voltar</PrimaryModalBtn>
                <SecundaryModalBtn @click="closeCreateLobbyModal">Fechar</SecundaryModalBtn>
            </div>
        </template>
    </Modal>




    <!-- JoinLobbyModal -->
    <Modal title="Entrar em uma sala" :show="joinLobbyModalStatus !== 'closed'" :close-modal="joinLobbyModalStatus !== 'loading' ? closeJoinLobbyModal : undefined">
        <template #body>
            <!-- input -->
            <div v-if="joinLobbyModalStatus === 'input'" class="flex gap-y-5 flex-col">
                <ModalInput label="Código da sala" v-model="joinLobbyCode" />
                <ModalInput label="Nome do jogador" v-model="joinLobbyName" />
            </div>
            <!-- waiting response -->
            <div v-if="joinLobbyModalStatus === 'loading'" class="flex items-center justify-center">
                <Spinner :size="50" />
            </div>
            <!-- error -->
            <div v-if="joinLobbyModalStatus === 'error'">
                <p class="text-center">{{ errorMessageMap[errorType] }}</p>
            </div>
        </template>

        <template #footer>
            <!-- input -->
            <div v-if="joinLobbyModalStatus === 'input'">
                <PrimaryModalBtn @click="closeJoinLobbyModal">Entrar na sala</PrimaryModalBtn>
                <SecundaryModalBtn @click="closeJoinLobbyModal">Fechar</SecundaryModalBtn>
            </div>
            <!-- waiting response -->
            <div v-if="joinLobbyModalStatus === 'loading'">

            </div>
            <!-- error -->
            <div v-if="joinLobbyModalStatus === 'error'">
                <PrimaryModalBtn @click="openJoinLobbyModal">Voltar</PrimaryModalBtn>
                <SecundaryModalBtn @click="closeJoinLobbyModal">Fechar</SecundaryModalBtn>
            </div>
        </template>
    </Modal>
</template>
