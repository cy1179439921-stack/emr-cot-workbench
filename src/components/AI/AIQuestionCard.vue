<template>
  <div class="question-item" >
    <div class="div-top">
      <div class="tag-div">
        <span v-for="(type, tIndex) in info.questionType" :key="'type-' + tIndex" :class="[{'tag1': type === '关键问题', 'tag2': type === '优化项'}]">{{type}}</span>
        <span class="text">{{info.name}}</span>
      </div>
    </div>
    <div class="div-middle"><span class="circle"></span>问题描述：{{info.description}}</div>
    <div class="div-bottom"><span class="circle"></span>建议：{{info.advice}}</div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AIQuestionCard',
  inheritAttrs: false
})
defineProps({
  info: {
    type: Object,
    required: true
  }
})
</script>
<style scoped lang="scss">
  .question-item {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    padding: 24px 24px 31px;
    border: 1px solid #c9d8fc;
    border-radius: 8px;
    background: var(--theme-primary-soft);
    white-space: pre-wrap;
    &:not(:first-child) {
      margin-top: 16px;
    }
    .div-top {
      display: flex;
      .tag-div {
        span {
          display: inline-flex;
          align-items: center;
          height: 25px;
          margin-right: 8px;
          padding-left: 6px;
          padding-right: 9px;
          border-bottom-right-radius: 18px;
          font-weight: 600;
          font-size: 16px;
          &.tag1 {
            border: 1px solid #ff4e4e;
            background: rgba(255, 78, 78, 0.1);
            color: #ff4e4e;
          }
          &.tag2 {
            border: 1px solid #f59f0c;
            background: rgba(245, 159, 12, 0.1);
            color: #f59f0c;
          }
        }
        .text {
          font-size: 20px;
          color: var(--theme-text);
        }
      }
    }
    .circle {
      display: inline-block;
      display: none;
      width: 3px;
      height: 3px;
      margin-right: 8px;
      border-radius: 100%;
      background: #666;
    }
    .div-middle {
      display: flex;
      align-items: center;
      margin-top: 16px;
      line-height: 30px;
      font-size: 18px;
      color: var(--theme-text-2);
    }
    .div-bottom {
      display: flex;
      align-items: center;
      margin-top: 4px;
      line-height: 30px;
      font-size: 18px;
      color: var(--theme-text-2);
    }
  }
</style>

