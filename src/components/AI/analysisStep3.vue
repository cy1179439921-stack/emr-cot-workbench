<template>
  <div class="analysisStep3">
    <div class="main1">
      <div class="section left">
        <header>数据处理-功能操作</header>
        <div class="div1">
          <el-scrollbar>
            <div class="div1-top" v-if="showFnList.includes(1)">
              <span>空值处理</span>
              <el-button type="primary" @click="handler(1)" v-if="operation1 === 1">
                <Loading :size="16" color="#fff" v-if="btnLoading1"/>
                开始操作</el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(1)">
              <!-- <img src="@/assets/kongzhichuli1.png" v-if="operation1 === 1">
              <img src="@/assets/kongzhichuli2.png" v-if="operation1 === 2"> -->
              <AINullValueHandleResultN :engineeringInfo="engineeringInfo" ref="AINullValueHandleResultNDom"></AINullValueHandleResultN>
            </div>
            <div class="div1-top" v-if="showFnList.includes(2)">
              <span>异常值处理</span>
              <el-button type="primary" @click="handler(2)" v-if="operation2 === 1">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(2)">
              <AIOutliersHandleResultN :engineeringInfo="engineeringInfo" ref="AIOutliersHandleResultNDom"></AIOutliersHandleResultN>
            </div>
            <div class="div1-top" v-if="showFnList.includes(3)">
              <span>生成变量</span>
              <el-button type="primary" @click="handler(3)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(3)">
              <AICreateNewVariableResultN :engineeringInfo="engineeringInfo" ref="AICreateNewVariableResultNDom"></AICreateNewVariableResultN>
            </div>
            <div class="div1-top" v-if="showFnList.includes(4)">
              <span>对照组切分</span>
              <el-button type="primary" @click="handler(4)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(4)">
              <AIGroupSplitN :engineeringInfo="engineeringInfo" ref="AIGroupSplitNDom"></AIGroupSplitN>
            </div>
            <div class="div1-top" v-if="showFnList.includes(5)">
              <span>数据筛选</span>
              <el-button type="primary" @click="handler(5)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(5)">
              <AIDataFilterN :engineeringInfo="engineeringInfo" ref="AIDataFilterNDom"></AIDataFilterN>
            </div>

            <div class="div1-top" v-if="showFnList.includes(6)">
              <span>数据变换</span>
              <el-button type="primary" @click="handler(6)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(6)">
              <AIDataConversionResultN :engineeringInfo="engineeringInfo" ref="AIDataConversionResultNDom"></AIDataConversionResultN>
            </div>
            <div class="div1-top" v-if="showFnList.includes(7)">
              <span>变量变换</span>
              <el-button type="primary" @click="handler(7)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(7)">
              <AIVariableConversion :engineeringInfo="engineeringInfo" ref="AIVariableConversionDom"></AIVariableConversion>
            </div>

            <div class="div1-top" v-if="showFnList.includes(8)">
              <span>数据标准化</span>
              <el-button type="primary" @click="handler(8)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(8)">
              <AIDataStandardization :engineeringInfo="engineeringInfo" ref="AIDataStandardizationDom"></AIDataStandardization>
            </div>
            <div class="div1-top" v-if="showFnList.includes(9)">
              <span>比例抽样</span>
              <el-button type="primary" @click="handler(9)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(9)">
              <AIProportionalSampling :engineeringInfo="engineeringInfo" ref="AIProportionalSamplingDom"></AIProportionalSampling>
            </div>
            <div class="div1-top" v-if="showFnList.includes(10)">
              <span>单变量调整</span>
              <el-button type="primary" @click="handler(10)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(10)">
              <AISingleVariableAdjustment :engineeringInfo="engineeringInfo" ref="AISingleVariableAdjustmentDom"></AISingleVariableAdjustment>
            </div>

            <div class="div1-top" v-if="showFnList.includes(11)">
              <span>变量间的滞后性调整</span>
              <el-button type="primary" @click="handler(11)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                开始操作
              </el-button>
            </div>
            <div class="div1-img" v-if="showFnList.includes(11)">
              <AILagAdjustmentBetweenVariablesHandle :engineeringInfo="engineeringInfo" ref="AILagAdjustmentBetweenVariablesHandleDom"></AILagAdjustmentBetweenVariablesHandle>
            </div>
            <div class="div1-top" v-if="showFnList.includes(12)">
              <span>数据编辑</span>
              <!-- <el-button type="primary" @click="handler(12)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                生成新变量
              </el-button>
              <el-button type="primary" @click="handler(13)">
                <Loading :size="16" color="#fff" v-if="btnLoading2"/>
                覆盖旧变量
              </el-button> -->
            </div>
            <div class="div1-img" v-if="showFnList.includes(12)">
              <AIDataEditResultN :engineeringInfo="engineeringInfo" ref="AIDataEditResultNDom"></AIDataEditResultN>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="section right">
        <header>模型构建</header>
        <div class="div1">
          <header>变量可视化</header>
          <AIAnalysisView />
          <!-- <el-scrollbar>
            <img src="@/assets/moxinggoujian.png">
          </el-scrollbar> -->
        </div>
      </div>
    </div>
    <div class="main2">
      <el-button type="primary" @click="handleNextStep">
        <i class="iconfont icon-yijianbianji" v-if="!loading"></i>
        <Loading :size="16" color="#fff" v-else/>
        报告生成
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AINullValueHandleResultN from './AINullValueHandleResultN.vue'
import AIOutliersHandleResultN from './AIOutliersHandleResultN.vue'
import AICreateNewVariableResultN from './AICreateNewVariableResultN.vue'
import AIGroupSplitN from './AIGroupSplitN.vue'
import AIDataFilterN from './AIDataFilterN.vue'
import AIDataConversionResultN from './AIDataConversionResultN.vue'
import AIVariableConversion from './AIVariableConversion.vue'
import AIDataStandardization from './AIDataStandardization.vue'
import AIProportionalSampling from './AIProportionalSampling.vue'
import AISingleVariableAdjustment from './AISingleVariableAdjustment.vue'
import AILagAdjustmentBetweenVariablesHandle from './AILagAdjustmentBetweenVariablesHandle.vue'
import AIDataEditResultN from './AIDataEditResultN.vue'
import AIAnalysisView from './AIAnalysisView.vue'

// const showFnList = ref([])
const showFnList = ref([1, 2])
const engineeringInfo = ref({
  children: null,
  createTime: '2025-10-27 23:15:30',
  creator: 'admin',
  dataOperateId: '1143004521119748096',
  dataSetId: '1142804032985894912',
  dataSetName: '01卒中出院病历',
  describe: '',
  id: '1142807412399542272',
  indexSum: '0',
  level: 2,
  medicalRecordSum: '0',
  name: 'agent演示数据',
  node: '异常值处理',
  operator: 'admin',
  operatorTime: '2025-10-28 12:18:44',
  pid: '1099860133225304064',
  status: 0,
  type: 2,
  userId: '901080293132341248'
})
const emits = defineEmits(['handleNextStep'])
const loading = ref(false)
const handleNextStep = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    emits('handleNextStep')
  }, 3000)
}
const btnLoading1 = ref(false)
const btnLoading2 = ref(false)
const operation1 = ref(1)
const operation2 = ref(1)
const AINullValueHandleResultNDom = ref()
const AIOutliersHandleResultNDom = ref()
const AICreateNewVariableResultNDom = ref()
const AIGroupSplitNDom = ref()
const AIDataFilterNDom = ref()
const AIDataConversionResultNDom = ref()
const AIVariableConversionDom = ref()
const AIDataStandardizationDom = ref()
const AIProportionalSamplingDom = ref()
const AISingleVariableAdjustmentDom = ref()
const AILagAdjustmentBetweenVariablesHandleDom = ref()
const AIDataEditResultNDom = ref()
const handler = (index) => {
  if (index === 1) {
    btnLoading1.value = true
    setTimeout(() => {
      btnLoading1.value = false
      // operation1.value = 2
      AINullValueHandleResultNDom.value.handleSure()
    }, 3000)
  }
  if (index === 2) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIOutliersHandleResultNDom.value.handleSure()
      // operation2.value = 2
    }, 3000)
  }
  if (index === 3) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AICreateNewVariableResultNDom.value.handleSure()
    }, 3000)
  }
  if (index === 4) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIGroupSplitNDom.value.handleSure()
    }, 3000)
  }
  if (index === 5) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIDataFilterNDom.value.handleSure()
    }, 3000)
  }
  if (index === 6) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIDataConversionResultNDom.value.handleSure()
    }, 3000)
  }
  if (index === 7) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIVariableConversionDom.value.handleSure()
    }, 3000)
  }
  if (index === 8) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIDataStandardizationDom.value.handleSure()
    }, 3000)
  }
  if (index === 9) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIProportionalSamplingDom.value.handleSure()
    }, 3000)
  }
  if (index === 10) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AISingleVariableAdjustmentDom.value.handleSure()
    }, 3000)
  }
  if (index === 11) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AILagAdjustmentBetweenVariablesHandleDom.value.handleSure()
    }, 3000)
  }
  if (index === 12) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIDataEditResultNDom.value.handleSure()
    }, 3000)
  }
  if (index === 13) {
    btnLoading2.value = true
    setTimeout(() => {
      btnLoading2.value = false
      AIDataEditResultNDom.value.handleSure()
    }, 3000)
  }
}
</script>
<style scoped lang="scss">
.analysisStep3 {
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
      width: 217px;
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
      flex-direction: column;
      flex: 1;
      margin-top: 16px;
      padding: 0 0 20px 24px;
      border: 1px solid #c9d8fc;
      border-radius: 8px;
      background: var(--theme-primary-soft);
      .div1-top {
        display: flex;
        // justify-content: space-between;
        margin-top: 20px;
        margin-bottom: 18px;
        padding-right: 24px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-primary);
        span {
          flex: 1;
        }
        .el-button {
          width: 122px;
          height: 32px;
          border-radius: 32px;
          color: #fff;
          :deep(.loading) {
            margin-right: 12px;
          }
        }
        .div1-top-status {
          display: flex;
          align-items: center;
          color: #04a273;
          img {
            width: 16px;
            margin-right: 8px;
          }
        }
      }
      .div1-img {
        height: 600px;
        margin-right: 24px;
        padding: 24px;
        border-radius: 4px;
        background-color: var(--theme-card);
        :deep(.data-cleansing) {
          height: 600px;
          .leftPanel {
            flex-shrink: 0;
            width: 65%;
          }
        }
        img {
          width: 100%;
        }
        :deep(.el-table) {
          .el-table__header thead tr th:first-child .cell {
            padding-left: 6px;
            padding-right: 6px;
            text-align: center;
          }
          .el-table__body tbody tr td:first-child .cell {
            padding-left: 24px;
          }
        }
      }
    }
  }
  .left {
    .div1 {
      height: 0;
    }
  }
  .right {
    display: flex;
    flex-direction: column;
    margin-left: 16px;
    .div1 {
      flex: 1;
      height: 0;
      header {
        margin-top: 19px;
        margin-bottom: 20px;
      }
      img {
        width: 100%;
      }
    }
  }
}

</style>
