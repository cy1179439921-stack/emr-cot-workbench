<template>
  <el-button
    :type="type"
    :size="size"
    @click="handleClick"
    class="typing-message-button"
  >
    {{ text }}
  </el-button>
</template>

<script setup>
const props = defineProps({
  text: {
    type: String,
    default: '点击按钮'
  },
  type: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'small'
  }
})

const emits = defineEmits(['click'])

const handleClick = () => {
  emits('click', props.text)
  console.log('按钮被点击:', props.text)
}
</script>

<style scoped lang="scss">
.typing-message-button {
  margin: 0 4px;
}
</style>

