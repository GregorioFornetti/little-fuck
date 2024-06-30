
<script setup lang="ts">
// Remover comentário abaixo quando implementar o componente, juntamente com esse comentário atual
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import BaseModal from '@/components/modal/BaseModal.vue';

defineProps<{
  title: string,
  show: boolean,
  jsonLabel: string,
  jsonList: object[],
  closeModal?: () => void,
}>();
</script>
