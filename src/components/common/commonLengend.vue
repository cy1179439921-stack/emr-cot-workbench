<template>
  <div class="legendContainer">
    <img class="legendIcon" :src="mode==='dark'?darkLegendIcon:legendIcon" alt="">
    <span :class="{text:true,darkText:mode==='dark'}">{{ text }}</span>
  </div>
</template>
<script setup>
import legendIcon from '@/assets/legendIcon.png'
import darkLegendIcon from '@/assets/darkLegendIcon.png'
defineProps({
  text: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: ''
  }
})
</script>
<style lang="scss">
.legendContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  .legendIcon {
    width: 17px;
    height: auto;
    margin-right: 6px;
  }
  .text {
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-text-2);
    &.darkText {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

</style>
