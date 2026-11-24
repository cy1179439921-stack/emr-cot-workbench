<template>
  <div class="empty">
    <img v-if="!loadingStatus" class="emptyImg" :src="emptyImg" alt="" />
    <div v-if="loadingStatus" class="pixel-spinner">
      <div class="pixel-spinner-inner"></div>
    </div>
    <span class="noDataText" :class="{ 'loading': loadingStatus }">{{ loadingStatus ? '加载中' : '这里还没有内容' }}</span>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import emptyImg from '@/assets/empty.png'
import { emitter } from '@/utils/bus'

const loadingStatus = ref(false)
emitter.on('showLoading', () => {
  loadingStatus.value = true
})
emitter.on('closeLoading', () => {
  loadingStatus.value = false
})

defineProps({
  color: {
    type: String,
    default: '#f7f8f9'
  }
})
</script>
<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
  height: 100%;
  background: var(--theme-bg)#f7f8f9;
  .pixel-spinner {
    margin-bottom: 14px;
  }
  .emptyImg {
    width: 108px;
    height: auto;
    margin-bottom: 4px;
  }
  .noDataText {
    line-height: 22px;
    font-size: 14px;
    color: var(--theme-text-2);
  }
}
</style>
