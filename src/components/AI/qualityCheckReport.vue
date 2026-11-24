<template>
  <div class="qualityCheckReport">
    <div class="top-div">
      <img src="@/assets/oeverallQuality.png" alt="质量检查报告"/>
      <AIQualityResult :info="qualityResult"/>
      <div class="operation">
        <div class="btn1 flexCenter" @click="reCheck">重新校验</div>
        <div class="btn2 flexCenter" @click="toBack">返回</div>
      </div>
    </div>
    <div class="main-div">
      <header>
        <div class="left" :class="{'hasProblem': hasProblem}">
          <i class="iconfont icon-questionMark"></i>
          关键问题与优化项
        </div>
        <div class="right" v-if="hasProblem">
          <el-button type="danger" @click="toEdit">一键编辑</el-button>
        </div>
      </header>
      <div class="main-list">
        <template v-if="hasProblem && !isLoading">
          <el-scrollbar>
            <template v-for="(item, index) in list" :key="'question-' + index">
              <AIQuestionCard :info="item" v-if="item.questionType?.length > 0"/>
            </template>
          </el-scrollbar>
        </template>
        <template v-else-if="!hasProblem && !isLoading">
          <div class="full-div flexCenter">
            <img class="empty" src="@/assets/emptyLiterature.png">
            暂无关键问题与优化项
          </div>
        </template>
        <template v-else-if="isLoading">
          <div class="full-div flexCenter loading-div">
            <div class="loading-img">
              <AILoading ></AILoading>
            </div>
            重新校验中...
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'QualityCheckReport',
  inheritAttrs: false
})
import AIQualityResult from '@/components/AI/AIQualityResult.vue'
import AIQuestionCard from '@/components/AI/AIQuestionCard.vue'
const emits = defineEmits(['handleCheck', 'handleBack', 'handleEdit'])
import { computed } from 'vue'
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  qualityResult: {
    type: Object,
    default: () => ({})
  },
  list: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})
// 判断是否有问题
const hasProblem = computed(() => {
  return props.list.some(item => item.questionType && item.questionType.length > 0)
  // return false
})
// 重新校验
const reCheck = () => {
  emits('handleCheck')
}
// 返回
const toBack = () => {
  emits('handleBack')
}
// 一键编辑
const toEdit = () => {
  emits('handleEdit')
}
</script>
<style scoped lang="scss">
.qualityCheckReport {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 0;
  .top-div {
    display: flex;
    box-sizing: border-box;
    height: 170px;
    padding: 19px 68px 20px 34px;
    border-radius: 8px;
    background-color: var(--theme-card);
    img {
      width: 131px;
      height: 131px;
      margin-right: 42px;
    }
    :deep(.qualityResult) {
      .score-div {
        font-size: 25px;
      }
      .description {
        .left {
          flex: inherit;
          margin-right: 36px;
        }
      }
      .leftContianer {
        margin-left: 0;
      }
    }
    .operation {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 52px;
      div {
        width: 125px;
        height: 46px;
        border-radius: 32px;
        cursor: pointer;
        user-select: none;
        font-weight: 600;
        font-size: 20px;
        &.btn1 {
          background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
          color: #fff;
        }
        &.btn2 {
          margin-top: 15px;
          border: 1px solid #d8d8d8;
          color: var(--theme-text-2);
        }
      }
    }
  }
  .main-div {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 0;
    margin-top: 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px 12px 21px;
      font-weight: 600;
      font-size: 20px;
      .left {
        color: #1265f8;
        &.hasProblem {
          color: #ff4e4e;
          i {
            color: #ff4e4e;
          }
        }
        i {
          margin-right: 10px;
          font-size: 20px;
          color: #1265f8;
        }
      }
      .right {
        .el-button {
          width: 104px;
          height: 40px;
          border-radius: 32px;
          font-weight: 700;
          font-size: 18px;
        }
      }
    }
    .main-list {
      display: flex;
      flex: 1;
      height: 0;
      padding-left: 24px;
      padding-bottom: 24px;
      .el-scrollbar {
        width: 100%;
        height: 100%;
        padding-right: 24px;
      }
      .loading-div {
        font-size: 16px;
        color: var(--theme-text-2);
      }
      .full-div {
        display: flex;
        flex-direction: column;
        flex: 1;
        color: var(--theme-text-2);
        .empty {
          width: 67px;
          margin-bottom: 17px;
        }
        .loading-img {
          width: 126px;
          height: 126px;
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>

