<template>
  <div class="intravenousThrombolysis">
    <div class="overView">
      <!-- <div class="title">预估评分</div>
      <div class="predictiveScore">
        <div v-for="(item,index) in predictiveScore" :key="index" :class="{itemKey:true,keyPoint:item.keyPoint}">
          <div class="label">
            <img :src="greenStar" class="star" v-if="item.keyPoint" alt="">
            <span>{{ item.label }}</span>
          </div>
          <div class="val">{{overViewData[item.prop] }}</div>
        </div>
      </div> -->
      <div class="title">
        <CommonSubTitle text="数据指标" ></CommonSubTitle>
      </div>
      <div class="dataIndex">
        <div v-for="(item,index) in dataIndex" :key="index" class="itemKey">
          <div class="itemKeyLeft">
            <div class="label">{{ item.label }}</div>
            <div class="val" v-if="!item.formatter">
              <span>{{overViewData[item.prop] }}</span>
              <em>{{ item.units }}</em>
            </div>
            <div class="val" v-else>
              <span>{{ item.formatter(overViewData) }}</span>
              <em class="unit">{{ item.units }}</em>
            </div>
          </div>
          <div class="itemKeyRight">
            <img :src="item.icon" alt="" />
          </div>
        </div>
      </div>
    </div>
    <div class="mainContent">
      <div class="chartsContianer">
        <div v-for="(item,index) in chartsOption " :key="index" class="itemChartContainer">
          <!-- <div class="chartTitle">
            {{ item.title }}
          </div> -->
          <CommonSubTitle :text="item.title"></CommonSubTitle>
          <div class="compositeScoreContainer" v-if="index===0">
            <span class="compositeScore">
              {{ overViewData.allScore||0 }}
            </span>
            <span>分</span>
          </div>
          <div class="chartContainer">
            <common-echarts :labelLayout="item.labelLayout" :option="item.chartConfig">
            </common-echarts>
          </div>
        </div>
      </div>
      <div class="AISDistribution">
        <!-- <div class="chartTitle">
          AIS病历各项评估完成统计图
        </div>
        <div class="chartContainer">
          <common-echarts :option="AISDistributionConfig">
          </common-echarts>
        </div> -->
        <commonMapList :AISDistributionConfig="AISDistributionConfig" :title="'AIS介入再通病历各项评估完成统计图'"></commonMapList>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import lodash from 'lodash'
import { chartsConfigs } from './configs/chartsConfigs.js'
import { echartsToPx } from '@/utils/utils'
import { getDptData } from '@/api/jiancanAPI/api_homePage.js'
import commonMapList from '@/components/common/commonMapList.vue'
const props = defineProps({
  overViewData: {
    type: Object,
    default: () => {
      return {}
    }
  },
  medicalRecordNumber: {
    type: [Number, String],
    default: 0
  },
  date: {
    type: String,
    default: ''
  }
})
const predictiveScore = ref([
  {
    label: 'AIS介入再通例数得分',
    prop: 'healingTypeScore'
  },
  {
    label: 'DPT中位数得分',
    prop: 'middleDptScore'
  },
  {
    label: '各项评估完成率得分',
    prop: 'everyCompleteScore'
  },
  {
    label: '病历完整度得分',
    prop: 'completeScore'
  }
  // {
  //   label: '技术综合分',
  //   keyPoint: true,
  //   prop: 'allScore'
  // }
])
const dataIndex = ref([
  {
    label: 'AIS介入再通病历例数',
    prop: 'healingTypeNum',
    icon: new URL('@/assets/AIS11.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: 'DPT 中位数',
    prop: 'middleDpt',
    icon: new URL('@/assets/AIS12.png', import.meta.url).href,
    units: '（分钟）'
  },
  {
    label: '病历完整比例',
    prop: 'completeNum',
    formatter: (obj) => {
      if ((obj.healingTypeNum - 0) && (obj.completeNum - 0)) {
        return (obj.completeNum / obj.healingTypeNum * 100).toFixed(2)
      } else {
        return '0'
      }
    },
    icon: new URL('@/assets/AIS03.png', import.meta.url).href,
    units: '%'
  },
  {
    label: '发病前 mRS 评分完成数',
    prop: 'mrsCompleteNum',
    icon: new URL('@/assets/AIS04.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '术前评估 NIHSS 评分完成数',
    prop: 'obNIHSSCompleteNum',
    icon: new URL('@/assets/AIS05.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '术后 mTICI 分级完成数',
    prop: 'ticicompleteNum',
    icon: new URL('@/assets/AIS06.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '术后 24hNIHSS 评分完成数',
    prop: 'oaNIHSSCompleteNum',
    icon: new URL('@/assets/AIS07.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '7±2 天NIHSS 评分完成数',
    prop: 'onihss72CompleteNum',
    icon: new URL('@/assets/AIS08.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '7±2 天(或出院)时NIHSS 评分完成数',
    prop: 'exitNIHSSCompleteNum',
    icon: new URL('@/assets/AIS09.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '7±2 天(或出院)时mRS 评分完成数',
    prop: 'mrs72CompleteNum',
    icon: new URL('@/assets/AIS10.png', import.meta.url).href,
    units: '（条）'
  }
  // {
  //   label: '7±2 天(或出院)时mRS 评分完成数',
  //   prop: 'val'
  // }
])
const chartsOption = ref([
  {
    title: '技术综合评分',
    chartConfig: chartsConfigs.radarOptions()
  },
  {
    title: '上报病历类型占比图',
    chartConfig: lodash.cloneDeep(chartsConfigs.instrumentPanel(
      0,
      'AIS介入再通病历占比'
    ))
  },
  {
    title: 'AIS介入再通病历DPT分布图',
    chartConfig: {
      ...chartsConfigs.pieChartOption()
    }
    // labelLayout: true
  },
  {
    title: 'AIS介入再通完整病历分布图',
    chartConfig: {
      ...chartsConfigs.pieChartOption()
    },
    labelLayout: true
  }
])
const AISDistributionConfig = ref({
  ...lodash.cloneDeep(chartsConfigs.horizontalBarChartBasicOption),
  series: {
    name: '病例数',
    type: 'bar',
    barWidth: echartsToPx(24),
    data: [],
    itemStyle: {
      color: '#6F9AD8',
      borderRadius: [0, echartsToPx(12), echartsToPx(12), 0]
    },
    label: {
      show: true,
      position: 'right',
      fontSize: echartsToPx(12),
      // fontFamily: 'D-DIN',
      color: '#333333'
    }
  }
})
watch(() => props.overViewData,
  (newVal, oldVal) => {
    const indicator = []
    const data = []
    predictiveScore.value.forEach(item => {
      indicator.push({ name: item.label, max: 100 })
      data.push(newVal[item.prop] || 0)
    })
    chartsOption.value[0].chartConfig = chartsConfigs.radarOptions(indicator, data)
    if (props.medicalRecordNumber - 0) {
      chartsOption.value[1].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        ((newVal.healingTypeNum - 0) / (props.medicalRecordNumber - 0)).toFixed(2),
        'AIS介入再通病历占比'
      ))
    } else {
      chartsOption.value[1].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        0,
        'AIS介入再通病历占比'
      ))
    }
    if ((Number(newVal.completeNum) || Number(newVal.healingTypeNum - newVal.completeNum))) {
      chartsOption.value[3].chartConfig = chartsConfigs.pieChartOption([
        {
          name: 'AIS介入再通完整病历',
          value: newVal.completeNum || 0
        }, {
          name: 'AIS介入再通非完整病历',
          value: (newVal.healingTypeNum - newVal.completeNum) || 0
        }
      ],
      ['#FAC858', '#04A273'])
      chartsOption.value[3].chartConfig.series.label.formatter = '{b}：\n{c}（{d}%)'
    }

    // 引导线单独换行处理

    AISDistributionConfig.value = [{
      name: '7±2 天(或出院)时mRS 评分完成数',
      value: newVal.mrs72CompleteNum || 0
    }, {
      name: '7±2 天(或出院)时NIHSS 评分完成数',
      value: newVal.exitNIHSSCompleteNum || 0
    }, {
      name: '7±2 天 NIHSS 评分完成数',
      value: newVal.onihss72CompleteNum || 0
    }, {
      name: '术后 24hNIHSS 评分完成数',
      value: newVal.oaNIHSSCompleteNum || 0
    }, {
      name: '术前评估 NIHSS 评分完成数',
      value: newVal.obNIHSSCompleteNum || 0
    }, {
      name: '发病前 mRS 评分完成数',
      value: newVal.mrsCompleteNum || 0
    }, {
      name: '术后 mTICI 分级完成数',
      value: newVal.ticicompleteNum || 0
    }]
    AISDistributionConfig.value.forEach(item => {
      item.totalNumber = newVal.healingTypeNum || 0
    })
  },
  {
    immediate: true
  }
)
watch(() => props.date,
  (newVal, oldVal) => {
    getDptData({ month: newVal }).then(res => {
      if (res.data?.length) {
        chartsOption.value[2].chartConfig = {
          ...chartsConfigs.pieChartOption(res.data, ['#FAC858', '#9EB5EB', '#3670F8', '#283E81', '#91CC75', '#04A273', '#68A400', '#FFA358', '#D599FD', '#8A33C4', '#FF4E4E'])
        }
        chartsOption.value[2].chartConfig.legend.itemWidth = echartsToPx(16)
      }
    })
  },
  {
    immediate: true
  }
)
</script>
<style lang="scss" scoped>
.intravenousThrombolysis {
  .overView {
    box-sizing: border-box;
    height: 334px;
    padding: 24px;
    padding-bottom: 8px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .title {
      position: relative;
      margin-bottom: 24px;
      // padding-left: 8px;
      line-height: 26px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text);
      // &::before {
      //   position: absolute;
      //   left: 0;
      //   top: 50%;
      //   width: 3px;
      //   height: 15px;
      //   border-radius: 0 0 0 0;
      //   background: rgba(82, 147, 220, 0.9686);
      //   content: '';
      //   transform: translateY(-50%);
      // }
    }
    .dataIndex {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      .itemKey {
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        // width: calc((100% - 64px) / 5);
        width: 340px;
        height: 110px;
        margin: 0 16px 16px 0;
        padding: 18px 24px 22px 24px;
        border-radius: 8px;
        background: rgba(54, 112, 248, 0.03);
        .itemKeyLeft {
          position: relative;
          .label {
            max-width: 209px;
            min-height: 34px;
            line-height: 17px;
            font-weight: 400;
            font-size: 12px;
            color: var(--theme-text);
          }
          .val {
            display: flex;
            align-items: flex-end;
            padding-top: 8px;
            span {
              display: block;
              line-height: 28px;
              font-family: D-DIN;
              font-weight: 500;
              font-size: 26px;
              color: var(--theme-text);
            }
            em {
              display: block;
              line-height: 20px;
              font-style: normal;
              font-weight: 500;
              font-size: 12px;
              color: var(--theme-text-2);
            }
            .unit {
              padding-left: 5px;
            }
          }
        }
        .itemKeyRight {
          padding-top: 10px;
          img {
            width: 55px;
            height: 55px;
          }
        }
      }
      .itemKey:nth-child(5n) {
        margin-right: 0;
      }
    }
    .predictiveScore {
      margin-bottom: 28px;
    }
  }
}
.mainContent {
  display: flex;
  align-items: flex-start; /* 确保子元素顶部对齐 */
  width: 100%;
  margin-top: 16px;
  .chartsContianer {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start; /* 确保子元素顶部对齐 */
    width: 66.66%;

    .itemChartContainer {
      display: flex;
      position: relative;
      flex-direction: column;
      box-sizing: border-box;
      width: calc(50% - 8px); /* 每个 itemChartContainer 实际占据的宽度，减去 margin-right 的一半 */
      height: 365px;
      margin: 0 16px 16px 0; /* 每个 itemChartContainer 的 margin-right 和 margin-bottom */
      padding: 24px;
      border-radius: 8px;
      background: var(--theme-card);
      &:nth-of-type(3),
      &:nth-of-type(4) {
        height: 387px;
      }
      .chartContainer {
        flex: 1;
      }

      .chartTitle {
        line-height: 26px;
        font-weight: 500;
        font-size: 18px;
        color: var(--theme-text);
      }
      .compositeScoreContainer {
        display: flex;
        position: absolute;
        right: 24px;
        top: 13px;
        align-items: baseline;
        span {
          line-height: 26px;
          font-weight: 500;
          font-size: 18px;
          color: var(--theme-text-2);
        }
        .compositeScore {
          margin-right: 9px;
          line-height: 43px;
          font-weight: 500;
          font-size: 30px;
          color: var(--theme-primary);
        }
      }
    }

    .itemChartContainer:nth-child(2n) {
      margin-right: 0;
    }

    .itemChartContainer:nth-child(3),
    .itemChartContainer:nth-child(4) {
      margin-bottom: 0;
    }
  }

  .AISDistribution {
    display: flex;
    flex-direction: column;
    // width: calc(33.33% - 16px); /* 考虑到 AISDistribution 的 padding 和两个 itemChartContainer 的 margin-right */
    flex: 1;
    box-sizing: border-box;
    height: 768px;
    margin-left: 16px;
    border-radius: 8px;
    background-color: var(--theme-card);
  }
}
// .chartsContianer {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   height: 397px;
//   margin-top: 16px;
//   .itemChartContainer {
//     display: flex;
//     flex-direction: column;
//     box-sizing: border-box;
//     width: calc(33.3% - 10px);
//     height: 100%;
//     padding: 24px 20px;
//     border-radius: 12px;
//     background: var(--theme-card);
//     .chartContainer {
//       flex: 1;
//     }
//     .chartTitle {
//       line-height: 23px;
//       font-weight: 500;
//       font-size: 16px;
//       color: var(--theme-text);
//     }
//   }
// }
// .AISDistribution {
//   display: flex;
//   flex-direction: column;
//   box-sizing: border-box;
//   width: 100%;
//   height: 425px;
//   margin-top: 16px;
//   padding: 24px 20px;
//   border-radius: 12px;
//   background-color: var(--theme-card);
//   .chartTitle {
//     line-height: 23px;
//     font-weight: 500;
//     font-size: 16px;
//     color: var(--theme-text);
//   }
//   .chartContainer {
//     flex: 1;
//     width: 67%;
//   }
// }
</style>
