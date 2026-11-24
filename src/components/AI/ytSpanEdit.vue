<template>
  <div>
    <span
      class="yt-span"
      contenteditable="plaintext-only"
      @input="updateValue"
      ref="contentEditableRef">
    </span>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const contentEditableRef = ref(null)
let isUpdating = false

// 当 modelValue 更新时，只在内容真正改变时才更新 DOM
watch(() => props.modelValue, (newValue) => {
  if (!isUpdating && contentEditableRef.value && contentEditableRef.value.textContent !== newValue) {
    contentEditableRef.value.textContent = newValue || ''
  }
}, { immediate: true })

const updateValue = (event) => {
  const content = event.target.textContent
  // 设置一个标志，防止 watch 回调中重新设置内容导致光标跳转
  isUpdating = true
  emit('update:modelValue', content)

  // 下一个 tick 后重置标志
  nextTick(() => {
    isUpdating = false
  })
}

onMounted(() => {
  if (contentEditableRef.value) {
    contentEditableRef.value.textContent = props.modelValue || ''
  }
})
</script>
<style lang="scss" scoped>
.yt-span {
  outline: 1px solid transparent;
}
</style>
