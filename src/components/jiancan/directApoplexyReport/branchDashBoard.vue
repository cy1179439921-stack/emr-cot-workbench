<template>
  <div class="centerDashBoard">
    <commonTitle titleText="平台数据上报概览"></commonTitle>
    <div class="centerDataContainer">
      <div class="predictiveAnalysisContainer">
        <div class="reportTrend">
          <CommonSubTitle text="医院处理趋势"></CommonSubTitle>
          <div class="searchContainer">
            <el-form
              :model="reportTrendSearchObj"
              class="demo-form-inline"
              style="
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              width: auto;"
              label-width="auto"
            >
              <el-form-item label="医院">
                <commonMultipleSelect
                  :style="{width: pxToRem(226),height: pxToRem(32)}"
                  v-model="reportTrendSearchObj.agency"
                  :options="agencyList"
                  @change="getReportTrendFn"
                  placeholder="全部"
                />
              </el-form-item>
              <el-form-item label="治疗类型">
                <commonMultipleSelect
                  :style="{width: pxToRem(226),height: pxToRem(32)}"
                  v-model="reportTrendSearchObj.disease"
                  :options="diseaseOptions"
                  @change="getReportTrendFn"
                  placeholder="全部"
                />
              </el-form-item>
              <el-form-item label="起止时间">
                <AllDateSelect
                  :style="{width:pxToRem(226),height: pxToRem(32)}"
                  :isDefaultTime="true"
                  v-model="reportTrendSearchObj.date"
                  v-model:dateType="reportTrendSearchObj.dateType"
                  @change="handleTimeChange"
                ></AllDateSelect>
              </el-form-item>
            </el-form>
          </div>
          <div class="chartContainer">
            <common-echarts :option="chartOptions.chartTwoOption.config">
            </common-echarts>
          </div>
          <div class="legendDiv">
            <commonLengend text="当日处理数"></commonLengend>
          </div>
        </div>
      </div>
      <div class="overviewData">
        <div class="overviewTitle">
          <CommonSubTitle text="平台数据总览"></CommonSubTitle>
        </div>
        <div class="content">
          <div v-for="(item,index) in reportConfigs" :key="index" class="overviewItem">
            <div class="label">
              {{ item.name }}
            </div>
            <div class="valContainer">
              <span class="val">
                {{ overviewData[item.prop]||0 }}
              </span>
              <span class="unit">
                {{item.unit}}
              </span>
            </div>
            <div class="compare" v-if="item.formatter" v-html="item.formatter()">
            </div>
            <img :src="item.img" class="overviewItemIcon" alt="">
          </div>
        </div>

      </div>
    </div>
    <commonTitle titleText="患者基本信息分布情况"></commonTitle>
    <div class="chartsContainer">
      <div class="bgContainer pieChartItem">
        <!-- <div class="title">性别分布</div> -->
        <CommonSubTitle text="性别分布"></CommonSubTitle>
        <div class="chartContainer">
          <common-echarts :option="chartOptions.chartThreeOption.config">
          </common-echarts>
        </div>
      </div>
      <div class="bgContainer pieChartItem">
        <!-- <div class="title">年龄分布</div> -->
        <CommonSubTitle text="年龄分布"></CommonSubTitle>
        <div class="chartContainer">
          <common-echarts :option="chartOptions.chartFourOption.config">
          </common-echarts>
        </div>
      </div>
      <div class="bgContainer pieChartItem">
        <!-- <div class="title">治疗类型分布</div> -->
        <CommonSubTitle text="治疗类型分布"></CommonSubTitle>
        <div class="chartContainer">
          <common-echarts :option="chartOptions.chartFiveOption.config">
          </common-echarts>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { chartsConfigs } from './configs/chartsConfigs.js'
import { diseaseOptions } from '@/components/jiancan/medicalDirectReport/configMenu.js'
import commonMultipleSelect from '@/components/common/commonMultipleSelect.vue'
// eslint-disable-next-line no-unused-vars
import {
  formatStandardDate,
  filterZero,
  // echartsToPx,
  debounce
} from '@/utils/utils.js'
import { useUserStore } from '@/store/user'
import {
  getReportDataNew,
  getOverviewData,
  getAllAgency,
  getTreatmentTypes,
  getReportTrend,
  getSexData,
  getAgeData,
  getHealingTypeData,
  getAgencyNumNew
} from '@/api/jiancanAPI/api_homePage'
import lodash from 'lodash'
const overviewData = ref({})
// eslint-disable-next-line no-unused-vars
const reportConfigs = [
  {
    name: '处理病案总数',
    prop: 'reportTotalNum',
    unit: '（份）',
    img: new URL('/src/assets/reportImg1.png', import.meta.url).href
  },
  {
    name: '今日处理病案数',
    prop: 'currentDayReportTotalNum',
    unit: '（份）',
    img: new URL('/src/assets/reportImg2.png', import.meta.url).href,
    formatter: (row) => {
      const num1 = lodash.get(overviewData.value, 'currentDayReportTotalNum') - 0
      const num2 = lodash.get(overviewData.value, 'preDayReportTotalNum') - 0

      let className = num1 > num2 ? 'up' : num1 < num2 ? 'down' : 'none'
      let num = 0
      const obj = {
        down: new URL('/src/assets/downIcon.png', import.meta.url).href,
        up: new URL('/src/assets/upIcon.png', import.meta.url).href,
        none: ''
      }
      let icon = obj[className]
      if (!num2) {
        num = '-'
        className = ''
        icon = ''
      } else {
        num = (Math.abs((num1 - num2) / num2) * 100).toFixed(1) + '%'
      }

      if (className && className !== 'none') {
        return `
                <span class='${className}'>较昨日：${num}</span>
                <img src='${icon}' class='chainRatioIcon'/>
              `
      } else {
        return `<span class='none'>较昨日：- - </span>`
      }
    }
  }
]
const userStore = useUserStore()
const chartOptions = reactive({
  chartOneOption: {

  },
  chartTwoOption: {
    config: chartsConfigs.lineChartBasicOption({ title: '', name: '当日上报数' })
  },
  chartThreeOption: {
    color: ['#04A273', '#FAC858', '#3670F8'],
    config: chartsConfigs.pieChartOption()
  },
  chartFourOption: {
    color: ['#9EB5EB', '#04A273', '#FF4E4E', '#FAC858', '#3670F8'],
    config: chartsConfigs.pieChartOption()
  },
  chartFiveOption: {
    color: ['#9EB5EB', '#04A273', '#FF4E4E', '#FAC858', '#3670F8'],
    config: chartsConfigs.pieChartOption()
  }
})

const handleTimeChange = () => {
  console.log('日期发生更改', reportTrendSearchObj.value)
  // chooseDay.value = null
  getReportTrendFn()
}
const getDefaultTime = (type) => {
  if (type === 'monthrange') {
    const end = new Date()
    end.setDate(1)
    const start = new Date(end)
    // 默认近12个月
    start.setMonth(end.getMonth() - 11)
    return [formatStandardDate(start), formatStandardDate(end)]
  } else if (type === 'yearrange') {
    const year = new Date().getFullYear()
    return [year - 6, year]
  } else {
    const end = new Date()
    const start = new Date().getTime() - 3600 * 1000 * 24 * 6
    return [formatStandardDate(start), formatStandardDate(end)]
  }
}
const reportTrendSearchObj = ref({
  dateType: 'monthrange',
  date: getDefaultTime('monthrange')
})

const agencyList = ref([])
const getAllAgencyFn = () => {
  getAllAgency({}).then((res) => {
    // 获取到的医院'
    agencyList.value = lodash.get(res, 'data') || []
  })
}
const treatmentTypes = ref([])
// eslint-disable-next-line no-unused-vars
const getTreatmentTypesFn = () => {
  getTreatmentTypes({}).then((res) => {
    // 治疗类型的获取'
    treatmentTypes.value = lodash.get(res, 'data')
    treatmentTypes.value = [{ name: 111, id: 111 }, { name: 777, id: 777 }]
  })
}
const totality = ref('0')
const renderList = ref([])
const getReportDataFn = () => {
  getReportDataNew({}).then((res) => {
    const arr = []
    const XData = lodash.get(res, 'data.y') || []
    const YData = lodash.get(res, 'data.x') || []
    XData.forEach((item, index) => {
      arr.push({
        label: YData[index],
        value: Number(item)
      })
    })
    renderList.value = arr
    totality.value = lodash.max(XData)
  })
}
const transforParam = (type) => {
  const obj = {
    yearrange: 'year',
    monthrange: 'month',
    daterange: 'day'
  }
  return obj[type]
}
const getReportTrendFn = () => {
  const params = {
    // date: lodash.get(reportTrendSearchObj.value,'date')||[],
    // agency:
    ...reportTrendSearchObj.value,
    type: transforParam(reportTrendSearchObj.value.dateType)
    // date: ['2024-3-17', '2024-3-27']
  }
  getReportTrend(params).then((res) => {
    // 上报趋势数据

    chartOptions.chartTwoOption.config.xAxis.data = lodash.get(res, 'data.x') || []
    lodash.get(res, 'data.y').forEach((item) => {
      if (item.name === '当日上报数') {
        // 判断数据是否全为 0
        const isAllZero = item.data.every(d => d === 0)
        if (isAllZero) {
          chartOptions.chartTwoOption.config.yAxis.minInterval = null
        } else {
          chartOptions.chartTwoOption.config.yAxis.minInterval = 1
        }
        chartOptions.chartTwoOption.config.yAxis.axisLabel.formatter = function(value) {
          if (isAllZero) {
            return value < 1 ? value * 10 : value * 10
          } else {
            return value
          }
        }
        chartOptions.chartTwoOption.config.series.data = item.data || []
      }
    })
  })
}
const getOverviewDataFn = () => {
  getOverviewData({}).then((res) => {
    // 数据概览
    overviewData.value = {
      ...overviewData.value,
      ...(lodash.get(res, 'data') || {})
    }
  })
}
const getSexDataFn = () => {
  getSexData({}).then((res) => {
    // '性别分布'
    chartOptions.chartThreeOption.config = chartsConfigs.pieChartOption(filterZero(
      lodash.get(res, 'data'),
      chartOptions.chartThreeOption.color
    ))
  })
}
const getAgeDataFn = () => {
  getAgeData({}).then((res) => {
    //  '年龄分布'
    chartOptions.chartFourOption.config = chartsConfigs.pieChartOption(
      filterZero(lodash.get(res, 'data')),
      chartOptions.chartFourOption.color
    )
  })
}
const getHealingTypeDataFn = () => {
  getHealingTypeData({}).then((res) => {
    // '治疗类型分布'
    chartOptions.chartFiveOption.config = chartsConfigs.pieChartOption(
      filterZero(lodash.get(res, 'data')), chartOptions.chartFiveOption.color
    )
  })
}
const getAgencyNumFn = () => {
  getAgencyNumNew({}).then((res) => {
    overviewData.value.agencyNum = res.data
  })
}
const getAllRemoteData = () => {
  getAllAgencyFn()
  getAgencyNumFn()
  // getTreatmentTypesFn()
  getReportDataFn()
  getOverviewDataFn()
  getReportTrendFn()
  getSexDataFn()
  getAgeDataFn()
  getHealingTypeDataFn()
}
getAllRemoteData()
let debouncedResize = null
// 在页面加载时添加resize事件监听
onMounted(() => {
  debouncedResize = debounce(() => {
    // 避免收缩导航栏触发resize
    if (
      userStore.screenWidth !==
      (document.documentElement.clientWidth || document.body.clientWidth)
    ) {
      location.reload()
    }
  }, 300) // 延迟时间为300毫秒

  window.addEventListener('resize', debouncedResize)
})
// 在组件销毁前移除resize事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedResize)
})
</script>
<style lang="scss" scoped>
.centerDashBoard {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding: 0 16px 16px 16px;
  .centerDataContainer {
    display: flex;
    align-items: center;
  }
  .predictiveAnalysisContainer {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 460px;
    padding: 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .reportTrend {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      .chartContainer {
        flex: 1;
      }
      .searchContainer {
        margin-top: 16px;
        :deep(.el-form) {
          .el-form-item__label-wrap {
            margin-left: 0 !important;
          }
          .el-form-item {
            margin-right: 28px;
          }
          :deep(.el-form-item__label) {
            width: auto;
          }
        }
      }
      .legendDiv {
        margin-top: 10px;
      }
    }
    .reportRanking {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      box-sizing: border-box;
      width: 392px;
      height: 100%;
      padding-top: 38px;
      .titleContainer {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        height: 32px;
        margin-bottom: 4px;
      }
      .content {
        flex: auto;
        height: 0;
      }
    }
  }
  .overviewData {
    box-sizing: border-box;
    width: 455px;
    height: 460px;
    margin-left: 16px;
    padding: 24px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .overviewTitle {
      margin-bottom: 21px;
    }
    .overviewItem {
      display: flex;
      position: relative;
      flex-direction: column;
      box-sizing: border-box;
      height: 170px;
      margin-bottom: 24px;
      padding: 0 32px 32px 32px;
      border-radius: 4px;
      background: linear-gradient(135deg, rgba(248, 6, 6, 0.35) 0%, #ecf3fa 0%, #f2f8fc 100%);
      &:nth-of-type(1) {
        .label {
          margin-top: 32px;
          margin-bottom: 15px;
        }
        img {
          right: 44px;
          top: 34px;
          width: 97px;
          height: 121px;
        }
      }
      &:nth-of-type(2) {
        margin-bottom: 0;
        .label {
          margin-top: 32px;
          margin-bottom: 8px;
        }
        img {
          right: 41px;
          top: 35px;
          width: 105px;
          height: 106px;
        }
      }
      &:nth-of-type(3) {
        margin-bottom: 0;
        .label {
          margin-top: 24px;
          margin-bottom: 15px;
        }
        img {
          right: 22px;
          top: 21px;
          width: 78px;
          height: 78px;
        }
      }
      .overviewItemIcon {
        position: absolute;
      }
      .label {
        flex: 1;
        line-height: 20px;
        font-size: 18px;
        color: #3d3d3d;
      }
      .valContainer {
        display: flex;
        align-items: baseline;
        .val {
          line-height: 34px;
          font-family: D-DIN;
          font-weight: 500;
          font-size: 34px;
          color: #3d3d3d;
        }
        .unit {
          line-height: 18px;
          font-size: 18px;
          color: var(--theme-text-2);
        }
      }
      .compare {
        display: flex;
        align-items: center;
        .up {
          line-height: 20px;
          font-size: 14px;
          color: #04a273;
        }
        .down {
          line-height: 20px;
          font-size: 14px;
          color: #ff4e4e;
        }
        .none {
          line-height: 20px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-3);
        }
        img {
          width: 11px;
          height: 14px;
          margin-left: 6px;
        }
      }
    }
  }
  .chartsContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    height: 0;
    .pieChartItem {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 592px;
      height: 100%;
      padding: 24px;
      border-radius: 8px;
      background-color: var(--theme-card);
      .title {
        margin-bottom: 20px;
        line-height: 20px;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-text);
      }
      .chartContainer {
        flex: 1;
      }
    }
  }
}
:deep(.chainRatioIcon) {
  width: 11px;
  height: 14px;
  margin-left: 6px;
}
:deep(.el-form-item__content) {
  line-height: 0;
}
</style>
