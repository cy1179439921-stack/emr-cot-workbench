<!-- eslint-disable no-case-declarations -->
<!-- eslint-disable no-inner-declarations -->
<template>
  <div class="dataVisualize">
    <el-dialog
      class="addIP_Dialog"
      v-model="dialogVisible"
      :title="title"
      :width="pxToRem(1035)"
      destroy-on-close
      :before-close="handleClose"
    >
      <template #header>
        <el-tooltip
          class="box-item"
          effect="dark"
          placement="bottom-start"
        >
          <div class="titleContainer">
            <span>{{titleObj.name}}</span>
            <i class="iconfont icon-querentishi headerIcon"></i>
          </div>
          <template #content>
            <div class="toolTipContent">
              {{ titleObj.explain }}
            </div>
          </template>
        </el-tooltip>
      </template>
      <div class="mainContainer">
        <div class="leftPanel">
          <div class="title">
            <p>
              <span></span>
              <span>选择变量</span>
            </p>
          </div>
          <div class="description choiceVariables">
            <div class="variableSelectionContainer">
              <variableSelection
                :colNumber="colNumber"
                :showToolTip="true"
                :filteredList="filteredList"
                :titleObj="titleObj"
                @handleChange="handleChange"
                :initDataList="dataList"
                :showTag="false"
              >
              </variableSelection>
            </div>
            <div class="choiceView">
              <div class="title">
                <p>
                  <span></span>
                  <span>选择视图</span>
                </p>
              </div>
              <div class="viewSelectionContainer">
                <p v-for="(item, index) in viewList" :key="index" :class="{ selected: selectedViewIndex === index }" @click="handleViewChange(item, index)">
                  <i :class="item.icon"></i>
                  <span>{{item.name}}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="rightPanel">
          <div class="chartContainer">
            <div class="title">
              <p>
                <span></span>
                <span>数据视图</span>
              </p>
              <p @click="downloadGraph('echarts')" v-if="isShowCharts">
                <i class="iconfont icon-daochu2"></i>
                <span>下载</span>
              </p>
            </div>
            <div class="chartBox" id="echartBox">
              <commonEchartsTitle
                :xAxisName="xAxisName"
                :yAxisName="yAxisName"
                v-if="isShowCharts">
                <common-echarts ref="echarsDom" :showExtension="true" :option="echartsOptions"></common-echarts>
              </commonEchartsTitle>
              <echartsEmpty v-else></echartsEmpty>
            </div>
          </div>
          <div class="dataInfoContainer">
            <div class="title">
              <p>
                <span></span>
                <span>数据基础信息表</span>
              </p>
              <p @click="downloadGraph('table')" v-if="isShowCharts">
                <i class="iconfont icon-daochu2"></i>
                <span>下载</span>
              </p>
            </div>
            <div class="dataInfoBox" v-if="isShowCharts">
              <el-scrollbar >
                <div class="allDom" ref="resultTable">
                  <div class="dataInfoTitle">数据概述信息</div>
                  <div class="content">
                    <div class="variableContainer" v-if="tableHeaders?.length">
                      <span class="tableLabel">变量名</span>
                      <span class="variableName">{{ metricName }}</span>
                    </div>
                    <!-- <div class="customTable">
                      <div
                        v-for="(r, index) in tableHeaders"
                        :key="index"
                        class="divTr"
                      >
                        <template v-for="(item, tdIndex) in r" :key="tdIndex" >
                          <div class="itemTd">
                            <span class="tableLabel">{{ item.label }}</span>
                            <span class="tableValue">{{ item.value }}</span>
                          </div>
                        </template>
                      </div>
                    </div> -->
                    <table
                      ref="table"
                      class="customTable2"
                    >
                      <tr
                        v-for="(r, index) in tableHeaders"
                        :key="index"
                      >
                        <template v-for="(item, tdIndex) in r" :key="tdIndex">
                          <td >
                            <span class="tableLabel">{{ item.label }}</span>
                            <span class="tableValue">{{ item.value }}</span>
                          </td>
                        </template>
                      </tr>
                    </table>
                  </div>
                </div>
              </el-scrollbar>
            </div>
            <div v-else class="emptyInfoBox">
              <echartsEmpty ></echartsEmpty>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: 'DataVisualize'
})
import { ref } from 'vue'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { nowDate } from '@/utils/utils.js'
import { verticalBarChartBasicOption, pieChartOption, linesChartsOption, scatterChartsOption, histogramChartBasicOption } from '../common/echartsConfig.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { getAllVariables, getDataVisible } from '@/api/api_dataAnalysis.js'
import lodash from 'lodash'
import { emitter } from '@/utils/bus'
const loadingStatus = ref(true)
emitter.on('showLoading', () => {
  loadingStatus.value = true
})
emitter.on('closeLoading', () => {
  loadingStatus.value = false
})
const emits = defineEmits(['updateList'])

const props = defineProps({
  titleObj: {
    type: Object,
    default: () => {
      return {}
    }
  },
  engineeringInfo: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
const dialogVisible = ref(true)
const title = ref('')
const dateType = ref('')
const resultTable = ref(null)
const echarsDom = ref(null)
const selectedViewIndex = ref(null)
const filteredList = ref([]) // 需要你自己去筛选,不要用我hooks里面的应该不是通用的
// const titlename = ref('')

const typeToViewList = {
  0: [
    { name: '柱状图', icon: 'iconfont icon-zhuzhuangtu', type: 'verticalBarChartBasicOption' },
    { name: '饼图', icon: 'iconfont icon-bingtu-1', type: 'pieChartOption' }
  ],
  1: [
    { name: '散点图', icon: 'iconfont icon-sandiantu-01', type: 'scatterChartsOption' },
    { name: '折线图', icon: 'iconfont icon-zhexiantu-01', type: 'linesChartsOption' },
    { name: '直方图', icon: 'iconfont icon-zhuzhuangtu', type: 'barCategoryGap' }
  ],
  2: [
    { name: '柱状图', icon: 'iconfont icon-zhuzhuangtu', type: 'verticalBarChartBasicOption' },
    { name: '饼图', icon: 'iconfont icon-bingtu-1', type: 'pieChartOption' }
  ]
}
const tableHeaders = ref([])
const viewList = ref([])

const updateViewList = () => {
  viewList.value = typeToViewList[dateType.value] || []
  selectedViewIndex.value = 0
  handleViewChange(viewList.value[0], 0)
}
const echartsOptions = ref({})
const xAxisName = ref('')
const yAxisName = ref('')
// const generateEChartsData = (count) => {
//   const xAxisData = []
//   const yAxisData = []
//   const startDate = new Date('2020-01-01').getTime()
//   const endDate = new Date('2023-01-01').getTime()
//   for (let i = 0; i < count; i++) {
//     const timestamp = Math.random() * (endDate - startDate) + startDate
//     const value = Math.random() * 100 // 假设最大值不超过100
//     yAxisData.push(value)
//     xAxisData.push(timestamp)
//   }
//   return { xAxisData, yAxisData }
// }
const echartsData = ref([])
const isShowCharts = ref(false)
const ensureMultipleOfEight = (arr, value = null) => {
  const remainder = arr.length % 8
  if (remainder !== 0) {
    arr.length = arr.length + (8 - remainder) // 先扩展数组长度
    arr.fill({
      label: '',
      value: ''
    }, arr.length - (8 - remainder)) // 然后填充特定值
  }
  return arr
}
const getDataVisibleFn = () => {
  return new Promise((resolve, reject) => {
    const params = {
      colId: currentVisibleObj.value.colId,
      dataOperateId: props.engineeringInfo.dataOperateId
    }
    getDataVisible(params).then(res => {
      echartsOptions.value = {}
      if (res.code !== 10000) {
        echartsData.value = []
        isShowCharts.value = false
        resolve()
        return
      }
      if (dateType.value === 1) {
        let tableHeadersArr = []
        echartsData.value = lodash.get(res, 'data.view')

        const obj = lodash.get(res, 'data.view.dataTable')[0] || {}
        const beforeTableData = Object.keys(obj)
          .filter(item => item !== '变量名')
          .map(key => {
            return {
              label: key,
              value: obj[key]
            }
          })
        // Object.keys(obj).forEach(item => {
        //   if (item !== '变量名') {
        //     tableHeadersArr.push({
        //       label: item,
        //       value: obj[item]
        //     })
        //   }
        // })
        tableHeadersArr = lodash.sortBy(beforeTableData, ['label'])
        if (tableHeadersArr.length) {
          tableHeadersArr = ensureMultipleOfEight(tableHeadersArr)
        }
        tableHeaders.value = lodash.chunk(tableHeadersArr, 8)
      } else {
        echartsData.value = lodash.get(res, 'data.view.barData') || []
        const obj = lodash.get(res, 'data.view') || {}
        let tableHeadersArr = []
        tableHeadersArr = [
          {
            label: '样本量',
            value: obj.count
          },
          {
            label: '类别数',
            value: obj.typeCount
          }
        ]

        echartsData.value.forEach((item, index) => {
          tableHeadersArr.push({
            label: `类别${index + 1}名称`,
            value: item.name
          })
          tableHeadersArr.push({
            label: `类别${index + 1}数量(比例)`,
            value: `${item.value}(${item.rate})`
          })
        })
        // 每行列数
        const numberPerLine = 8

        if (tableHeadersArr.length) {
          tableHeadersArr = ensureMultipleOfEight(tableHeadersArr)
        }
        tableHeaders.value = lodash.chunk(tableHeadersArr, numberPerLine)
        // 数据超过一千增加...
        if (Number(obj.count) > 1000 && tableHeaders.value.length > 0) {
          tableHeaders.value[tableHeaders.value.length - 1].push({
            label: '...',
            value: '...'
          })
        }
        // 当行数大于1且最后一行的数据数据不满8时,补足
        if (tableHeaders.value.length > 1) {
          const arr = tableHeaders.value[tableHeaders.value.length - 1]
          if (arr.length !== numberPerLine) {
            const difference = numberPerLine - arr.length
            for (let i = 0; i < difference; i++) {
              arr.push({
                label: '',
                value: ''
              })
            }
          }
        }
      }
      resolve()
    })
  })
}
const handleAxisName = (chartsType) => {
  if (['linesChartsOption', 'scatterChartsOption'].includes(chartsType)) {
    xAxisName.value = '索引项'
    yAxisName.value = metricName.value
  } else {
    xAxisName.value = metricName.value
    yAxisName.value = '样本量'
  }
}
const handleViewChange = (item, index) => {
  if (!item) {
    return
  }
  selectedViewIndex.value = index
  handleAxisName(item.type)
  let xAxisData = []
  let yAxisData = []
  switch (item.type) {
    case 'verticalBarChartBasicOption': // 柱状图
      if (echartsData.value.length) {
        isShowCharts.value = true
      } else {
        isShowCharts.value = false
      }
      echartsData.value.forEach(item => {
        xAxisData.push(item.name)
        yAxisData.push(item.value)
      })
      echartsOptions.value = verticalBarChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: dateType.value
        }
      )
      break
    case 'barCategoryGap': // 直方图
      xAxisData = lodash.get(echartsData.value, 'groupData.xaxis') || []
      yAxisData = lodash.get(echartsData.value, 'groupData.yaxis') || []
      if (xAxisData.length && yAxisData.length) {
        isShowCharts.value = true
      } else {
        isShowCharts.value = false
      }
      echartsOptions.value = histogramChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: dateType.value
        }
      )
      break
    case 'pieChartOption': // 饼图
      if (echartsData.value.length) {
        isShowCharts.value = true
      } else {
        isShowCharts.value = false
      }
      echartsOptions.value = pieChartOption(echartsData.value || [])
      break
    case 'linesChartsOption': // 折线图
      xAxisData = lodash.get(echartsData.value, 'defaultData.xaxis') || []
      yAxisData = lodash.get(echartsData.value, 'defaultData.yaxis') || []
      if (xAxisData.length && yAxisData.length) {
        isShowCharts.value = true
      } else {
        isShowCharts.value = false
      }
      echartsOptions.value = linesChartsOption({
        xAxisData,
        yAxisData
      })
      break

    case 'scatterChartsOption': // 散点图
      xAxisData = lodash.get(echartsData.value, 'defaultData.xaxis') || []
      yAxisData = lodash.get(echartsData.value, 'defaultData.yaxis') || []
      if (xAxisData.length && yAxisData.length) {
        isShowCharts.value = true
      } else {
        isShowCharts.value = false
      }
      echartsOptions.value = scatterChartsOption({
        xAxisData: lodash.get(echartsData.value, 'defaultData.xaxis') || [],
        yAxisData: lodash.get(echartsData.value, 'defaultData.yaxis') || []
      })
      // 这儿是异常值多组点位的使用方法,,单组点位正常传
      // echartsOptions.value = scatterChartsOption({
      //   xAxisData: ,
      //   yAxisData: [oneMillionDataPoints.yAxisData, twoMillionDataPoints.yAxisData],
      //   chartsType: 'multiple'
      // })
      break
  }
}
const handleClose = (done) => {
  emits('handleClose')
  done()
}
// 需要传入的数据
const dataList = ref([])
const metricName = ref('')
const getDataList = () => {
  getAllVariables({ id: props.engineeringInfo?.dataOperateId }).then(v => {
    dataList.value = v.data || []
    lodash.remove(dataList.value, { label: 'the_geom' })
    updateViewList()
  })
}
const currentVisibleObj = ref({})
const colNumber = ref('')
const { selectColumn } = props.titleObj
if (selectColumn) {
  colNumber.value = selectColumn.colNumber
}
const handleChange = async (obj) => {
  tableHeaders.value = []
  currentVisibleObj.value = obj
  dateType.value = obj.dataProperty
  metricName.value = obj.label
  await getDataVisibleFn()
  updateViewList()
}
const handleName = () => {
  // 工程名称_方法名_变量名_年月日时分秒
  return `${props.engineeringInfo?.name}_${props.titleObj.name}_${metricName.value}_${nowDate(new Date())}`
}
const downloadGraph = (type) => {
  if (type === 'echarts') {
    const el = document.getElementById('echartBox')
    html2canvas(el).then(async canvas => {
      try {
        canvas.toBlob(function (blob) {
          fileDownload(blob, handleName() + '.png')
        })
      } catch (err) {
        console.error(err.name, err.message)
      }
    })
  } else if (type === 'table') {
    const el = resultTable.value
    html2canvas(el).then(async canvas => {
      try {
        canvas.toBlob(function (blob) {
          fileDownload(blob, handleName() + '.png')
        })
      } catch (err) {
        console.error(err.name, err.message)
      }
    })
  }
}

const init = () => {
  getDataList()
}
init()
</script>

<style scoped lang="scss">
.dataVisualize {
  :deep(.el-overlay-dialog) {
    .el-dialog {
      display: flex;
      flex-direction: column;
      height: 677px;
      .mainContainer {
        display: flex;
        overflow: hidden;
        width: 100%;
        .title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          p:nth-child(1) {
            display: flex;
            align-items: center;
            span {
              display: block;
            }
            span:nth-child(1) {
              width: 2px;
              height: 14px;
              background: var(--theme-primary);
            }
            span:nth-child(2) {
              margin-left: 8px;
              line-height: 20px;
              font-weight: 500;
              font-size: 14px;
              color: var(--theme-text);
            }
          }
          p:nth-child(2) {
            display: flex;
            align-items: center;
            cursor: pointer;
            i {
              font-size: 13px;
              color: var(--theme-primary);
            }
            span {
              padding-left: 8px;
              font-weight: 400;
              font-size: 14px;
              color: var(--theme-primary);
            }
          }
        }
        .leftPanel {
          width: 233px;
          // border-right: 1px solid #e8e8e8;
          .choiceVariables {
            box-sizing: border-box;
            width: 100%;
            padding-right: 24px;
            border-right: 1px solid #e8e8e8;
            .variableSelectionContainer {
              overflow: hidden;
              height: 247px;
              .variableSelection {
                .dataName {
                  &.showTip {
                    max-width: 80px;
                  }
                }
              }
            }
            .choiceView {
              margin-top: 17px;
              .viewSelectionContainer {
                box-sizing: border-box;
                width: 208px;
                height: 240px;
                padding: 12px 0;
                border: 1px solid #e8e8e8;
                background: var(--theme-card);
                p {
                  display: flex;
                  align-items: center;
                  height: 32px;
                  padding: 0 15px;
                  cursor: pointer;
                  i {
                    font-size: 14px;
                  }
                  span {
                    padding-left: 7px;
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--theme-text);
                  }
                }
                p:hover {
                  background: rgba(54, 112, 248, 0.1);
                  i {
                    color: var(--theme-primary);
                  }
                  span {
                    color: var(--theme-primary);
                  }
                }
                .selected {
                  background: rgba(54, 112, 248, 0.1);
                  i {
                    color: var(--theme-primary);
                  }
                  span {
                    color: var(--theme-primary);
                  }
                }
              }
            }
          }
        }
        .rightPanel {
          overflow: hidden;
          flex: 1;
          padding-left: 24px;
          .chartContainer {
            .title {
              margin-bottom: 12px;
            }
            .chartBox {
              height: 247px;
            }
          }
          .dataInfoContainer {
            margin-top: 17px;
            .dataInfoBox {
              display: flex;
              overflow: hidden;
              flex-direction: column;
              box-sizing: border-box;
              width: 100%;
              max-height: 240px;
              border: 1px solid #e8e8e8;
              // border-right: 1px solid #e8e8e8;
              >.el-scrollbar {
                display: flex;
                flex-direction: column;
                flex: 1;
                .el-scrollbar__wrap {
                  flex: 1;
                  height: 100%;
                }
              }
              .allDom {
                display: inline-block;
                flex-direction: column;
                width: auto;
                min-width: 100%;
                // height: 240px;
              }
              .dataInfoTitle {
                box-sizing: border-box;
                width: 100%;
                min-width: auto;
                height: 34px;
                // border-top: 1px solid #e8e8e8;
                border-bottom: 1px solid #e8e8e8;
                // border-bottom: none;
                background: rgba(54, 112, 248, 0.05);
                line-height: 34px;
                text-align: center;
                font-weight: 500;
                font-size: 12px;
                color: var(--theme-primary);
              }
              .content {
                display: flex;
                justify-content: flex-start;
                width: auto;
                min-width: 100%;
                height: auto;
                .variableContainer {
                  display: flex;
                  flex-direction: column;
                  flex-shrink: 0;
                  width: auto;
                  // border-left: 1px solid #e8e8e8;
                  border-right: 1px solid #e8e8e8;
                  // border-bottom: 1px solid #e8e8e8;
                  .tableLabel {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 34px;
                    padding: 0 10px;
                    border-bottom: 1px solid #e8e8e8;
                    line-height: 17px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 12px;
                    color: var(--theme-text);
                    word-break: keep-all;
                    white-space: nowrap;
                  }
                  .variableName {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex: 1;
                    min-height: 34px;
                    padding: 0 10px;
                    line-height: 17px;
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--theme-primary);
                    word-break: keep-all;
                    white-space: nowrap;
                  }
                }
              }
              .customTable2 {
                border-spacing: 0;
                tr:nth-last-child(1) {
                  td,
                  .tableValue {
                    border-bottom: none;
                  }
                }
                td {
                  padding: 0;
                  border-bottom: 1px solid #e8e8e8;
                  &:nth-of-type(8n) {
                    .tableLabel,
                    .tableValue {
                      border-right: 0;
                    }
                  }
                }
                .tableLabel {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 34px;
                  padding: 0 50px;
                  border-right: 1px solid #e8e8e8;
                  border-bottom: 1px solid #e8e8e8;
                  line-height: 17px;
                  text-align: center;
                  font-weight: 600;
                  font-size: 12px;
                  color: var(--theme-text);
                  word-break: keep-all;
                  white-space: nowrap;
                }
                .tableValue {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 34px;
                  padding: 0 10px;
                  border-right: 1px solid #e8e8e8;
                  // border-bottom: 1px solid #e8e8e8;

                  line-height: 17px;
                  text-align: center;
                  font-weight: 400;
                  font-size: 12px;
                  color: var(--theme-text-2);
                  word-break: keep-all;
                  white-space: nowrap;
                }
              }
              .customTable {
                display: flex;
                flex-direction: column;
                .divTr {
                  display: flex;
                  align-items: center;
                  border-bottom: 1px solid #e8e8e8;
                }
                .itemTd {
                  display: flex;
                  flex-direction: column;
                  .tableLabel {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 34px;
                    padding: 0 50px;
                    border-right: 1px solid #e8e8e8;
                    border-bottom: 1px solid #e8e8e8;
                    line-height: 17px;
                    text-align: center;
                    font-weight: 600;
                    font-size: 12px;
                    color: var(--theme-text);
                    word-break: keep-all;
                    white-space: nowrap;
                  }
                  .tableValue {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 34px;
                    padding: 0 10px;
                    border-right: 1px solid #e8e8e8;
                    // border-bottom: 1px solid #e8e8e8;
                    line-height: 17px;
                    text-align: center;
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--theme-text-2);
                    word-break: keep-all;
                    white-space: nowrap;
                  }
                }
              }
            }
            .emptyInfoBox {
              height: 240px;
            }
          }
        }
      }
    }
  }
}
:deep(.el-form-item__label) {
  align-items: center;
  height: 40px;
}
:deep(.el-form-item:nth-last-of-type(1)) {
  margin-bottom: 0;
}
.toolTipContent {
  width: 369px;
}
.titleContainer {
  display: flex;
  align-items: center;
}
.headerIcon {
  margin-left: 8px;
  color: var(--theme-text-3);
}
</style>

