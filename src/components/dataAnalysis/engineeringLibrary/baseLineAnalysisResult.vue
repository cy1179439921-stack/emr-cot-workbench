<template>
  <div class="baseLineAnalysisResult" :id="pageId">
    <div class="sectionDiv">
      <div class="title">
        <div class="node-name">
          <i class="iconfont" :class="currentNode.icon"></i>
          <span>{{ currentNode.name }}</span>
        </div>
      </div>
      <div class="coreNode noDownload" v-if="newAnalysisResult?.coreFlag === 1">
        <commonSubTitle text="核心节点描述"></commonSubTitle>
        <i class="iconfont icon-bianji1 spanCopy" @click="toEdit" v-if="!editNodeState"></i>
      </div>
      <div class="text cardBg noDownload marginT16 description-div" v-if="newAnalysisResult?.coreFlag === 1">
        <span
          class="noNodeState"
          v-if="!editNodeState"
        >{{ newAnalysisResult?.coreDescription ? newAnalysisResult.coreDescription : '暂无描述' }}</span
        >
        <el-input
          autofocus
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="请填写，140字以内"
          v-model="newAnalysisResult.coreDescription"
          maxlength="140"
          show-word-limit
          @blur="saveNodeDescription"
          ref="inputName"
          v-else
        >
        </el-input>
      </div>
      <commonSubTitle text="功能介绍"></commonSubTitle>
      <div class="text cardBg marginT16">
        <div
          class="explain"
          :class="item === '多分布检验类型解释' ? 'weight' : ''"
          v-for="(item, index) in currentNode.explain"
          :key="index"
          v-html="item"
        ></div>
      </div>
      <commonSubTitle class="marginT24" text="输入输出提示"></commonSubTitle>
      <div class="text cardBg marginT16">
        <div class="divTip">
          输入：
          <div v-html="currentNode.inputHint"></div>
        </div>
        <div class="divTip">
          输出：
          <div v-html="currentNode.outputHint"></div>
        </div>
      </div>
      <commonSubTitle class="marginT24" text="参数设置" v-if="newAnalysisResult && newAnalysisResult.node_id"></commonSubTitle>
      <div class="text cardBg marginT16" v-if="!isLoading && newAnalysisResult && newAnalysisResult.node_id">
        <ul>
          <li v-for="(item, index) in newAnalysisResult.input_params" :key="index">
            {{ item.label }}：{{ item.value }}
          </li>
        </ul>
      </div>
    </div>
    <div class="sectionDiv2" v-if="!isLoading && newAnalysisResult && newAnalysisResult.node_id">
      <div class="title">
        <div class="node-name">
          <i class="iconfont icon-fenxijieguo"></i>
          <span>分析结果</span>
        </div>
      </div>
      <div class="sectionDiv2-content">
        <commonSubTitle class="title2" text="结果描述" v-if="isShowDescription" style="display: none;"></commonSubTitle>
        <div class="text cardBg marginT16" v-if="typeof newAnalysisResult.resultDescription === 'object' && isShowDescription" v-loading="descriptionLoading" style="display: none;">
          <div v-for="(item, index) in newAnalysisResult.resultDescription" :key="'result'+index">{{item}}</div>
        </div>
        <div class="text cardBg marginT16" v-if="typeof newAnalysisResult.resultDescription !== 'object' && isShowDescription" v-loading="descriptionLoading" style="display: none;">
          <div v-if="descriptionLoading">智能结果生成中…</div>
          <div v-else>{{newAnalysisResult.resultDescription || '-'}}</div>
        </div>
        <template v-for="(item, index) in newAnalysisResult.chartArr">
          <div
            class="section"
            :key="index"
            v-if="item.type === 'table' && item.tableArr?.length > 0"
          >
            <div class="resultTitle flexBetween" :style="{ marginTop: index === 0 ? '0' : '24px' }">
              <span v-if="item.customName || item.customName === ''">{{ item.customName }}</span>
              <span v-else>{{ index + 1 }}. {{ item.name }}</span>
              <!-- <span class="spanCopy" @click="downloadGraph('resultTable' + index, item)"> -->
              <span class="spanCopy" @click="downloadExcel('#resultTable' + index, item.name)">
                <i class="iconfont icon-daochu2"></i>导出excel
                <!-- <i class="iconfont icon-daochushuju"></i> -->
              </span>
              <!-- <span class="spanCopy" @click="copyGraph('resultTable')"><i class="iconfont icon-fuzhi2"></i>复制</span> -->
            </div>
            <div class="resultTable cardBg surroundingTableBorder">
              <div :id="'resultTable' + index">
                <template v-for="(item2, index2) in item.tableArr" :key="'table2' + index2">
                  <DynamicTable2
                    :class="item2.tableClassName"
                    :className="item2.tableClassName"
                    :border="true"
                    :table-data="item2.tableData"
                    :table-header="item2.tableHeader"
                    :needFlexColumnWidth="item2.needFlexColumnWidth"
                    :columnMerge="item2.columnMerge"
                    :columnMergeArr="item2.columnMergeArr"
                    :columnIndexArr="item2.columnIndexArr"
                    :endMergeRowIndex="item2.endMergeRowIndex"
                    :lastRowNeedMerge="item2.lastRowNeedMerge"
                    :mergeTr="item2.mergeTr"
                  ></DynamicTable2>
                </template>
              </div>
              <div class="title3">图表说明：</div>
              <div class="titleText3">
                <ul>
                  <li
                    v-for="(item, index) in item.statement"
                    :key="index"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div
            class="section"
            :key="index"
            v-if="item.type === 'table' && item.tableArr?.length === 0"
          >
            <div class="resultTitle flexBetween">
              <span v-if="item.customName || item.customName === ''">{{ item.customName }}</span>
              <span v-else>{{ index + 1 }}. {{ item.name }}</span>
            </div>
            <div class="cardBg titleText4">
              <ul>
                <li
                  v-for="(item, index) in item.statement"
                  :key="index"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
          <div class="section" :key="index" v-if="item.type === 'graph'">
            <PlotlyChart
              :pageId="pageId"
              :currentNode="currentNode"
              :item="item"
              :index="index"
              ref="plotlyRefs"
              :data="item.data"
              :layout="item.layout"
              :toImageButtonOptions="{ format: 'png', filename: currentNode.name + '-' + item.name }"
              :options="item.options"
            >
            </PlotlyChart>
          </div>
        </template>
      </div>
    </div>
    <div class="loading-div" v-if="isLoading">
      加载中，请稍后...
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'BaseLineAnalysisResult',
  inheritAttrs: false
})
import { ref, watch, nextTick } from 'vue'
// import DynamicTable from '@/components/dataAnalysis/common/dynamicTable.vue'
import DynamicTable2 from '@/components/dataAnalysis/common/dynamicTable2.vue'
import PlotlyChart from '@/components/dataAnalysis/engineeringLibrary/PlotlyChart.vue'
import { exportExcel } from '@/utils/excel.js'
import { signNode, getAIResult } from '@/api/api_dataAnalysis.js'
import { ElMessage } from 'element-plus'
import { nowDate } from '@/utils/utils'
import $ from 'jquery'
// import html2canvas from 'html2canvas'
const emits = defineEmits(['syncNodeDetailData'])
const props = defineProps({
  currentNode: {
    type: Object,
    required: true
  },
  pageId: {
    type: String
  },
  coreDescription: {
    type: String
  },
  analysisResult: {
    type: Object
  }
})
const editNodeState = ref(false)
// const nodeState = computed(() => {
//   return props.coreDescription || ''
// })
// 监听analysisResult
const newAnalysisResult = ref(null)
const isLoading = ref(false)
const descriptionLoading = ref(false)
// 定时请求AI结果
const requestAIResult = () => {
  const params = {
    prompt: newAnalysisResult.value.prompt,
    dataOperateId: newAnalysisResult.value.node_id
  }
  getAIResult(params).then(res => {
    if (res.code === 10000 && res.data.result) {
      newAnalysisResult.value.resultDescription = res.data.result
      descriptionLoading.value = false
      ElMessage.success('智能描述结果生成成功')
    } else {
      // 如果result为空，则继续请求
      setTimeout(requestAIResult, 3000) // 等待3秒后再次请求
    }
  })
}
watch(
  [
    () => props.analysisResult?.coreFlag,
    () => props.analysisResult?.node_id,
    () => props.analysisResult?.name,
    () => props.currentNode
  ],
  async ([newCoreFlag, newNodeId, newName, newCurrentNode], [oldCoreFlag, oldNodeId, oldName, oldCurrentNode]) => {
    if (newCoreFlag !== oldCoreFlag || newNodeId !== oldNodeId || newName !== oldName) {
      if (newCurrentNode && newNodeId && newName === newCurrentNode.name) {
        console.log('newCurrentNode.component', newCurrentNode.component)
        const componentName = newCurrentNode.component
        if (componentName) {
          isLoading.value = true
          const module = await import(`@/components/dataAnalysis/hooks/${componentName}.js`)
          if (module && module.handleResult) {
            newAnalysisResult.value = module.handleResult(props.analysisResult)
            isLoading.value = false
          } else {
            console.error(`Module ${componentName} does not contain handleResult function`)
            isLoading.value = false
          }
          if (descriptionLoading.value && isShowDescription.value && newAnalysisResult.value.prompt) {
            // requestAIResult()
            // 临时下了AI智能描述
            descriptionLoading.value = false
          } else {
            descriptionLoading.value = false
          }
        }
      } else {
        newAnalysisResult.value = null
      }
    }
  },
  {
    immediate: true
  }
)

const isShowDescription = ref(true)
const plotlyRefs = ref(null)
// plotly图转img，对于特殊的图，如热力图，3D图，用自定义方法转成图片后，再下载pdf，否则会出现缺失
const handlePlotlyToImg = async () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async resolve => {
    // 筛选graph数组
    const graphArr = newAnalysisResult.value.chartArr.filter(item => item.type === 'graph')

    if (graphArr.length > 0) {
      const promises = graphArr.map((item, index) => {
        if (item.name.includes('热力图') || item.name.includes('3D图')) {
          if (!item.plotlyBase64) {
            // 先变宽度，再截图
            // 额外加100px（1920分辨率下）宽度
            const extraWidth = Math.round((100 / 1920) * document.documentElement.clientWidth)
            $('#' + props.pageId).css('minWidth', ($('#' + props.pageId + ' .el-table__header').width() + extraWidth) + 'px')
            return nextTick(async () => {
              item.plotlyBase64 = await plotlyRefs.value[index].plotlyToImg(props.pageId, index + 1)
            })
          }
        }
        return Promise.resolve() // 如果没有需要处理的图，返回一个已解决的Promise
      })

      await Promise.all(promises) // 等待所有Promise完成
    }

    resolve()
  })
}

// 删除plotly转的图
const deletePlotlyToImg = () => {
  const graphArr = newAnalysisResult.value.chartArr.filter(item => item.type === 'graph')
  graphArr.forEach((item, index) => {
    if (item.name.includes('热力图') || item.name.includes('3D图')) {
      item.plotlyBase64 = ''
    }
  })
}
// table表格下载为excel
const downloadExcel = (document, name) => {
  exportExcel(document, `${props.currentNode.name}_${name}_${nowDate()}`)
}
const inputName = ref(null)
// 编辑核心节点标书
const toEdit = () => {
  editNodeState.value = true
  nextTick(() => {
    if (inputName.value) {
      inputName.value.focus()
    }
  })
}
// 添加核心节点描述
const saveNodeDescription = async () => {
  const { code } = await signNode({
    id: props.analysisResult.node_id,
    coreDescription: newAnalysisResult.value.coreDescription || ''
  })
  if (code === 10000) {
    ElMessage.success('已保存')
    editNodeState.value = false
    emits('syncNodeDetailData', newAnalysisResult.value.coreDescription)
  }
}
// 同步详情里的描述信息
const syncNodeDetailData2 = (data) => {
  newAnalysisResult.value.coreDescription = data
}
const showDescriptionLoading = () => {
  descriptionLoading.value = true
}
defineExpose({
  handlePlotlyToImg,
  deletePlotlyToImg,
  syncNodeDetailData2,
  showDescriptionLoading,
  requestAIResult
})
</script>
<style scoped lang="scss">
@use '@/style/common/baseLineAnalysisResult.scss';
</style>
