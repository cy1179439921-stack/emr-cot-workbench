<template>
  <div class="home-page">
    <div class="home-page-header">
      <div class="header-title">平台数据概览</div>
      <div class="header-count">
        <div class="card" v-for="(item, index) in cardInfo" :key="index">
          <div class="content">
            <div class="card-title">{{item.title}}</div>
            <div class="card-count">{{addThousandSeparator(overviewData[item.prop]||0)}}</div>
          </div>
          <img class="card-icon" :src="item.icon" alt="">
        </div>
      </div>
    </div>
    <div class="home-page-content">
      <CommonTitle titleText="数据分布情况"></CommonTitle>
      <el-scrollbar>
        <div class="subContainer">
          <div class="pieChartsContainer">
            <div class="genderDistribution">
              <CommonSubTitle :text="chartsConfig.genderDistribution.title"></CommonSubTitle>
              <common-echarts :option='chartsConfig.genderDistribution.config'>
              </common-echarts>
            </div>
            <div class="ageDistribution">
              <CommonSubTitle :text="chartsConfig.ageDistribution.title"></CommonSubTitle>
              <common-echarts :option='chartsConfig.ageDistribution.config'>
              </common-echarts>
            </div>
            <div class="medicalTypeDistribution">
              <CommonSubTitle :text="chartsConfig.medicalTypeDistribution.title"></CommonSubTitle>
              <common-echarts :option='chartsConfig.medicalTypeDistribution.config'>
              </common-echarts>
            </div>
          </div>
          <div class="barChartsContainer">
            <div class="yearDistribution barChart">
              <div class="titleContaienr">
                <commonSubTitle :text="chartsConfig.yearDistribution.title"></commonSubTitle>
                <div class="vacancy"></div>
                <div class="legendContainer">
                  <div :class="{legendItem:true,actived:yearDistributionTab===1}" @click="handleLegend('yearDistributionTab',1)">住院病历</div>
                  <div :class="{legendItem:true,actived:yearDistributionTab===2}" @click="handleLegend('yearDistributionTab',2)">门急诊病历</div>
                  <div :class="{legendItem:true,actived:yearDistributionTab===3}" @click="handleLegend('yearDistributionTab',3)">体检报告</div>
                </div>
              </div>
              <common-echarts ref="yearDistributionDom" :option='chartsConfig.yearDistribution.config'>
              </common-echarts>
            </div>
            <!-- <div class="areaDistribution barChart">
              <div class="titleContaienr">
                <commonSubTitle :text="chartsConfig.areaDistribution.title"></commonSubTitle>
                <div class="vacancy"></div>
                <div class="legendContainer">
                  <div :class="{legendItem:true,actived:agencyDistributionTab===1}" @click="handleLegend('agencyDistributionTab',1)">住院病历</div>
                  <div :class="{legendItem:true,actived:agencyDistributionTab===2}" @click="handleLegend('agencyDistributionTab',2)">门急诊病历</div>
                  <div :class="{legendItem:true,actived:agencyDistributionTab===3}" @click="handleLegend('agencyDistributionTab',3)">体检报告</div>
                </div>
              </div>
              <common-echarts :option='chartsConfig.areaDistribution.config'>
              </common-echarts>
            </div> -->
            <div class="principalDiagnosisDistribution barChart">
              <commonSubTitle :text="chartsConfig.principalDiagnosisDistribution.title"></commonSubTitle>
              <common-echarts
                ref="agencyDistributionDom"
                :option='chartsConfig.principalDiagnosisDistribution.config'
                :showExtension='true'
                :needResize="true"
              >
              </common-echarts>
            </div>
            <!-- <div class="agencyDistribution barChart" >
              <commonSubTitle :text="chartsConfig.agencyDistribution.title"></commonSubTitle>
              <common-echarts
                :showExtension='true'
                :option='chartsConfig.agencyDistribution.config'
                :needResize="true">
              </common-echarts>
            </div> -->
          </div>
        </div>

      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage'
}
</script>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import lodash from 'lodash'
import { homePageConfigs } from '@/components/configs/chartsConfig.js'
// import * as echarts from 'echarts'
import { filterZero, debounce, addThousandSeparator, echartsToPx } from '@/utils/utils.js'
import { useUserStore } from '@/store/user'
import handleIcon from '@/assets/handleIcon.png'
import handleIcon2 from '@/assets/handleIcon2.png'
import handleIcon3 from '@/assets/handleIcon3.png'
import {
  getOverview,
  getSexDistribution,
  getAgeDistribution,
  getRecordTypeDistribution,
  getYearDistribution,
  getAreaDistribution,
  getPrimaryDiagnosisDistribution,
  // eslint-disable-next-line no-unused-vars
  getMedicalInstitutionDistribution,
  getAgencyNum
} from '@/api/api_homePage.js'
const props = defineProps({
  studyCohort: {
    type: [Object, String],
    default: ''
  }
})
const userStore = useUserStore()
const cardInfo = ref([
  {
    title: '患者数量',
    prop: 'patientNum',
    icon: new URL('@/assets/AIS02.png', import.meta.url).href
  },
  {
    title: '就诊数量',
    prop: 'medicalNum',
    // prop: 'recordNum',
    icon: new URL('@/assets/AIS03.png', import.meta.url).href
  },
  {
    title: '住院病历',
    prop: 'hospitalNum',
    icon: new URL('@/assets/AIS05.png', import.meta.url).href
  },
  {
    title: '门急诊病历',
    prop: 'outpatientNum',
    icon: new URL('@/assets/AIS15.png', import.meta.url).href
  },
  {
    title: '体检报告',
    prop: 'physicalNum',
    icon: new URL('@/assets/AIS17.png', import.meta.url).href
  },
  {
    title: '医院数量',
    prop: 'agencyNum',
    icon: new URL('@/assets/AIS09.png', import.meta.url).href
  }
])

const chartsConfig = ref({
  genderDistribution: {
    title: '性别分布',
    color: ['#FAC858', '#02AE7B'],
    config: homePageConfigs.pieChartOption()
  },
  ageDistribution: {
    title: '年龄分布',
    color: ['#9EB5EB', '#02AE7B', '#FF4E4E', '#FAC858', '#6694FF'],
    config: homePageConfigs.pieChartOption()
  },
  medicalTypeDistribution: {
    title: '病历类型分布',
    color: ['#FAC858', '#02AE7B', '#6694FF'],
    config: homePageConfigs.pieChartOption()
  },
  yearDistribution: {
    title: '就诊年份分布',
    config: homePageConfigs.verticalBarChartBasicOption()
  },
  // areaDistribution: {
  //   title: '患者地区分布',
  //   config: homePageConfigs.verticalBarChartBasicOption([], [])
  // },
  principalDiagnosisDistribution: {
    title: '主要诊断TOP10分布',
    config: homePageConfigs.horizontalBarChartBasicOption2()
  }
  // agencyDistribution: {
  //   title: '患者就诊医院分布',
  //   config: homePageConfigs.horizontalBarChartBasicOption2()
  // }
})
const overviewData = ref({})
const getOverviewFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getOverview(params).then(res => {
    overviewData.value = {
      ...overviewData.value,
      ...res.data
    }
  })
}
const getAgencyNumFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getAgencyNum(params).then(res => {
    overviewData.value.agencyNum = res.data
  })
}
const getSexDistributionFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getSexDistribution(params).then(res => {
    chartsConfig.value.genderDistribution.config = homePageConfigs.pieChartOption(filterZero(lodash.get(res, 'data')), chartsConfig.value.genderDistribution.color)
  })
}
const getAgeDistributionFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getAgeDistribution(params).then(res => {
    chartsConfig.value.ageDistribution.config = homePageConfigs.pieChartOption(filterZero(lodash.get(res, 'data')), chartsConfig.value.ageDistribution.color)
  })
}
const getRecordTypeDistributionFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getRecordTypeDistribution(params).then(res => {
    chartsConfig.value.medicalTypeDistribution.config = homePageConfigs.pieChartOption(filterZero(lodash.get(res, 'data')), chartsConfig.value.medicalTypeDistribution.color)
  })
}
const yearDistributionDom = ref(null)
const yearDistributionTab = ref(1)
const yearDistributionData = ref([])
const yearDistributionXdata = ref([])
const yearDistributionDataZoom = ref([])
const getYearDistributionFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getYearDistribution(params).then(res => {
    const xData = lodash.get(res, 'data.x') || []
    const yData = lodash.get(res, 'data.y') || []
    yearDistributionData.value = yData
    yearDistributionXdata.value = xData
    let dataZoom = ''
    const showNum = 13
    // if (xData.length > showNum) {
    dataZoom = computedBarNum(xData.length, showNum, 'horizontal', 100)
    yearDistributionDataZoom.value.push(dataZoom)
    yearDistributionDataZoom.value.push(computedBarNum(xData.length, showNum, 'horizontal', 100, 1))
    yearDistributionDataZoom.value.push(computedBarNum(xData.length, showNum, 'horizontal', 100, 2))
    // }
    chartsConfig.value.yearDistribution.config = homePageConfigs.verticalBarChartBasicOption(xData, yData[0].data, '就诊年份分布', dataZoom)
  })
}
const computedBarNum = (length, barNum, orient = 'horizontal', initStart, index = 0, fontSize = 12) => {
  const defaultShowNum = barNum || 4
  const Radius = Math.min(defaultShowNum, length) / length * 100 || 100
  const config = [
    {
      commonColor: '#6694FF',
      fillerColor: 'rgba(102, 148, 255, 0.2)',
      handleIcon
    },
    {
      commonColor: '#FAC858',
      fillerColor: 'rgba(250, 200, 88, 0.2)',
      handleIcon: handleIcon2
    },
    {
      commonColor: '#51BC9C',
      fillerColor: 'rgba(81,188,156, 0.2)',
      handleIcon: handleIcon3
    }
  ]
  const selectConfig = config[index]
  if (orient === 'horizontal') {
    return [{ // 这是重要的部分
      type: 'slider',
      show: true,
      start: initStart ? 100 : 0,
      orient,
      end: initStart ? (100 - Radius) : Radius,
      zoomOnMouseWheel: false, // 关闭滚轮缩放
      moveOnMouseWheel: false, // 开启滚轮平移
      moveOnMouseMove: false,
      backgroundColor: 'rgba(242, 243, 245, 0.70)',
      borderColor: 'rgba(0,0,0,0)',
      height: echartsToPx(12),
      dataBackground: {
        lineStyle: {
          color: selectConfig.commonColor,
          width: echartsToPx(2),
          opacity: 0.3
        },
        areaStyle: {
          color: selectConfig.commonColor,
          opacity: 0
        }
      },
      selectedDataBackground: {
        lineStyle: {
          color: selectConfig.commonColor,
          width: echartsToPx(2),
          opacity: 0.3
        },
        areaStyle: {
          color: selectConfig.commonColor,
          opacity: 0.15
        }
      },
      zoomLock: true,
      borderRadius: echartsToPx(2),
      fillerColor: selectConfig.fillerColor,
      handleIcon: 'image://' + selectConfig.handleIcon,
      handleSize: echartsToPx(30),
      handleStyle: {},
      moveHandleSize: 0,
      moveHandleStyle: {},
      textStyle: {
        padding: echartsToPx(-70),
        color: '#666',
        fontSize: echartsToPx(fontSize)
      },
      brushSelect: false,
      left: echartsToPx(16),
      right: echartsToPx(16),
      bottom: echartsToPx(3)
    }]
  } else {
    return [{ // 这是重要的部分
      type: 'inside', // 缩放条类型为滑动条
      show: true,
      start: initStart ? 100 : 0,
      orient,
      end: initStart ? (100 - Radius) : Radius,
      zoomOnMouseWheel: false, // 关闭滚轮缩放
      moveOnMouseWheel: true, // 开启滚轮平移
      moveOnMouseMove: false,
      handleSize: '80%'
    }]
  }
}
const agencyDistributionDom = ref(null)
const agencyDistributionTab = ref(1)
const areaDistributionData = ref([])
const areaDistributionDataZoom = ref([])
const handleLegend = (type, val) => {
  let color = ['#6694FF']
  if (val === 2) {
    color = ['#FAC858']
  } else if (val === 3) {
    color = ['#51BC9C']
  }
  if (type === 'yearDistributionTab') {
    yearDistributionTab.value = val
    let dataZoom = ''
    if (yearDistributionDataZoom.value.length) {
      dataZoom = yearDistributionDataZoom.value[val - 1]
    }
    chartsConfig.value.yearDistribution.config = homePageConfigs.verticalBarChartBasicOption(yearDistributionXdata, yearDistributionData.value[val - 1]?.data || [], '就诊年份分布', dataZoom, color, val)

    /* chartsConfig.value.yearDistribution.config.series.data = yearDistributionData.value[val - 1]?.data || []
    chartsConfig.value.yearDistribution.config.color = color
    if (yearDistributionDataZoom.value.length) {
      chartsConfig.value.yearDistribution.config.dataZoom = yearDistributionDataZoom.value[val - 1]
    } */
  } else {
    agencyDistributionTab.value = val
    chartsConfig.value.areaDistribution.config.series.data = areaDistributionData.value[val - 1]?.data || []
    chartsConfig.value.areaDistribution.config.color = color

    if (areaDistributionDataZoom.value.length) {
      chartsConfig.value.areaDistribution.config.dataZoom = areaDistributionDataZoom.value[val - 1]
    }
  }
}
// eslint-disable-next-line no-unused-vars
const getAreaDistributionFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getAreaDistribution(params).then(res => {
    const xData = lodash.get(res, 'data.x') || []
    const yData = lodash.get(res, 'data.y') || []
    areaDistributionData.value = yData
    let dataZoom = ''
    const showNum = 13
    // if (xData.length > showNum) {
    dataZoom = computedBarNum(xData.length, showNum, 'horizontal', '', 0, 10)
    areaDistributionDataZoom.value.push(dataZoom)
    areaDistributionDataZoom.value.push(computedBarNum(xData.length, showNum, 'horizontal', '', 1, 10))
    areaDistributionDataZoom.value.push(computedBarNum(xData.length, showNum, 'horizontal', '', 2, 10))
    // }
    chartsConfig.value.areaDistribution.config = homePageConfigs.verticalBarChartBasicOption(xData, yData[0]?.data, '患者地区分布', dataZoom)
  })
}
const getPrimaryDiagnosisDistributionFn = () => {
  let params = {}
  if (props.studyCohort) {
    params = {
      queueId: props.studyCohort
    }
  }
  getPrimaryDiagnosisDistribution(params).then(res => {
    const seriesData = lodash.get(res, 'data.y') || []
    const yAxisData = lodash.get(res, 'data.x') || []
    chartsConfig.value.principalDiagnosisDistribution.config = homePageConfigs.horizontalBarChartBasicOption2(yAxisData.reverse(), seriesData.reverse(), ['#6694FF'])
  })
}

// const getMedicalInstitutionDistributionFn = () => {
//   let params = {}
//   if (props.studyCohort) {
//     params = {
//       queueId: props.studyCohort
//     }
//   }
//   getMedicalInstitutionDistribution(params).then(res => {
//     const yAxisData = lodash.get(res, 'data.x') || []
//     const seriesData = lodash.get(res, 'data.y') || []
//     chartsConfig.value.agencyDistribution.config = homePageConfigs.horizontalBarChartBasicOption2(yAxisData.reverse(), seriesData.reverse(), ['#FAC858'])
//     if (yAxisData.length > 10) {
//       chartsConfig.value.agencyDistribution.config.dataZoom = computedBarNum(yAxisData.length, 10, 'vertical', 100)
//     }
//   })
// }
const getAllData = () => {
  getOverviewFn()
  getAgencyNumFn()
  getSexDistributionFn()
  getAgeDistributionFn()
  getRecordTypeDistributionFn()
  getYearDistributionFn()
  // getAreaDistributionFn()
  getPrimaryDiagnosisDistributionFn()
  // getMedicalInstitutionDistributionFn()
}
getAllData()

let debouncedResize = null
// 在页面加载时添加resize事件监听
onMounted(() => {
  debouncedResize = debounce(() => {
    // 避免收缩导航栏触发resize
    if (userStore.screenWidth !== (document.documentElement.clientWidth || document.body.clientWidth)) {
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

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  // padding: 16px;
  .home-page-header {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 169px;
    margin: 16px;
    margin-bottom: 0;
    padding: 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .header-title {
      height: 19px;
      line-height: 19px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    .header-count {
      display: flex;
      margin-top: 16px;
      .card {
        display: flex;
        align-items: center;
        flex: 1;
        box-sizing: border-box;
        height: 102px;
        margin-right: 16px;
        padding: 20px 24px;
        border-radius: 4px;
        background: rgba(54, 112, 248, 0.03);
        &:nth-last-child(1) {
          margin-right: 0;
        }
        .card-icon {
          width: 54px;
          height: 54px;
        }
      }
      .content {
        display: flex;
        flex-direction: column;
        flex: 1;
        &:last-child {
          margin-right: 0;
        }
        .card-title {
          line-height: 20px;
          font-size: 14px;
          color: var(--theme-text-2);
        }
        .card-count {
          margin-top: 12px;
          line-height: 30px;
          font-family: D-DIN;
          font-weight: 700;
          font-size: 28px;
          color: var(--theme-text);
        }
      }
    }
  }
  .home-page-content {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;
    height: auto;
    .commonTitle {
      margin-left: 16px;
    }
    .subContainer {
      padding: 0 16px 16px 16px;
    }
    .title {
      margin-bottom: 16px;
      line-height: 19px;
      text-align: left;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
    :deep(.el-scrollbar) {
      flex: 1;
      border-radius: 8px;
    }
    .pieChartsContainer {
      display: flex;
      width: 100%;
      height: 365px;
      .genderDistribution,
      .ageDistribution,
      .medicalTypeDistribution {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        width: 596px;
        margin-right: 16px;
        padding: 24px;
        border-radius: 8px;
        background: var(--theme-card);
        :deep(.dataOverview) {
          flex: 1;
        }
      }
      .medicalTypeDistribution {
        margin-right: 0;
      }
    }
    .barChartsContainer {
      display: flex;
      flex-wrap: wrap;
      height: auto;
      margin-top: 16px;

      .barChart {
        display: flex;
        position: relative;
        flex-direction: column;
        box-sizing: border-box;
        // width: 900px;
        width: calc(50% - 8px);
        height: 447px;
        margin-right: 16px;
        margin-bottom: 16px;
        padding: 24px;
        border-radius: 8px;
        background: var(--theme-card);
        &:nth-of-type(2n) {
          margin-right: 0;
        }
        &.principalDiagnosisDistribution,
        &.agencyDistribution {
          // height: 628px;
          height: 553px;
          margin-bottom: 0;
        }
        &.yearDistribution {
          height: 553px;
        }
        :deep(.dataOverview) {
          flex: 1;
        }
        .titleContaienr {
          display: flex;
          .vacancy {
            flex: 1;
          }
          .legendContainer {
            display: flex;
            position: relative;
            justify-content: end;
            align-items: center;
            width: auto;
            // &::before {
            //   position: absolute;
            //   left: 88px;
            //   top: 0;
            //   width: 0;
            //   height: 100%;
            //   border-right: 1px solid var(--theme-primary);
            //   content: '';
            // }
            .legendItem {
              display: flex;
              justify-content: center;
              align-items: center;
              box-sizing: border-box;
              width: 88px;
              height: 32px;
              border: 1px solid #d8d8d8;
              background: var(--theme-card);
              cursor: pointer;
              text-align: center;
              font-size: 14px;
              &:nth-of-type(1) {
                border-radius: 2px 0 0 2px;
                &.actived {
                  border-right: 1px solid var(--theme-primary);
                }
              }
              &:nth-of-type(2) {
                width: 102px;
                border-left: 1px solid #fff;
                border-radius: 0;
                &.actived {
                  border-left: 1px solid var(--theme-primary);
                  border-radius: 0;
                }
              }
              &:nth-of-type(3) {
                width: 102px;
                border-left: 1px solid #fff;
                border-radius: 0 2px 2px 0;
                &.actived {
                  border-left: 1px solid var(--theme-primary);
                  border-radius: 0 2px 2px 0;
                }
              }
              &.actived {
                border: 1px solid var(--theme-primary);
                color: var(--theme-primary);
              }
            }
          }
        }
      }
    }
  }
}
</style>
