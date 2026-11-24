<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: { type: String, required: true }
})
const emit = defineEmits(['toggle'])

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('toggle', { id: props.id, open: isOpen.value })
}
</script>

<template>
  <div class="md-collapse">
    <div class="md-collapse-header" @click="toggle">
      <span class="md-collapse-toggle">
        {{ isOpen ? '收起 ▲' : '展开查看 ▼' }}
      </span>
    </div>
  </div>
</template>
