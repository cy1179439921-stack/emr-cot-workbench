<template>
  <div class="intravenousThrombolysis">
    <div class="overView">
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
        <commonMapList :AISDistributionConfig="AISDistributionConfig" :title="'AIS病历各项评估完成统计图'"></commonMapList>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import lodash from 'lodash'
// import greenStar from '@/assets/greenStar.png'
import { chartsConfigs } from './configs/chartsConfigs.js'
import { echartsToPx } from '@/utils/utils'
import commonMapList from '@/components/common/commonMapList.vue'
// eslint-disable-next-line no-unused-vars
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
  }
})
// const overView = ref({
//   val: 9887
// })
const predictiveScore = ref([
  {
    label: 'AIS静脉溶栓得分',
    prop: 'healingTypeScore'
  },
  {
    label: 'DNT45分钟达标率得分',
    prop: 'dnt45Score'
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
    label: '溶栓病历例数',
    prop: 'healingTypeNum',
    icon: new URL('@/assets/AIS01.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: 'DNT≤45min 患者人数',
    prop: 'dnt45Num',
    icon: new URL('@/assets/AIS02.png', import.meta.url).href,
    units: '（条）'
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
    label: 'mRS 评分完成数',
    prop: 'mrsCompleteNum',
    icon: new URL('@/assets/AIS04.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: 'AIS 静脉溶栓前 NIHSS 评分完成数',
    prop: 'bnishssCompleteNum',
    icon: new URL('@/assets/AIS05.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: 'AIS 静脉溶栓结束后即刻 NIHSS 评分完成数',
    prop: 'anishssCompleteNum',
    icon: new URL('@/assets/AIS06.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: 'AIS 静脉溶栓后 24hNIHSS 评分完成数',
    prop: 'a24NishssCompleteNum',
    icon: new URL('@/assets/AIS07.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '7±2 天 NIHSS 评分完成数',
    prop: 'nishss72CompleteNum',
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
])
const chartsOption = ref([
  {
    title: '技术综合分',
    chartConfig: chartsConfigs.radarOptions()
  },
  {
    title: '上报病历类型占比图',
    chartConfig: lodash.cloneDeep(chartsConfigs.instrumentPanel(
      0,
      'AIS静脉溶栓病历占比'
    ))
  },
  {
    title: 'AIS病历DNT得分比例分布图',
    chartConfig: {
      ...chartsConfigs.pieChartOption()
      // color: ['#FF4E4E', '#3670F8']
    },
    labelLayout: true
  },
  {
    title: 'AIS静脉溶栓完整病历分布图',
    chartConfig: {
      ...chartsConfigs.pieChartOption()
      // color: ['#FAC858', '#04A273']
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
        'AIS静脉溶栓病历占比'
      ))
    } else {
      chartsOption.value[1].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        0,
        'AIS静脉溶栓病历占比'
      ))
    }

    // dnt45ltNum
    if (!(!Number(newVal.dnt45Num) && !Number(newVal.dnt45ltNum))) {
      chartsOption.value[2].chartConfig = chartsConfigs.pieChartOption([
        {
          name: '小于45min 患者人数',
          value: newVal.dnt45Num || 0
        },
        {
          name: '大于45min 患者人数',
          value: newVal.dnt45ltNum || 0
        }
      ],
      ['#FF4E4E', '#3670F8'])
    }
    if (!(!Number(newVal.completeNum) && !Number(newVal.healingTypeNum - newVal.completeNum))) {
      chartsOption.value[3].chartConfig = chartsConfigs.pieChartOption(
        [
          {
            name: 'AIS静脉溶栓完整病历',
            value: newVal.completeNum || 0
          }, {
            name: 'AIS静脉溶栓非完整病历',
            value: (newVal.healingTypeNum - newVal.completeNum) || 0
          }
        ],
        ['#FAC858', '#04A273'])
    }

    // 引导线单独换行处理
    chartsOption.value[2].chartConfig.series.label.formatter = '{b}：\n{c}（{d}%)'
    chartsOption.value[3].chartConfig.series.label.formatter = '{b}：\n{c}（{d}%)'

    // AISDistributionConfig.value.yAxis.data = [
    //   '7±2 天(或出院)时mRS 评分完成数', '7±2 天(或出院)时NIHSS 评分完成数', '7±2 天 NIHSS 评分完成数', 'AIS 静脉溶栓后 24hNIHSS 评分完成数', 'AIS 静脉溶栓结束后即刻 NIHSS 评分完成数', 'AIS 静脉溶栓前 NIHSS 评分完成数', 'mRS 评分完成数'
    // ]

    // AISDistributionConfig.value.series.data = [
    //   newVal.mrs72CompleteNum || 0,
    //   newVal.exitNIHSSCompleteNum || 0,
    //   newVal.nishss72CompleteNum || 0,
    //   newVal.a24NishssCompleteNum || 0,
    //   newVal.anishssCompleteNum || 0,
    //   newVal.bnishssCompleteNum || 0,
    //   newVal.mrsCompleteNum || 0
    // ]
    AISDistributionConfig.value = [{
      name: '7±2 天(或出院)时mRS 评分完成数',
      value: newVal.mrs72CompleteNum || 0
    }, {
      name: '7±2 天(或出院)时NIHSS 评分完成数',
      value: newVal.exitNIHSSCompleteNum || 0
    }, {
      name: '7±2 天 NIHSS 评分完成数',
      value: newVal.nishss72CompleteNum || 0
    }, {
      name: 'AIS 静脉溶栓后 24hNIHSS 评分完成数',
      value: newVal.a24NishssCompleteNum || 0
    }, {
      name: 'AIS 静脉溶栓结束后即刻 NIHSS 评分完成数',
      value: newVal.anishssCompleteNum || 0
    }, {
      name: 'AIS 静脉溶栓前 NIHSS 评分完成数',
      value: newVal.bnishssCompleteNum || 0
    }, {
      name: 'mRS 评分完成数',
      value: newVal.mrsCompleteNum || 0
    }]
    AISDistributionConfig.value.forEach(item => {
      item.totalNumber = newVal.healingTypeNum || 0
    })

    // const isAllZero = AISDistributionConfig.value.series.data.every(d => (d - 0) === 0)
    // if (isAllZero) {
    //   AISDistributionConfig.value.xAxis.minInterval = null
    // } else {
    //   AISDistributionConfig.value.xAxis.minInterval = 1
    // }
    // AISDistributionConfig.value.xAxis.axisLabel.formatter = function(value) {
    //   if (isAllZero) {
    //     return value < 1 ? value * 10 : value * 10
    //   } else {
    //     return value
    //   }
    // }
  },
  {
    immediate: true,
    deep: true
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
      line-height: 26px;
      font-weight: 500;
      font-size: 18px;
      color: var(--theme-text);
      color: #1a1a1a;
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
      width: calc(50% - 8px);
      height: 365px;
      margin: 0 16px 16px 0;
      padding: 24px;
      border-radius: 8px;
      background: var(--theme-card);
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
    flex: 1;
    box-sizing: border-box;
    height: 745px;
    margin-left: 16px;
    margin-top: 0; /* 确保上方没有额外的 margin */
    border-radius: 8px;
    background-color: var(--theme-card);
  }
}
</style>
