<template>
  <div :class="{commonTitle:true,darkMode:mode==='dark'}">
    {{ titleText}}
  </div>
</template>
<script setup>
defineProps({
  titleText: {
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
.commonTitle {
  position: relative;
  margin: 24px 0 20px 0;
  padding-left: 12px;
  padding-bottom: 9px;
  line-height: 22px;
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
  &.darkMode {
    color: #fff;
    &::before {
      background: linear-gradient(90deg, rgba(54, 112, 248, 0.5) 0%, rgba(60, 129, 207, 0) 100%);
    }
  }
  &::before {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100px;
    height: 16px;
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(54, 112, 248, 0.5) 0%, rgba(60, 129, 207, 0) 100%);
    content: '';
  }
}
</style>
