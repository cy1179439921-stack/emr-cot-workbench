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
      <div class="text cardBg noDownload marginT16" v-if="newAnalysisResult?.coreFlag === 1">
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
        {{ currentNode.explain}}
      </div>
      <div v-for="(filterItem,index) in handleDataSortingRes" :key="index">
        <template v-if="analysisResult.name!=='对照组切分'">
          <commonSubTitle class="marginT24" text="参数设置" ></commonSubTitle>
          <div class="text cardBg marginT16" v-if="['数据筛选'].includes(analysisResult.name)">
            <div>原始变量名称：{{ filterItem.variableName }}</div>
            <div>原始变量类型：{{filterItem.variableType }}</div>
            <div v-if="filterItem.dataProperty === 0">
              已筛选：<span
                v-for="(e, eIndex) in (filterItem.params||[])"
                :key="eIndex"
              >标签名:{{ e.labelValue }} 编码值:{{ e.
                indexValue }};&nbsp;&nbsp;</span
              >
            </div>
            <div v-else >
              已筛选：<span
                v-for="(e, eIndex) in (filterItem.params||[])"
                :key="eIndex"
              >{{ e.startValue }} - {{ e.endValue }};&nbsp;&nbsp;</span>
            </div>
          </div>
          <div v-else-if="['比例抽样'].includes(analysisResult.name)" class="text cardBg marginT16">
            <div>依据变量名称：{{ filterItem.variableName }}</div>
            <div>依据变量类型：{{filterItem.variableType }}</div>
            <div v-if="filterItem.samplingType!==2">
              {{'抽样比例：'+ filterItem.samplingRatio+'%'}}
            </div>
            <div v-if="filterItem.samplingType===2">
              {{'抽样群数：'+ filterItem.samplingGroupNum
              }}
            </div>
          </div>
          <div v-else class="text cardBg marginT16">
            <div>原始变量名称：{{ filterItem.variableName }}</div>
            <div>原始变量类型：{{filterItem.variableType }}</div>
            <div v-if="filterItem.dataType">原始变量中元素类型：{{filterItem.dataType }}</div>
            <div v-if="currentNode.name==='空值处理'">原始空值数量：{{filterItem.numberOfNullValues }}</div>
            <div v-if="currentNode.name==='空值处理'">原始数值个数：{{filterItem.numberOfValues }}</div>
          </div>
          <div class="line"></div>
        </template>
        <div class="currentVariableInfoTitle">
          <!-- <SvgIcon iconName="icon-dangqianbianliang"></SvgIcon> -->
          <i class="iconfont icon-dangqianbianliang currentNodeIcon"></i>
          <span>当前变量信息</span>
        </div>
        <template v-if="filterItem.afterEchartsOptions.length">
          <template v-for="(v,subIndex) in filterItem.afterEchartsOptions" :key="subIndex">
            <div class="subheading">
              <div>{{ (subIndex+1)+'.'+analysisResult.name+'数据视图' }}</div>
              <span class="spanCopy" @click="downloadGraph('chartBox'+v.colId,v.indexName)">
                <i class="iconfont icon-daochu2"></i>
                <span>下载</span>
              </span>
            </div>
            <div class="echartsContainer" :id="'chartBox'+v.colId">
              <commonEchartsTitle :xAxisName="v.xAxisName" :yAxisName="v.yAxisName">
                <common-echarts ref="echarsDom" :showExtension="true" :option="v.options"></common-echarts>
              </commonEchartsTitle>
            </div>
          </template>
        </template>
        <template v-else>
          <div class="subheading">
            <div>{{ '1.'+analysisResult.name+'数据视图' }}</div>
          </div>
          <div class="emptyDom">
            <echartsEmpty></echartsEmpty>
          </div>
        </template>

        <div class="currentVariableInfoTitle">
          <!-- <SvgIcon iconName="icon-yuanbianliang"></SvgIcon> -->
          <i class="iconfont icon-yuanbianliang turnOutToBe"></i>
          <span>原变量信息</span>
        </div>
        <template v-if="filterItem.beforeEchartsOptions?.length">
          <template v-for="(v,subIndex) in filterItem.beforeEchartsOptions" :key="subIndex">
            <div class="subheading">
              <div>{{ (subIndex+1)+'.'+analysisResult.name+'数据视图' }}</div>
              <span class="spanCopy" @click="downloadGraph('originalChartBox'+v.colId,v.indexName)">
                <i class="iconfont icon-daochu2"></i>
                <span>下载</span>
              </span>
            </div>
            <div class="echartsContainer" :id="'originalChartBox'+v.colId">
              <commonEchartsTitle :xAxisName="v.xAxisName" :yAxisName="v.yAxisName">
                <common-echarts ref="echarsDom" :showExtension="true" :option="v.options"></common-echarts>
              </commonEchartsTitle>
            </div>
          </template>
        </template>

        <template v-else>
          <div class="subheading">
            <div>{{ '1.'+analysisResult.name+'数据视图' }}</div>
          </div>
          <div class="emptyDom">
            <echartsEmpty></echartsEmpty>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'BaseLineAnalysisResult',
  inheritAttrs: false
})
import { ref, watch, nextTick, inject } from 'vue'
import { signNode } from '@/api/api_dataAnalysis.js'
import echartsEmpty from './common/echartsEmpty.vue'
import { ElMessage } from 'element-plus'
import { nowDate } from '@/utils/utils.js'
import lodash from 'lodash'
// eslint-disable-next-line no-unused-vars
import { verticalBarChartBasicOption, histogramChartBasicOption, scatterChartsOption2 } from './common/echartsConfig.js'
import commonEchartsTitle from './common/commonEchartsTitle.vue'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
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
  },
  // dataSortingRes: {
  //   type: Array,
  //   default: () => {
  //     return []
  //   }
  // },
  nullValueRes: {
    type: Array,
    default: () => {
      return []
    }
  },
  outlierValueRes: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const editNodeState = ref(false)
const newAnalysisResult = ref(null)
const varTypeList = [
  {
    id: 0,
    label: '定性变量',
    type: 'N'
  },
  {
    id: 1,
    label: '定量变量',
    type: 'S'
  },
  {
    id: 2,
    label: '其他',
    type: 'E'
  }
]
const handleDataSortingRes = ref([])
watch([() => props.analysisResult, () => props.currentNode], async ([newVal, newCurrentNode]) => {
  if (newVal && newVal.node_id && newVal.name === newCurrentNode.name) {
    newAnalysisResult.value = newVal
    let params = {}
    try {
      params = JSON.parse(lodash.get(newVal, 'params'))
    } catch (error) {

    }
    const arr = lodash.cloneDeep(newVal?.organizeHistoryViewVO, [])
    arr.forEach(item => {
      item.variableName = lodash.get(item, 'before[0].indexName')
      item.dataProperty = lodash.get(item, 'before[0].dataProperty')

      varTypeList.forEach(v => {
        if (v.id === item.dataProperty) {
          item.variableType = v.label
        }
      })
      item.dataType = ''
      // 定量变量进行数据类型转换的时候展示此字段, 定量变量只存在1-整型，2-浮点型， 不应该存在其他类型
      if (lodash.get(item, 'before[0].dataProperty') === 1 && lodash.get(item, 'after[0].dataProperty') === 1 && newCurrentNode.name === '数据编辑') {
        if (lodash.get(item, 'before[0].codomainType') === 0) {
          item.dataType = 'int'
        } else {
          item.dataType = 'float'
        }
      }
      if (newCurrentNode.name === '空值处理') {
        item.numberOfValues = lodash.get(item, 'before[0].totalNum', '')
        item.numberOfNullValues = lodash.get(item, 'before[0].nullNum', '')
      }
      if (newCurrentNode.name === '比例抽样') {
        item.samplingType = params.samplingType
        // 抽样比例
        item.samplingRatio = params.samplingRatio
        // 抽样群数
        item.samplingGroupNum = params.samplingGroupNum
      }
      item.afterEchartsOptions = []
      item.beforeEchartsOptions = []
      if (item.after?.length) {
        item.after.forEach(v => {
          if (v.dataProperty === 1) {
            if (!lodash.get(v, 'view')) {
              return
            }
            const afterEchartsData = lodash.get(v, 'view.groupData', [])
            item.afterEchartsOptions.push(
              {
                xAxisName: lodash.get(v, 'indexName'),
                yAxisName: '样本量',
                colId: lodash.get(v, 'colId', new Date().getTime()),
                indexName: lodash.get(v, 'indexName', ''),
                options: histogramChartBasicOption(
                  {
                    xAxisData: lodash.get(afterEchartsData, 'xaxis') || [],
                    yAxisData: lodash.get(afterEchartsData, 'yaxis') || [],
                    type: lodash.get(v, 'dataProperty')
                  }
                )
              }
            )
          } else {
            if (!lodash.get(v, 'view')) {
              return
            }
            const afterXAxisData = []
            const afterYAxisData = []
            const afterEchartsData = lodash.get(v, 'view.barData', [])
            afterEchartsData.forEach(o => {
              afterXAxisData.push(o.name)
              afterYAxisData.push(o.value)
            })
            item.afterEchartsOptions.push({
              xAxisName: lodash.get(v, 'indexName'),
              yAxisName: '样本量',
              colId: lodash.get(v, 'colId', new Date().getTime()),
              indexName: lodash.get(v, 'indexName', ''),
              options: verticalBarChartBasicOption(
                {
                  xAxisData: afterXAxisData,
                  yAxisData: afterYAxisData,
                  type: lodash.get(v, 'dataProperty')
                }
              )
            })
          }
        })
      }
      if (item.before?.length) {
        item.before.forEach(v => {
          if (v.dataProperty === 1) {
            if (!lodash.get(v, 'view')) {
              return
            }
            const beforeEchartsData = lodash.get(v, 'view.groupData', [])
            item.beforeEchartsOptions.push({
              xAxisName: lodash.get(v, 'indexName'),
              yAxisName: '样本量',
              colId: lodash.get(v, 'colId', new Date().getTime()),
              indexName: lodash.get(v, 'indexName', ''),
              options: histogramChartBasicOption(
                {
                  xAxisData: lodash.get(beforeEchartsData, 'xaxis') || [],
                  yAxisData: lodash.get(beforeEchartsData, 'yaxis') || [],
                  type: lodash.get(v, 'dataProperty')
                }
              )
            }

            )
          } else {
            if (!lodash.get(v, 'view')) {
              return
            }
            const beforeXAxisData = []
            const beforeYAxisData = []
            const beforeEchartsData = lodash.get(v, 'view.barData', [])
            beforeEchartsData.forEach(o => {
              beforeXAxisData.push(o.name)
              beforeYAxisData.push(o.value)
            })
            item.beforeEchartsOptions.push({
              xAxisName: lodash.get(v, 'indexName'),
              yAxisName: '样本量',
              colId: lodash.get(v, 'colId', new Date().getTime()),
              indexName: lodash.get(v, 'indexName', ''),
              options: verticalBarChartBasicOption(
                {
                  xAxisData: beforeXAxisData,
                  yAxisData: beforeYAxisData,
                  type: lodash.get(v, 'dataProperty')
                }
              )
            })
          }
        })
      }
    })
    handleDataSortingRes.value = arr
  } else {
    newAnalysisResult.value = null
  }
}, {
  deep: true,
  immediate: true
})
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
const metricName = ref('')
const engineeringInfo = inject('engineeringInfo')
const handleName = () => {
  // 工程名称_方法名_变量名_年月日时分秒
  return `${engineeringInfo?.name}_${props.analysisResult.name}_${metricName.value}_${nowDate(new Date())}`
}
const downloadGraph = (id, name) => {
  metricName.value = name
  const el = document.getElementById(id)
  const toolTipDomArr = document.querySelectorAll('.tooltipDiv')
  toolTipDomArr.forEach(item => {
    item.style.display = 'none'
  })
  html2canvas(el).then(async canvas => {
    toolTipDomArr.forEach(item => {
      item.style.display = 'block'
    })
    try {
      canvas.toBlob(function (blob) {
        fileDownload(blob, handleName() + '.png')
      })
    } catch (err) {
      console.error(err.name, err.message)
    }
  })
}
</script>
<style scoped lang="scss">
@use '@/style/common/baseLineAnalysisResult.scss';
.text {
  line-height: 20px;
  font-weight: 400;
  font-size: 14px;
  color: var(--theme-text-2);
}
.emptyDom {
  width: 701px;
  height: 208px;
}
.echartsContainer {
  width: 100%;
  height: 213px;
}
.line {
  width: 100%;
  height: 0;
  height: 1px;
  margin: 24px 0;
  background-color: #e8e8e8;
}
.currentVariableInfoTitle {
  display: flex;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 16px;
  .iconfont {
    margin-right: 10px;
    font-size: 20px;
    &.currentNodeIcon {
      color: #36b58f;
    }
    &.turnOutToBe {
      color: var(--theme-primary);
    }
  }
  svg {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  span {
    line-height: 23px;
    font-weight: 600;
    font-size: 16px;
    color: var(--theme-text);
  }
}
.subheading {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  line-height: 20px;
  font-weight: 600;
  font-size: 14px;
  color: var(--theme-text);
  >div {
    flex: 1;
  }
  .spanCopy {
    cursor: pointer;
    line-height: 22px;
    font-weight: 400;
    font-size: 14px;
    color: var(--theme-primary);
    .iconfont {
      margin-right: 8px;
    }
  }
}
</style>
