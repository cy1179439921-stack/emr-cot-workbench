<template>
  <div class="AILoading">
    <img class="Robot" src="@/assets/Robot.gif" alt="">
    <img src="@/assets/AILoading.gif" alt="">
    <span class="text" v-if="text" >{{ text }}</span>
  </div>
</template>
<script setup>
defineProps({
  text: {
    type: String
  }
})
</script>
<style lang="scss" scoped>
.AILoading {
  position: relative;
  width: 100%;
  height: 100%;
  .Robot {
    position: absolute;
    left: 50%;
    top: 0;
    top: 50%;
    width: 69px;
    transform: translate(-50%, -50%);
  }
  img {
    position: absolute;
    left: 50%;
    top: 0;
    top: 50%;
    width: 126px;
    transform: translate(-50%, -50%);
  }
  .text {
    position: absolute;
    left: 50%;
    top: 50%;
    font-weight: 500;
    font-size: 14px;
    font-size: 16px;
    color: var(--theme-text);
    transform: translate(-50%, 72px);
  }
}
</style>
