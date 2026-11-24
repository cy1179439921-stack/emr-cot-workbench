<template>
  <div class="commonSteps6">
    <div class="step" v-for="(item, index) in steps" :key="index">
      <div class="step-num flexCenter" :class="[{grey: index > step}, {active: index < step + 1}]" @click="toStep(index)">
        <span v-if="index > step - 1">{{index + 1}}</span>
        <i class="iconfont icon-wancheng-1" v-else></i>
      </div>
      <div class="step-content" :class="[{grey: index > step}, {active: index < step + 1}]" @click="toStep(index)">
        <div class="step-name">{{item.name}}</div>
      </div>
      <div class="line line2" v-if="index < steps.length - 1 && index === step - 1">
        <div v-if="index === 0">数据集897X20列</div>
      </div>
      <div class="line" v-else-if="index < steps.length - 1" :class="{active: index < step}">
        <div v-if="index === 0">数据集897X20列</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
defineProps({
  step: {
    type: Number,
    default: 0
  }
})
const emits = defineEmits(['toStep'])
const toStep = (index) => {
  emits('toStep', index)
}
const steps = ref([
  {
    name: '选择数据集'
  },
  {
    name: 'AI分析规划'
  },
  {
    name: '数据处理&模型构建'
  },
  {
    name: '报告生成'
  }
])
console.log(1)
</script>

<style lang="scss" scoped>
.commonSteps6 {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: 28px 54px 0;
  .step {
    display: flex;
    flex: 1;
    &:last-child {
      flex: initial;
    }
    .step-num {
      width: 27px;
      height: 27px;
      border-radius: 27px;
      background-color: var(--theme-primary);
      font-size: 16px;
      color: #999faf;
      i {
        font-size: 10px;
      }
      &.grey {
        background-color: #e2e2e4;
      }
      &.active {
        color: #fff;
      }
    }
    .step-content {
      display: flex;
      align-items: center;
      margin-left: 12px;
      &.active {
        color: var(--theme-primary);
        .step-name {
          font-weight: 500;
          color: var(--theme-primary);
        }
      }
      .step-name {
        font-size: 16px;
        color: var(--theme-text-3);
      }
    }
    .line {
      position: relative;
      flex: 1;
      width: 100px;
      height: 2px;
      margin-left: 10px;
      margin-right: 10px;
      margin-top: 12px;
      border-bottom: 2px solid #e2e2e4;
      div {
        display: flex;
        position: absolute;
        top: -28px;
        justify-content: center;
        width: 100%;
      }
      &.active {
        border-bottom: 2px solid var(--theme-primary);
      }
    }
    .line2 {
      border-bottom: 2px dashed var(--theme-primary);
    }
  }
}
</style>
