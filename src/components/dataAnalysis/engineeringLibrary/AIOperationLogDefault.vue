<template>
  <div class="operationLogDefault">
    <div class="header">
      <i class="close-icon iconfont icon-dankuang-shanchu" @click="close"></i>
    </div>
    <div class="content" v-if="showDetails">
      <el-scrollbar class="content-scroll">
        <baseLineAnalysisResult
          :currentNode="currentNode"
          :sign="sign"
          :pageId="downloadId"
          :analysisResult="analysisResult"
          ref="baseLineAnalysisResultRef"
          v-if="currentNode && !isDataSort"/>
        <dataSortingResult
          :currentNode="currentNode"
          :sign="sign"
          :pageId="downloadId"
          :analysisResult="analysisResult"
          :nullValueRes="nullValueRes"
          :outlierValueRes="outlierValueRes"
          ref="dataSortingResultRef"
          v-if="currentNode && isDataSort">
        </dataSortingResult>
      </el-scrollbar>
    </div>
    <div class="footer" v-if="showDetails">
      <el-button type="primary" class="downloadBtn" @click="exportPDF">
        <i class="iconfont icon-daochu2"></i>下载PDF
      </el-button>
    </div>
    <div class="content" v-else>
      <emptyMedicalRecord/>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { getNodeDetail } from '@/api/api_AIChat.js'
import baseLineAnalysisResult from '@/components/dataAnalysis/engineeringLibrary/baseLineAnalysisResult.vue'
import dataSortingResult from '@/components/dataAnalysis/engineeringLibrary/dataSortingResult.vue'
import { analysisMethodList } from '@/components/dataAnalysis/utils/commonData'
import emptyMedicalRecord from '@/components/medicalRecord/standardizedMedical/emptyMedicalRecord.vue'
import { ElMessage } from 'element-plus'
import pdf from '@/utils/pdf.js'
import { nowDate } from '@/utils/utils'
const props = defineProps({
  nodeData: {
    type: Object,
    default: () => {}
  }
})
watch(() => props.nodeData.id, () => {
  console.log('切换了', props.nodeData)
  show(props.nodeData)
})
const currentNode = ref(null) // 当前节点
const showDetails = ref(false) // 是否显示详情
const emits = defineEmits(['close']) // 触发事件
const sign = ref(false)
const downloadId = ref('AI-analysisPDFId')
const analysisResult = ref('')
const allDetailData = ref(null)
const isDataSort = ref(false)
const show = async (nodeData) => {
  const { code, data } = await getNodeDetail({
    fileId: nodeData.id
  })
  if (code === 10000) {
    if (data.result === '') {
      ElMessage.error('分析结果为空')
      return
    }
    showDetails.value = true
    const newData = JSON.parse(data.result)
    console.log('newData', newData)
    const bigGroup = data.bigGroup
    const smallGroup = data.smallGroup
    // 找到analysisMethodList中对应的bigGroup，再从bigGroup中找到smallGroup
    const findObj = analysisMethodList.find(item => item.name === bigGroup)
    if (findObj) {
      const findSmallObj = findObj.children.find(method => method.name === smallGroup)
      if (nodeData.id === analysisResult.value?.node_id) {
        return
      }
      if (bigGroup === '数据整理' && findSmallObj) {
        allDetailData.value = {
          ...findSmallObj,
          ...data
        }
        currentNode.value = {
          icon: findObj.icon,
          groupName: bigGroup,
          ...findSmallObj
        }
        analysisResult.value = {
          name: findSmallObj.name,
          coreFlag: nodeData.coreFlag,
          coreDescription: nodeData.coreDescription,
          node_id: nodeData.id,
          ...data
        }
        isDataSort.value = true
        return
      }
      isDataSort.value = false
      if (findSmallObj) {
        console.log('算法返回', JSON.parse(data.result))
        analysisResult.value = {
          name: findSmallObj.name,
          coreFlag: nodeData.coreFlag,
          coreDescription: nodeData.coreDescription,
          node_id: nodeData.id,
          ...JSON.parse(data.result)
        }
        allDetailData.value = {
          ...nodeData,
          ...data
        }
        currentNode.value = {
          icon: findObj.icon,
          groupName: bigGroup,
          ...findSmallObj
        }
      } else {
        ElMessage.error('输出结果为空')
      }
    } else {
      ElMessage.error('输出结果为空')
    }
  }
}
onMounted(() => {
  show(props.nodeData)
})
const close = () => {
  showDetails.value = false
  emits('close')
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
const nullValueRes = ref([])
const outlierValueRes = ref([])

defineExpose({
  show,
  close
})
</script>
<style lang="scss" scoped>
.operationLogDefault {
  display: flex;
  position: relative;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  border-radius: 8px;
  background: var(--theme-card);
  .header {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    box-sizing: border-box;
    width: 100%;
    height: 29px;
    padding-right: 16px;
    .close-icon {
      z-index: 1;
      cursor: pointer;
      font-size: 14px;
      color: var(--theme-text-3);
    }
  }
  .footer {
    display: flex;
    justify-content: end;
    padding: 24px;
    .el-button {
      i {
        margin-right: 8px;
        font-size: 14px;
      }
    }
  }
  .content {
    flex: 1;
    height: 0;
    :deep(.content-scroll > .el-scrollbar__bar.is-horizontal) {
      display: none;
    }
    :deep(.sectionDiv) {
      .commonSubTitle {
        margin-top: 14px;
      }
      .description-div,
      .coreNode {
        display: none;
      }
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
        padding-bottom: 0;
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
}
</style>
