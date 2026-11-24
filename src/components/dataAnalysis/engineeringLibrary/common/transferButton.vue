
<template>
  <div class="transfer-button">
    <el-button :type="handleType" class="arrowButton" @click="handleToRight" :disabled="handleType === 'default'">
      <i class="iconfont icon-right"></i>
    </el-button>
    <el-button :type="rightActive.length > 0 ? 'primary' : 'default'" class="arrowButton" @click="handleToLeft" :disabled="rightActive.length === 0">
      <i class="iconfont icon-left"></i>
    </el-button>
  </div>
</template>
<script setup>
defineOptions({
  name: 'TransferButton',
  inheritAttrs: false
})
import { computed } from 'vue'
const emits = defineEmits(['handleToRight', 'handleToLeft'])
const props = defineProps({
  leftActive: {
    type: Array,
    default: () => []
  },
  rightActive: {
    type: Array,
    default: () => []
  },
  needVariableType: { // 0: 定量或定性或只有唯一一个类型,不传默认为0， 1: 定量， 2: 定性
    type: Number,
    default: 0
  },
  isEnough: { // 是否满了，同一类变量分布在2个框及以上时需要
    type: Boolean,
    default: false
  }
})
// 处理右移按钮类型
const handleType = computed(() => {
  if (props.isEnough) {
    return 'default'
  }
  console.log(props.isEnough)
  if (props.leftActive.length > 0) {
    if (props.needVariableType === 1) { // 只需要定量
      if (props.leftActive.some(item => item.dataProperty === 1)) {
        return 'primary'
      } else {
        return 'default'
      }
    } else if (props.needVariableType === 2) { // 只需要定性
      if (props.leftActive.some(item => item.dataProperty !== 1)) {
        return 'primary'
      } else {
        return 'default'
      }
    } else {
      return 'primary'
    }
  } else {
    return 'default'
  }
})
const handleToRight = () => {
  emits('handleToRight')
}
const handleToLeft = () => {
  emits('handleToLeft')
}
</script>
<style lang="scss" scoped>

</style>
