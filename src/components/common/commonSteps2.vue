<template>
  <div class="commonSteps2">
    <div class="step" v-for="(item, index) in steps" :key="index">
      <div class="step-num flexCenter" :class="{grey: index > curStep}">
        <span v-if="index > curStep - 1">{{index + 1}}</span>
        <i class="iconfont icon-wancheng-1" v-else></i>
      </div>
      <div class="step-content">
        <div class="step-name">{{item.name}}</div>
        <div class="step-desc">{{item.desc}}</div>
      </div>
      <div class="line" v-if="index < steps.length - 1"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const steps = ref([
  {
    name: '输入信息1',
    desc: '输入研究标题1'
  },
  {
    name: '输入信息2',
    desc: '输入研究标题2'
  },
  {
    name: '输入信息3',
    desc: '输入研究标题3'
  },
  {
    name: '输入信息4',
    desc: '输入研究标题4'
  },
  {
    name: '输入信息5',
    desc: '输入研究标题5'
  }
])
const curStep = ref(2)
</script>

<style lang="scss" scoped>
.commonSteps2 {
  display: flex;
  .step {
    display: flex;
    .step-num {
      width: 32px;
      height: 32px;
      border-radius: 32px;
      background-color: #3080ff;
      color: #fff;
      i {
        font-size: 12px;
      }
      &.grey {
        background-color: #e2e9f3;
      }
    }
    .step-content {
      margin-left: 20px;
      .step-name {
        font-weight: 600;
      }
      .step-desc {
        margin-top: 10px;
        color: var(--theme-text-2);
      }
    }
    .line {
      width: 100px;
      height: 2px;
      margin-left: 10px;
      margin-right: 10px;
      margin-top: 16px;
      background-color: #3080ff;
    }
  }
}
</style>
