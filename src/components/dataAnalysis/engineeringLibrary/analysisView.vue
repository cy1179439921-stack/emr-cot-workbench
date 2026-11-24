<template>
  <div class="analysisView">
    <div class="analysisView-left">
      <div v-if="showJump" class="jump-header">
        <SvgIcon iconName="icon-tiaozhuan-2"></SvgIcon>
        <div class="jump-text">跳转至</div>
        <SvgIcon class="arrowDown" iconName="icon-xia3"></SvgIcon>
        <span class="span-text span-text1">{{jumpData.creator}}</span>
        <span class="span-text span-text2">{{jumpData.createTime}}</span>
        <div class="expand-btn" @click="toExpand(true)" v-if="!expand">
          <span>展开</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <div class="expand-btn" @click="toExpand(false)" v-else>
          <span>收起</span>
          <el-icon><ArrowUp /></el-icon>
        </div>
      </div>
      <div class="jump-info" v-if="showJump && !expand">
        <header>{{jumpData.smallGroup}}</header>
        <div class="info-item">
          <span>节点名称</span>
          <span>{{jumpData.operateDetail}}</span>
        </div>
        <div class="info-item">
          <span>操作人</span>
          <span>{{jumpData.creator}}</span>
        </div>
        <div class="info-item">
          <span>操作时间</span>
          <span>{{jumpData.createTime}}</span>
        </div>
      </div>
      <el-scrollbar class="analysisView-left-scroll" height="100%" v-show="!showJump || expand">
        <analysisTool
          :downloadId="'capturePDFId' + tabIndex"
          :currentNode="currentNode"
          @exportPDF="exportPDF"
          @toSign="toSign"
          @toEditCode="toEditCode"
          ref="toolRef"
          v-if="analysisResult"
        />
        <baseLineAnalysisResult
          v-if="!showJump||expand"
          :currentNode="currentNode"
          :pageId="'capturePDFId' + tabIndex"
          :analysisResult="analysisResult"
          ref="baseLineAnalysisResultRef"/>
        <div class="end-position-hasContent" v-if="analysisResult">———— 到底了————</div>
      </el-scrollbar>
      <div class="end-position-empty" v-if="!analysisResult">———— 到底了————</div>
    </div>
    <div class="analysisView-right">
      <el-scrollbar class="container-scrollbar">
        <div class="titleDiv"><i class="iconfont icon-bianliangxuanze"></i>变量选择</div>
        <!-- <div class="titleDiv">
          <div class="div1">定量<el-input v-model="dlCount" placeholder="定量个数" clearable @change="changeDlDXCount"/></div>
          <div class="div1">定性<el-input v-model="dxCount" placeholder="定性个数" clearable @change="changeDlDXCount"/></div>
        </div> -->

        <div class="variable-select">
          <component
            :jumpData="jumpData"
            :dataOperateId="showJump ? jumpData.id : dataOperateId"
            :engineeringInfo="engineeringInfo"
            :currentNode="currentNode"
            :is="compUrl"
            ref="compUrlRef"
            @showLoading="showLoading"
            @getResultData="getResultData"
            v-if="props.dataOperateId"
          >
          </component>
        </div>
      </el-scrollbar>
      <div class="bottom-btn">
        <loading-btn type="primary" @handleSubmit="toRunComponentMethod()" ref='loadingBtnDom'>开始分析</loading-btn>
      </div>
    </div>
    <editCode
      ref="editCodeRef"
      :dataOperateId="analysisResult?.node_id"
      @toRunComponentMethod="toRunComponentMethod"
      v-if="analysisResult && analysisResult.node_id"
    >
    </editCode>
  </div>
</template>
<script setup>
defineOptions({
  name: 'AnalysisView',
  inheritAttrs: false
})
import { ref, computed, defineAsyncComponent, watch, nextTick } from 'vue'
import baseLineAnalysisResult from '@/components/dataAnalysis/engineeringLibrary/baseLineAnalysisResult.vue'
import analysisTool from '@/components/dataAnalysis/engineeringLibrary/analysisTool.vue'
import pdf from '@/utils/pdf.js'
import { signNode, getNodeDetail } from '@/api/api_dataAnalysis.js'
import editCode from '@/components/dataAnalysis/engineeringLibrary/editCode.vue'
import { nowDate } from '@/utils/utils'
import { emitter } from '@/utils/bus'
const emits = defineEmits(['clearJumpData'])
const props = defineProps({
  dataOperateId: {
    type: String
  },
  engineeringInfo: {
    type: Object,
    required: true
  },
  currentNode: {
    type: Object,
    required: true
  },
  tabIndex: {
    type: Number
  },
  jumpData: {
    type: Object
  }
})
const dxCount = ref(0)
const dlCount = ref(0)

const components = {
  normalityTest: () => import('@/components/dataAnalysis/engineeringLibrary/normalityTest.vue'),
  multipleDistributionTest: () => import('@/components/dataAnalysis/engineeringLibrary/multipleDistributionTest.vue'),
  tTestAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/tTestAnalysis.vue'),
  tTestPairingAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/tTestPairingAnalysis.vue'),
  tTestIndependentAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/tTestIndependentAnalysis.vue'),
  onewayAnova: () => import('@/components/dataAnalysis/engineeringLibrary/onewayAnova.vue'),
  goodnessChisquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/goodnessChisquareTest.vue'),
  chisquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/chisquareTest.vue'),
  mannWhitneyUTest: () => import('@/components/dataAnalysis/engineeringLibrary/mannWhitneyUTest.vue'),
  pairedChisquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/pairedChisquareTest.vue'),
  CMHstratifiedChisquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/CMHstratifiedChisquareTest.vue'),
  trendChisquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/trendChisquareTest.vue'),
  wilcoxonTest: () => import('@/components/dataAnalysis/engineeringLibrary/wilcoxonTest.vue'),
  independentKWTest: () => import('@/components/dataAnalysis/engineeringLibrary/independentKWTest.vue'),
  independentKSTest: () => import('@/components/dataAnalysis/engineeringLibrary/independentKSTest.vue'),
  pearsonAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/pearsonAnalysis.vue'),
  cochransQ: () => import('@/components/dataAnalysis/engineeringLibrary/cochransQ.vue'),
  pairFriedmanTest: () => import('@/components/dataAnalysis/engineeringLibrary/pairFriedmanTest.vue'),
  singleSampleTest: () => import('@/components/dataAnalysis/engineeringLibrary/singleSampleTest.vue'),
  doubleSampleTest: () => import('@/components/dataAnalysis/engineeringLibrary/doubleSampleTest.vue'),
  postMultipleComparison: () => import('@/components/dataAnalysis/engineeringLibrary/postMultipleComparison.vue'),
  kappaTest: () => import('@/components/dataAnalysis/engineeringLibrary/kappaTest.vue'),
  kendallTest: () => import('@/components/dataAnalysis/engineeringLibrary/kendallTest.vue'),
  correlationCoefficientComparison: () => import('@/components/dataAnalysis/engineeringLibrary/correlationCoefficientComparison.vue'),
  oneVariableLinearRegression: () => import('@/components/dataAnalysis/engineeringLibrary/oneVariableLinearRegression.vue'),
  multipleLinearRegression: () => import('@/components/dataAnalysis/engineeringLibrary/multipleLinearRegression.vue'),
  logisticRegression: () => import('@/components/dataAnalysis/engineeringLibrary/logisticRegression.vue'),
  poissonRegression: () => import('@/components/dataAnalysis/engineeringLibrary/poissonRegression.vue'),
  conditionalLogisticsRegression: () => import('@/components/dataAnalysis/engineeringLibrary/conditionalLogisticsRegression.vue'),
  unorderedLogisticsRegression: () => import('@/components/dataAnalysis/engineeringLibrary/unorderedLogisticsRegression.vue'),
  orderlyLogisticsRegression: () => import('@/components/dataAnalysis/engineeringLibrary/orderlyLogisticsRegression.vue'),
  survivalAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/survivalAnalysis.vue'),
  proportionalRiskCOXRegression: () => import('@/components/dataAnalysis/engineeringLibrary/proportionalRiskCOXRegression.vue'),
  ARIMAModel: () => import('@/components/dataAnalysis/engineeringLibrary/ARIMAModel.vue'),
  SARIMAModel: () => import('@/components/dataAnalysis/engineeringLibrary/SARIMAModel.vue'),
  distributedHysteresisNonlinearModel: () => import('@/components/dataAnalysis/engineeringLibrary/distributedHysteresisNonlinearModel.vue'),
  decisionTree: () => import('@/components/dataAnalysis/engineeringLibrary/decisionTree.vue'),
  randomForest: () => import('@/components/dataAnalysis/engineeringLibrary/randomForest.vue'),
  localSpatialAutocorrelation: () => import('@/components/dataAnalysis/engineeringLibrary/localSpatialAutocorrelation.vue'),
  globalSpatialAutocorrelation: () => import('@/components/dataAnalysis/engineeringLibrary/globalSpatialAutocorrelation.vue'),
  XGBoost: () => import('@/components/dataAnalysis/engineeringLibrary/XGBoost.vue'),
  supportVectorMachine: () => import('@/components/dataAnalysis/engineeringLibrary/supportVectorMachine.vue'),
  regularizedLogisticRegression: () => import('@/components/dataAnalysis/engineeringLibrary/regularizedLogisticRegression.vue'),
  KNN: () => import('@/components/dataAnalysis/engineeringLibrary/KNN.vue'),
  kMeansClustering: () => import('@/components/dataAnalysis/engineeringLibrary/kMeansClustering.vue'),
  multilayerPerceptron: () => import('@/components/dataAnalysis/engineeringLibrary/multilayerPerceptron.vue'),
  feedforwardNeuralNetwork: () => import('@/components/dataAnalysis/engineeringLibrary/feedforwardNeuralNetwork.vue'),
  convolutionalNeuralNetwork: () => import('@/components/dataAnalysis/engineeringLibrary/convolutionalNeuralNetwork.vue'),
  recurrentNeuralNetwork: () => import('@/components/dataAnalysis/engineeringLibrary/recurrentNeuralNetwork.vue'),
  multipleFactorAnova: () => import('@/components/dataAnalysis/engineeringLibrary/multipleFactorAnova.vue'),
  covarianceAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/covarianceAnalysis.vue'),
  repeatedMeasuresAnova: () => import('@/components/dataAnalysis/engineeringLibrary/repeatedMeasuresAnova.vue'),
  principalComponentAnalysis: () => import('@/components/dataAnalysis/engineeringLibrary/principalComponentAnalysis.vue'),
  fourGridChiSquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/fourGridChiSquareTest.vue'),
  pairedFourGridChiSquareTest: () => import('@/components/dataAnalysis/engineeringLibrary/pairedFourGridChiSquareTest.vue'),
  lassoRegression: () => import('@/components/dataAnalysis/engineeringLibrary/lassoRegression.vue'),
  hierarchicalRegression: () => import('@/components/dataAnalysis/engineeringLibrary/hierarchicalRegression.vue')
}
const compUrl = computed(() => {
  return defineAsyncComponent(components[props.currentNode.component])
})
const loadingBtnDom = ref(null) // 开始分析按钮实例
const compUrlRef = ref(null) // 组件实例
const editCodeRef = ref(null) // 编辑代码弹窗
const analysisResult = ref(null) // 分析结果
const sign = ref(false) // 是否是核心节点
const expand = ref(false)
const baseLineAnalysisResultRef = ref(null)
// 监听currentNode，切换节点时清空newAnalysisResult
watch(() => props.currentNode, (newVal, oldVal) => {
  if (newVal.name !== oldVal.name && !props.jumpData) {
    analysisResult.value = null
    nextTick(() => {
      if (toolRef.value) {
        toolRef.value.setSign(0)
      }
    })
    dlCount.value = 0
    dxCount.value = 0
    // 清空跳转数据
    // showJump.value = false
    emits('clearJumpData', null)
  }
})
const showJump = ref(false)
// 监听props.jumpData变化，更新高亮节点（跳转节点需求）
watch(() => props.jumpData, (val) => {
  if (val) {
    showJump.value = true
    expand.value = false
    analysisResult.value = {
      name: val.smallGroup,
      node_id: val.id,
      coreFlag: val.coreFlag,
      coreDescription: val.coreDescription,
      ...JSON.parse(val.result)
    }
    nextTick(() => {
      toolRef.value.setSign(val.coreFlag)
    })
  } else {
    showJump.value = false
    expand.value = false
    analysisResult.value = null
  }
}, {
  deep: true,
  immediate: true
})
const showLoading = () => {
  console.log(11)
  baseLineAnalysisResultRef.value.showDescriptionLoading()
}
const getResultData = (data) => {
  analysisResult.value = data
  // 进行了新的分析方法
  showJump.value = false
  expand.value = false
  sign.value = false
  nextTick(() => {
    toolRef.value.setSign(false)
  })
}
const toolRef = ref(null)
// 标记为核心节点
const toSign = async (val) => {
  if (analysisResult.value && analysisResult.value.node_id) {
    const params = {
      id: analysisResult.value.node_id,
      coreFlag: val
    }
    if (val === 0) {
      params.coreDescription = ''
    }
    const { code } = await signNode(params)
    if (code === 10000) {
      sign.value = val
      toolRef.value.setSign(val)
      if (!val) {
        analysisResult.value.coreFlag = 0
        analysisResult.value.coreDescription = ''
      } else {
        analysisResult.value.coreFlag = 1
      }
    }
  }
}
// 下载PDF
const exportPDF = async () => {
  await baseLineAnalysisResultRef.value.handlePlotlyToImg()
  pdf.downloadPDF(baseLineAnalysisResultRef, 'capturePDFId' + props.tabIndex, `${props.currentNode.name}_${nowDate()}`)
}
// 展开 收起
const toExpand = (val) => {
  expand.value = val
}
const reloadData = async () => {
  if (analysisResult.value?.node_id) {
    const { code, data } = await getNodeDetail({
      id: analysisResult.value.node_id
    })
    if (code === 10000) {
      analysisResult.value.coreFlag = data.coreFlag
      toolRef.value.setSign(data.coreFlag)
      analysisResult.value.coreDescription = data.coreDescription
      analysisResult.value.result = JSON.parse(data.result).result
    }
  }
}

const toRunComponentMethod = (params) => {
  compUrlRef.value?.beginAnalysis(params, () => {
    emitter.emit('closeLoading')
  })
}

// 打开编辑代码弹窗
const toEditCode = () => {
  editCodeRef.value.openCodeEditor()
}

const closeLoading = () => {
  loadingBtnDom.value?.handleLoading()
}

defineExpose({
  reloadData,
  closeLoading
})
// const changeDlDXCount = () => {
//   compUrlRef.value?.selectVariable(dlCount.value, dxCount.value)
// }

</script>
<style scoped lang="scss">
.analysisView {
  display: flex;
  flex: 1;
  .analysisView-left {
    display: flex;
    position: relative;
    flex-direction: column;
    flex: 1;
    width: 0;
    .jump-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      .svg-icon:nth-child(1) {
        width: 20px;
      }
      .arrowDown {
        width: 12px;
        margin-left: 6px;
      }
      .jump-text {
        margin-left: 6px;
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-text);
      }
      .span-text {
        color: var(--theme-text-2);
        &.span-text1 {
          margin-left: 24px;
        }
        &.span-text2 {
          margin-left: 6px;
        }
      }
      .expand-btn {
        display: flex;
        align-items: center;
        margin-left: 16px;
        cursor: pointer;
        color: var(--theme-primary);
        .el-icon {
          margin-left: 5px;
        }
      }
    }
    .jump-info {
      box-sizing: border-box;
      padding: 16px 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      header {
        margin-bottom: 10px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .info-item {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        color: var(--theme-text-2);
      }
    }
    .end-position-empty {
      position: absolute;
      bottom: 24px;
      width: 100%;
      text-align: center;
      color: var(--theme-text-3);
    }
    .analysisView-left-scroll {
      :deep(.el-scrollbar__view) {
        position: relative;
        .analysisTool {
          position: absolute;
          right: 24px;
          top: 16px;
        }
      }
      .end-position-hasContent {
        width: 100%;
        margin-top: 24px;
        text-align: center;
        color: var(--theme-text-3);
      }
    }
  }
  .analysisView-right {
    display: flex;
    flex-direction: column;
    // box-sizing: border-box;
    width: 424px;
    margin-left: 16px;
    padding: 24px 0 0 0;
    border-radius: 8px;
    background-color: var(--theme-card);
    .titleDiv {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 0 24px 0;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
      i {
        margin-right: 10px;
        font-size: 20px;
        color: var(--theme-primary);
      }
      .div1 {
        display: flex;
        align-items: center;
        padding: 0 10px;
        &:nth-child(1) {
          margin-right: 16px;
        }
        .el-input {
          flex: 1;
          width: 120px;
          margin-left: 6px;
        }
      }
    }
    .variable-select {
      display: flex;
      flex: 1;
      height: 0;
    }
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
    :deep(.container-scrollbar) .el-scrollbar__view {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }
    .bottom-btn {
      display: flex;
      justify-content: space-between;
      box-sizing: border-box;
      margin: 16px 0;
      padding: 0 16px;
      :deep(.el-button) {
        width: 100%;
        height: 40px;
        font-weight: 500;
        font-size: 16px;
        letter-spacing: 2px;
      }
    }
  }
}
</style>
