<script setup lang="ts">
    import { ref } from "vue";
    import Modal from "../modal/Modal.vue";
    import PrimaryModalBtn from "../modal/PrimaryModalBtn.vue";
    import SecundaryModalBtn from "../modal/SecundaryModalBtn.vue";
import ModalInput from "../modal/ModalInput.vue";

    const showCreateLobbyModal = ref(false);
    const showJoinLobbyModal = ref(false);

    const createLobbyName = ref('');
    const joinLobbyCode = ref('');
    const joinLobbyName = ref('');


    const openCreateLobbyModal = () => {
        showCreateLobbyModal.value = true;
    }

    const openJoinLobbyModal = () => {
        showJoinLobbyModal.value = true;
    }


    const closeCreateLobbyModal = () => {
        showCreateLobbyModal.value = false;
    }

    const closeJoinLobbyModal = () => {
        showJoinLobbyModal.value = false;
    }
</script>

<template>
    <div class="w-screen h-screen flex justify-center items-center">
        <div class="p-12 flex flex-col gap-y-10">
            <button @click="openCreateLobbyModal" class="text-white bg-sky-500/100 hover:bg-blue-600 py-3 rounded-3xl px-10">Criar uma sala</button>
            <button @click="openJoinLobbyModal" class="text-white bg-sky-500/100 hover:bg-blue-600 py-3 rounded-3xl px-10">Entrar em uma sala</button>
        </div>
    </div>

    <Modal title="Criar uma sala" :show="showCreateLobbyModal" :close-modal="closeCreateLobbyModal">
        <template #body>
            <ModalInput label="Nome do jogador" v-model="createLobbyName" />
        </template>
        
        <template #footer>
            <PrimaryModalBtn @click="closeCreateLobbyModal">Criar sala</PrimaryModalBtn>
            <SecundaryModalBtn @click="closeCreateLobbyModal">Fechar</SecundaryModalBtn>
        </template>
    </Modal>

    <Modal title="Entrar em uma sala" :show="showJoinLobbyModal" :close-modal="closeJoinLobbyModal">
        <template #body>
            <div class="flex gap-y-5 flex-col">
                <ModalInput label="Código da sala" v-model="joinLobbyCode" />
                <ModalInput label="Nome do jogador" v-model="createLobbyName" />
            </div>
        </template>

        <template #footer>
            <PrimaryModalBtn @click="closeJoinLobbyModal">Entrar na sala</PrimaryModalBtn>
            <SecundaryModalBtn @click="closeJoinLobbyModal">Fechar</SecundaryModalBtn>
        </template>
    </Modal>
</template>

<style scoped>
</style>
