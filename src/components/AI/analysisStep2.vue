<template>
  <div class="analysisStep2">
    <div class="main1">
      <div class="section left">
        <header>AI分析规划</header>
        <div class="div1">
          <img src="@/assets/dataset1.png">
          <span class="text1">当前数据集：</span>
          <span>数据总量：146</span>
          <span class="line"></span>
          <span>变量数：189</span>
        </div>
        <div class="div2 preview">
          <el-scrollbar>
            <div class="html-content">
              <!-- 默认30ms -->
              <!-- <Printer
                :previewContent="previewContent"
                :speed="30"
                @complete="handleComplete"
              /> -->
              <CommonMarkdown :source="customContent" @jump="handleJump" @update:source="handleContentUpdate"/>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="section right">
        <header>数据管理与分析结果</header>
        <div class="div1">
          <img src="@/assets/dataset2.png">
          <span class="text1">变量统计：</span>
          <span>总变量数：189</span>
        </div>
        <div class="div2">
          <header>变量可视化</header>
          <div class="dataVisualContainer">
            <AIDataVisualizeN></AIDataVisualizeN>
          </div>
        </div>
      </div>
    </div>
    <div class="main2">
      <el-button type="primary" @click="handleNextStep" :disabled="loading">
        <i class="iconfont icon-yijianbianji" v-if="!btnLoading"></i>
        <Loading :size="16" color="#fff" v-else/>
        数据处理&模型构建
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AIDataVisualizeN from './AIDataVisualizeN.vue'
const emits = defineEmits(['handleNextStep'])
// import Printer from '@/components/AI/printer.vue'
import CommonMarkdown from '@/components/AI/commonMarkdown.vue'
import { text } from '@/components/AI/a.js'
const loading = ref(false)
const btnLoading = ref(false)
const handleNextStep = () => {
  btnLoading.value = true
  setTimeout(() => {
    btnLoading.value = false
    emits('handleNextStep')
  }, 3000)
}
// const previewContent = `
// <h4>数据集概述</h4>
// 该数据集包含 146 条记录，涵盖了 189 个字段，内容涉及患者的基本信息（如性别、年龄等）、疾病相关信息（如主要诊断、出血部位等）、治疗方式（如脑出血手术方式）、术前评估指标（如发病前 mRS 评分、入院 NIHSS 评分等）、术中指标（如手术开始时间）以及术后及疗效评估指标（如术后 mRS 评分、并发症情况）等，可用于神经内镜与立体定向穿刺治疗中等量基底节区脑出血的疗效与安全性对比研究。</br>
// 需要的数据治理操作</br>
// <h4>数据处理</h4>
// <h4>1. 空值处理：</h4>从输出情况来看，数据中存在一些缺失值（如发病至门急诊时间等字段）。对于数值型字段，若缺失值较少，可考虑用均值、中位数填充；若缺失值较多，可能需要结合其他相关字段进行预测填充或者将缺失值作为一个特殊类别处理。对于分类型字段，可根据众数进行填充，或者创建一个新的类别表示缺失。</br>
// <h4>2. 异常值处理：</h4>检查数据中的异常值，例如年龄、出血大小等字段是否存在不符合实际情况的值。对于异常值，可根据业务逻辑判断是数据录入错误还是真实的极端情况。若是录入错误，进行修正；若是真实极端情况，可单独分析或者根据具体分析目的决定是否保留。
// `
// eslint-disable-next-line max-len
const customContent = ref(text)
// const handleComplete = () => {
//   loading.value = false
// }
const handleJump = (param1, param2) => {
  console.log('点击参数:', param1, param2)
  // 处理跳转逻辑
}

// 处理内容更新
const handleContentUpdate = (newContent) => {
  customContent.value = newContent
}
</script>
<style scoped lang="scss">
.analysisStep2 {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 0;
  margin-top: 16px;
  .main1 {
    display: flex;
    flex-direction: row;
    flex: 1;
    width: 100%;
    height: 0;
  }
  .main2 {
    box-sizing: border-box;
    height: 91px;
    margin-top: 16px;
    padding: 20px 24px;
    border-radius: 8px;
    background: var(--theme-card);
    text-align: center;
    .el-button {
      width: 269px;
      height: 51px;
      border-radius: 51px;
      background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
      font-weight: 500;
      font-size: 16px;
      .iconfont {
        margin-right: 12px;
      }
      :deep(.loading) {
        margin-right: 12px;
      }
      &.is-disabled {
        background: linear-gradient(111deg, rgba(96, 92, 251, 0.5) 0%, rgba(69, 148, 249, 0.5) 100%);
        cursor: not-allowed;
      }
    }
  }
  header {
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-primary);
  }
  .section {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 0;
    padding: 16px 24px 24px 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .div1 {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      height: 70px;
      margin-top: 16px;
      padding-left: 24px;
      border: 1px solid #c9d8fc;
      border-radius: 8px;
      background: var(--theme-primary-soft);
      font-weight: 500;
      img {
        width: 27px;
      }
      .text1 {
        margin-left: 12px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-primary);
      }
      .line {
        display: inline-block;
        width: 1px;
        height: 14px;
        margin-left: 12px;
        margin-right: 12px;
        background-color: #666;
      }
    }
    .div2 {
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-top: 16px;
      border: 1px solid #c9d8fc;
      border-radius: 8px;
      background: var(--theme-primary-soft);
      .dataVisualContainer {
        flex: 1;
        height: 0;
        margin-top: 16px;
        padding: 16px;
        background-color: var(--theme-card);
      }
    }
  }
  .left {
    .preview {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      height: 0;
      margin-top: 19px;
      border: 1px solid #c9d8fc;
      border-radius: 8px;
      background: var(--theme-primary-soft);
      :deep(.html-content) {
        flex: 1;
        padding: 0 22px 22px 22px;
        color: var(--theme-text-2);
        h4 {
          color: var(--theme-text);
        }
      }
      .html-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: 500;
        color: var(--theme-primary);
        img {
          width: 12px;
          margin-right: 8px;
        }
        &.html-footer1 {
          height: 45px;
          border-top: 1px solid #c9d8fc;
        }
        &.html-footer2 {
          padding: 24px;
        }
      }
    }
  }
  .right {
    margin-left: 16px;
    .div2 {
      box-sizing: border-box;
      padding: 20px 16px;
      img {
        width: 100%;
        margin-top: 19px;
      }
    }
  }
}

</style>
