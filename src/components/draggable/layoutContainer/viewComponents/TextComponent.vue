<template>
  <div class="text-container" :style="style" v-show="isShow">
    {{ textContent }}
  </div>
</template>
<script setup>
import { toRefs, computed } from 'vue'

const props = defineProps({
  data: {
    type: Object
  },
  formData: {
    type: Object
  },
  preview: {
    type: Boolean
  }
})
const { data, formData } = toRefs(props)
// 文本内容
const textContent = computed(() => {
  return data.value.option?.content
})
// 样式
const style = computed(() => {
  return data.value?.style || {}
})
// 是否显示
const isShow = computed(() => {
  if (props.preview) {
    return true
  } else {
    const rule = data.value?.option?.rule
    return !(rule && !(formData.value[rule.name] && rule.valueType === 'string' ? formData.value[rule.name] === rule.value : formData.value[rule.name].includes(rule.value)))
  }
})
</script>
<style lang="scss" scoped>
.text-container {
  box-sizing: border-box;
  padding: 5px;
  word-break: break-all;
}
</style>
