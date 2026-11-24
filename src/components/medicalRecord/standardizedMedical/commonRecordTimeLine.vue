<template>
  <div class="timeline-left">
    <div class="line-top"></div>
    <div class="circle-div">
      <div class="inner-circle"></div>
    </div>
    <div class="line-bottom"></div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'CommonRecordTimeLine',
  inheritAttrs: false
})
</script>
<style scoped lang="scss">
.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 9px;

  .circle-div {
    display: flex;
    align-items: center;
    width: 9px;
    height: 19px;

    .inner-circle {
      width: 9px;
      height: 9px;
      border-radius: 100%;
      background-color: #3670f8;
    }
  }

  .line-top {
    width: 1px;
    height: 39px;
    background-color: #e4e4e4;
  }

  .line-bottom {
    flex: 1;
    width: 1px;
    background-color: #e4e4e4;
  }
}
</style>
