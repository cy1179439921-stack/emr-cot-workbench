<template>
  <div class="commonSubTitle">
    <div class="line"></div>
    <div :class="{commonSubTitleText:true,darkMode:mode==='dark'}">
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>
<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  mode: {
    type: String,
    default: 'light'
  }
})
</script>
<style lang="scss" scoped>
.commonSubTitle {
  display: flex;
  align-items: center;
  .line {
    width: 2px;
    height: 14px;
    margin-right: 5px;
    background: var(--theme-primary);
  }
  .commonSubTitleText {
    line-height: 22px;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
    &.darkMode {
      color: #fff;
    }
  }
}
</style>
