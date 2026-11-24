<template>
  <el-button :type="type" :loading="loading" @click="handleClick">
    <template #loading>
      <div class="loader">
      </div>
    </template>
    <slot>{{ text }}</slot>
  </el-button>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { emitter } from '@/utils/bus'
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'primary'
  },
  loadingColor: {
    type: String,
    default: '#fff'
  },
  isAuto: {
    type: Boolean,
    default: true
  }
})
const emits = defineEmits(['handleSubmit'])
const loading = ref(false)
const handleClick = () => {
  if (props.isAuto) {
    loading.value = true
  }
  emits('handleSubmit')
}
const handleLoading = () => {
  loading.value = false
}
const switchLoading = () => {
  loading.value = !loading.value
}
onMounted(() => {
  if (props.isAuto) {
    emitter.on('closeLoading', () => {
      loading.value = false
    })
  }
})
defineExpose({
  handleLoading,
  switchLoading
})

</script>
<style lang="scss" scoped>
.loader {
  box-sizing: border-box;
  width: 16px;
  margin-right: 5px;
  padding: 2px;
  border-radius: 50%;
  background-color: v-bind('loadingColor');
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
  aspect-ratio: 1;

  --_m:
    conic-gradient(#0000 10%, #000),
    linear-gradient(#000 0 0) content-box;
}

@keyframes l3 { to { transform: rotate(1turn); } }
</style>

