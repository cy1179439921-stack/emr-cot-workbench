<template>
  <div class="custom-rate">
    <el-rate
      v-model="value"
      disabled
      :icons="icons"
      :disabled-void-icon="customRateIcon"
    />
  </div>

</template>

<script setup>
import { computed } from 'vue'
import customRateIcon from './customRateIcon.vue'
const icons = [customRateIcon, customRateIcon, customRateIcon]
const props = defineProps({
  rateValue: {
    type: Number
  }
})
const value = computed(() => props.rateValue)
</script>
<style scoped>
.custom-rate {
  /* padding-top: 2px; */
  background-color: var(--theme-card);
}

:deep(.el-rate .el-rate__icon) {
  font-size: 44px;
}

:deep(.el-rate .el-rate__item > .el-rate__icon) {
  margin-right: -5px;
  transform: rotate(13.5deg);
}

:deep(.iconfont) {
  position: absolute;
  font-size: 44px;
}
</style>
