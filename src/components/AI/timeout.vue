<template>
  <div class="timeoutContainer">
    <img src="@/assets/timeout.png" alt="">
    <div class="text">{{ text }}</div>
    <el-button class="retryBtn" type="primary" @click="handleClick">重试</el-button>
  </div>
</template>
<script setup>
defineProps({
  text: {
    type: String,
    default: '响应超时，网络或服务器可能在忙碌，请稍后重试～'
  }
})
const emits = defineEmits(['handleRetry'])

const handleClick = () => {
  emits('handleRetry')
}
</script>
<style lang="scss" scoped>
.timeoutContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  img {
    width: 170px;
    height: 170px;
    object-fit: fill;
  }
  .text {
    line-height: 20px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
  }
  .retryBtn {
    width: 111px;
    height: 32px;
    margin-top: 22px;
    border-radius: 16px;
  }
}
</style>
