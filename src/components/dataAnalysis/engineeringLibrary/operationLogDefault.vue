<template>
  <div class="operationLogDefault" v-if="showDetails">
    <div class="header">
      <span>详情</span>
      <i class="iconfont icon-dankuang-shanchu" @click="close"></i>
    </div>
    <div class="content">
      <el-scrollbar class="content-scroll">
        <projectDefault v-if="isProjectNode" :nodeData="nodeData"></projectDefault>
        <baseLineAnalysisResult
          :currentNode="currentNode"
          :sign="sign"
          :pageId="downloadId"
          :analysisResult="analysisResult"
          @syncNodeDetailData="syncNodeDetailData"
          ref="baseLineAnalysisResultRef"
          v-if="currentNode && !isProjectNode&&!isDataSort"/>
        <dataSortingResult
          :currentNode="currentNode"
          :sign="sign"
          :pageId="downloadId"
          :analysisResult="analysisResult"
          :nullValueRes="nullValueRes"
          :outlierValueRes="outlierValueRes"
          @syncNodeDetailData="syncNodeDetailData"
          ref="dataSortingResultRef"
          v-if="currentNode && !isProjectNode&&isDataSort">
        </dataSortingResult>
      </el-scrollbar>
    </div>
    <div class="footer">
      <analysisTool
        :pageType="1"
        :downloadId="downloadId"
        :currentNode="currentNode"
        @toSign="toSign"
        @exportPDF="exportPDF"
        @toCurrentNode="toCurrentNode"
        ref="toolRef"
        v-if="analysisResult && !isProjectNode"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import { getNodeDetail, signNode, getOutlierValueLog } from '@/api/api_dataAnalysis'
import baseLineAnalysisResult from '@/components/dataAnalysis/engineeringLibrary/baseLineAnalysisResult.vue'
import dataSortingResult from '@/components/dataAnalysis/engineeringLibrary/dataSortingResult.vue'
import { analysisMethodList } from '@/components/dataAnalysis/utils/commonData'
import analysisTool from '@/components/dataAnalysis/engineeringLibrary/analysisTool.vue'
import projectDefault from '@/components/dataAnalysis/engineeringLibrary/projectDefault.vue'
import { ElMessage } from 'element-plus'
import pdf from '@/utils/pdf.js'
import { nowDate } from '@/utils/utils'
import lodash from 'lodash'
const props = defineProps({
  tabIndex: {
    type: Number
  }
})
const currentNode = ref(null) // 当前节点
const showDetails = ref(false) // 是否显示详情
const nodeData = ref(null) // 节点数据
const emits = defineEmits(['close', 'setCardNodeSign', 'toCurrentNode']) // 触发事件
const sign = ref(false)
const downloadId = ref(`capturePDFId2-${props.tabIndex}`)
const analysisResult = ref('')
const toolRef = ref(null)
const allDetailData = ref(null)
const isProjectNode = ref(false)
const isDataSort = ref(false)
const show = async (nodeObject) => {
  showDetails.value = true
  nodeData.value = nodeObject
  // 先判断是否是项目初始节点
  const { pid } = nodeObject
  isProjectNode.value = Number(pid) === 0
  if (isProjectNode.value) {
    return
  }
  sign.value = nodeObject.coreFlag === 1
  const { code, data } = await getNodeDetail({
    id: nodeData.value.id
  })
  if (code === 10000) {
    let { bigGroup, smallGroup } = nodeObject
    if (smallGroup.includes('跳转到')) {
      smallGroup = smallGroup.replace('跳转到', '')
    }
    // 找到analysisMethodList中对应的bigGroup，再从bigGroup中找到smallGroup
    const findObj = analysisMethodList.find(item => item.name === bigGroup)
    if (findObj) {
      const findSmallObj = findObj.children.find(method => method.name === smallGroup)
      if (nodeData.value.id === analysisResult.value?.node_id) {
        return
      }
      if (bigGroup === '数据整理' && findSmallObj) {
        allDetailData.value = {
          ...findSmallObj,
          ...data
        }
        // await handleDataSorting(findSmallObj, data)
        currentNode.value = {
          icon: findObj.icon,
          groupName: bigGroup,
          ...findSmallObj
        }
        analysisResult.value = {
          name: findSmallObj.name,
          coreFlag: nodeData.value.coreFlag,
          coreDescription: nodeData.value.coreDescription,
          node_id: nodeData.value.id,
          ...data
        }
        isDataSort.value = true
        nextTick(() => {
          toolRef.value.setSign(data.coreFlag)
        })
        return
      }
      isDataSort.value = false
      const { validation_method } = JSON.parse(data.params)
      if (findSmallObj) {
        console.log('算法返回', JSON.parse(data.result))
        analysisResult.value = {
          name: findSmallObj.name,
          coreFlag: nodeData.value.coreFlag,
          coreDescription: nodeData.value.coreDescription,
          node_id: nodeData.value.id,
          ...JSON.parse(data.result),
          validation_method
        }
        allDetailData.value = {
          ...nodeObject,
          ...data
        }
        currentNode.value = {
          icon: findObj.icon,
          groupName: bigGroup,
          ...findSmallObj
        }
        // AI结果正在请求中
        // setTimeout(() => {
        //   if (JSON.parse(data.result).result === '') {
        //     baseLineAnalysisResultRef.value.requestAIResult()
        //   }
        // }, 1000)
      } else {
        ElMessage.warning('未定位到相关算法名称')
      }
    } else {
      ElMessage.warning('未定位到相关算法名称')
    }
    nextTick(() => {
      toolRef.value?.setSign(data.coreFlag)
    })
  }
}
const close = () => {
  showDetails.value = false
  nodeData.value = null
  emits('close')
}
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
      allDetailData.value.coreFlag = val
      // 同步操作日志卡片标记
      emits('setCardNodeSign', val)
      // 取消标记
      analysisResult.value.coreFlag = val
      if (!val) {
        analysisResult.value.coreDescription = ''
        allDetailData.value.coreDescription = ''
      }
    }
  }
}
const baseLineAnalysisResultRef = ref(null)
const dataSortingResultRef = ref(null)
// 下载PDF
const exportPDF = async () => {
  if (allDetailData.value.bigGroup !== '数据整理') {
    await baseLineAnalysisResultRef.value.handlePlotlyToImg()
    pdf.downloadPDF(baseLineAnalysisResultRef, downloadId.value, `${currentNode.value.name}_${nowDate()}`)
  } else {
    pdf.downloadPDF(dataSortingResultRef, downloadId.value, `${currentNode.value.name}_${nowDate()}`)
  }
}
// 同步详情里的描述信息
const syncNodeDetailData = (data) => {
  allDetailData.value.coreDescription = data
}
const toCurrentNode = () => {
  emits('toCurrentNode', allDetailData.value)
}
const nullValueRes = ref([])
const outlierValueRes = ref([])
// eslint-disable-next-line no-unused-vars
const handleDataSorting = (findSmallObj, params) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    // if (findSmallObj.name === '空值处理') {
    //   const res = await getNullValueNumber({ dataOperateId: params.id })
    //   if (res.code === 10000) {
    //     nullValueRes.value = lodash.get(res.data, 'nullValueInfoList', [])
    //   }
    // }
    if (findSmallObj.name === '异常值处理') {
      console.log('获取异常值处理的接口')
      const res3 = await getOutlierValueLog({
        dataOperateId: params.id
      })
      if (res3.code === 10000) {
        outlierValueRes.value = lodash.get(res3, 'data.itemList') || []
      }
    }
    // const res2 = await getDataSortingParams({
    //   operateId: params.id
    // })
    // if (res2.code === 10000) {
    //   dataSortingRes.value = res2.data || []
    //   allDetailData.value = {
    //     ...allDetailData.value,
    //     filterParams: dataSortingRes.value
    //   }
    // }

    resolve()
  })
}
defineExpose({
  show,
  close
})
</script>
<style lang="scss" scoped>
.operationLogDefault {
  display: flex;
  flex-direction: column;
  // width: 660px;
  width: 744px;
  margin-left: 16px;
  border-radius: 8px;
  background: var(--theme-card);
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    height: 54px;
    padding: 0 24px;
    border-bottom: 1px solid #e8e8e8;
    span {
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    i {
      cursor: pointer;
      font-size: 14px;
      color: var(--theme-text-3);
    }
  }
  .content {
    flex: 1;
    height: 0;
    :deep(.content-scroll > .el-scrollbar__bar.is-horizontal) {
      display: none;
    }
    :deep(.sectionDiv) {
      padding-top: 24px;
    }
    :deep(.sectionDiv2) {
      margin-top: 0;
      .title {
        height: auto;
        padding: 0 24px;
        border-bottom: none;
        .node-name {
          width: 100%;
          padding-top: 24px;
          border-top: 1px solid #e8e8e8;
        }
      }
      .sectionDiv2-content {
        padding-top: 20px;
        .mannWhitneyUTestTable3 {
          .el-table__header {
            tr:nth-child(3) {
              th:nth-child(1)::before {
                transform: rotate(-76.4deg) !important;
              }
            }
          }
        }
      }
    }
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;
    height: 80px;
    padding-right: 24px;
  }
}
</style>
