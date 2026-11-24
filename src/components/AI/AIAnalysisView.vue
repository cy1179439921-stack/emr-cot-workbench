<template>
  <div class="AIAnalysisView">
    <el-scrollbar>
      <div class="method" v-for="(item, index) in count" :key="'method' + index">
        <div class="left-line">
          <div class="circle flexCenter">{{index+1}}</div>
          <div class="line"></div>
        </div>
        <div class="right-method">
          <div class="right-header">
            <div class="select-div big-method">
              <div>方法类别选择</div>
              <el-select v-model="item.bigMethod" placeholder="请选择方法类别" @change="() => { item.smallMethod = '' }">
                <el-option
                  v-for="method in analysisMethodList"
                  :key="method.name"
                  :label="method.name"
                  :value="method.name"
                >
                </el-option>
              </el-select>
            </div>
            <div class="select-div small-method">
              <div>方法选择</div>
              <el-select v-model="item.smallMethod" placeholder="请选择方法类别">
                <el-option
                  v-for="method in getSmallMethodList(item)"
                  :key="method.name"
                  :label="method.name"
                  :value="method.name"
                >
                </el-option>
              </el-select>
            </div>
          </div>
          <div class="right-title">参数选择</div>
          <div class="select-variable">
            <component
              :is="getCompUrl(item)"
              :dataOperateId="dataOperateId"
              :engineeringInfo="engineeringInfo"
              :currentNode="currentNode"
              :variables="variables"
              :key="item.component"
              ref="compUrlRef" v-if="item.smallMethod">
            </component>
            <EmptyMethod v-else/>
          </div>
        <!-- <AICommonMethod/> -->
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
defineOptions({
  name: 'AIAnalysisView'
})
import { ref, defineAsyncComponent } from 'vue'
// import { useData } from '@/components/dataAnalysis/hooks/analysisViewHooks'
import { analysisMethodList } from '@/components/AI/js/AICommonData.js'
import EmptyMethod from '@/components/dataAnalysis/engineeringLibrary/emptyMethod.vue'
import { useAgentStore } from '@/store/agentStore.js'
const agentStore = useAgentStore()
const variables = agentStore.variables

const dataOperateId = ref('1143004521119748096')
const engineeringInfo = ref({})
const currentNode = ref({})
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
const count = ref([
  {
    bigMethod: '差异性分析',
    smallMethod: '配对样本T检验'
  },
  {
    bigMethod: '回归分析',
    smallMethod: 'logistic回归'
  }
])

const getSmallMethodList = (item) => {
  const bigMethod = analysisMethodList.find((method) => method.name === item.bigMethod)
  return bigMethod ? bigMethod.children : []
}
const compUrlRef = ref(null)
// 缓存已创建的异步组件，避免重复创建导致循环渲染
const componentCache = new Map()

// 简单包装器：直接设置全局变量供 useData 使用
const createSimpleWrapper = (componentName) => {
  return defineAsyncComponent({
    loader: async () => {
      // 设置全局变量，供 useData hook 使用
      window.__AI_COMPONENT_VARIABLES__ = null

      // 加载原始组件
      const OriginalComponent = await components[componentName]()

      // 返回增强的组件
      return {
        ...OriginalComponent.default,
        name: `Wrapped_${componentName}`,
        props: {
          ...OriginalComponent.default.props,
          // 添加 variables 属性
          variables: {
            type: Array,
            default: () => []
          }
        },
        setup(props, ctx) {
          // 设置全局变量，供 useData hook 中的 init 函数使用
          window.__AI_COMPONENT_VARIABLES__ = 'AI_COMPONENT_VARIABLES'

          // 调用原始 setup
          const originalResult = OriginalComponent.default.setup ? OriginalComponent.default.setup(props, ctx) : {}

          return originalResult
        }
      }
    }
  })
}

const getCompUrl = (item) => {
  if (!item || !item.bigMethod || !item.smallMethod) {
    return null
  }

  const bigMethod = analysisMethodList.find((method) => method.name === item.bigMethod)
  if (bigMethod) {
    const smallMethod = bigMethod.children.find((method) => method.name === item.smallMethod)
    if (smallMethod && smallMethod.component) {
      // 为 item 添加 component 属性，用于作为 key
      item.component = smallMethod.component

      const cacheKey = item.component

      // 如果已经缓存过，直接返回
      if (componentCache.has(cacheKey)) {
        return componentCache.get(cacheKey)
      }

      let asyncComponent = null
      if (components[item.component]) {
        // 使用简单包装组件
        asyncComponent = createSimpleWrapper(item.component)
      } else {
        // 组件不存在，返回 null
        asyncComponent = null
      }

      // 缓存组件
      componentCache.set(cacheKey, asyncComponent)
      return asyncComponent
    }
  }

  // 如果没找到对应的方法，返回 null
  return null
}
</script>

<style scoped lang="scss">
.AIAnalysisView {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 0;
  .el-scrollbar {
    padding-right: 22px;
  }
  .method {
    display: flex;
    &:not(:first-child) {
      margin-top: 16px;
    }
    .left-line {
      display: flex;
      flex-direction: column;
      align-items: center;
      .circle {
        width: 23px;
        height: 23px;
        border-radius: 23px;
        background: var(--theme-primary);
        font-weight: 600;
        color: #fff;
      }
      .line {
        flex: 1;
        width: 1px;
        margin-top: 15px;
        background-color: var(--theme-primary);
      }
    }
    .right-method {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 0;
      margin-left: 16px;
      .right-header {
        display: flex;
        width: 100%;
        .select-div {
          display: flex;
          flex-direction: column;
          flex: 1;
          div:nth-child(1) {
            margin-bottom: 16px;
            font-weight: 600;
            color: var(--theme-text);
          }
        }
        // .big-method {
        // }
        .small-method {
          margin-left: 32px;
        }
      }
      .right-title {
        margin-top: 16px;
        margin-bottom: 16px;
        font-weight: 600;
        color: var(--theme-text);
      }
      :deep(.select-variable) {
        .variable-selection-area {
          .mainTop {
            padding: 0;
            .topLeft {
              flex: 1;
              width: 0;
              background-color: var(--theme-card);
            }
            .topCenter {
              flex: initial;
              width: 60px;
            }
            .topRight {
              flex: 1;
              width: 0;
              background-color: var(--theme-card);
            }
          }
          .main2 {
            min-height: 76px;
            padding: 0;
            border-radius: 2px;
            background-color: var(--theme-card);
            .titleDiv {
              justify-content: flex-start;
              height: 38px;
              margin-bottom: 0;
              padding-left: 13px;
              border-bottom: 1px solid #e8e8e8;
              i {
                display: none;
              }
            }
            .main2Content {
              padding: 18px;
            }
          }
        }
      }
    }
  }
}
</style>

