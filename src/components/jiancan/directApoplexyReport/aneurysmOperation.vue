<template>
  <div class="intravenousThrombolysis">
    <div class="overView">
      <div class="overViewLeft">
        <div class="title">
          <CommonSubTitle text="数据指标"></CommonSubTitle>
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
      <div class="overViewRight">
        <div class="title">
          <CommonSubTitle text="技术综合评分"></CommonSubTitle>
        </div>
        <div class="compositeScoreContainer">
          <span class="compositeScore">
            {{ overViewData.allScore||0 }}
          </span>
          <span>分</span>
        </div>
        <div class="chartContainer">
          <common-echarts :option="compositeScoreOptions"></common-echarts>
        </div>
      </div>
    </div>
    <div class="chartsContianer">
      <div v-for="(item,index) in chartsOption " :key="index" class="itemChartContainer">
        <div class="chartTitle" v-if="item.type!=='customBar'">
          <CommonSubTitle :text="item.title"></CommonSubTitle>
        </div>
        <div class="chartContainer" v-if="item.type!=='customBar'">
          <common-echarts :option="item.chartConfig">
          </common-echarts>
        </div>
        <div class="chartContainer" v-if="item.type==='customBar'">
          <commonMapList :AISDistributionConfig="item.chartConfig.data" :title="item.title"></commonMapList>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import lodash from 'lodash'
import { chartsConfigs } from './configs/chartsConfigs.js'
// import { echartsToPx } from '@/utils/utils'
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
  }
})
const predictiveScore = ref([
  {
    label: '颅内动脉瘤手术例数得分',
    prop: 'healingTypeScore'
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
    label: '颅内动脉瘤手术病历例数',
    prop: 'healingTypeNum',
    icon: new URL('@/assets/AIS11.png', import.meta.url).href,
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
    label: '发病前 mRS 评分完成数',
    prop: 'mrsCompleteNum',
    icon: new URL('@/assets/AIS04.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '入院 GCS 评分完成数',
    prop: 'enterGCSCompleteNum',
    icon: new URL('@/assets/AIS13.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: 'Hunt-Hess 分级级别完成数',
    prop: 'huntHessCompleteNum',
    icon: new URL('@/assets/AIS08.png', import.meta.url).href,
    units: '（条）'
  },
  {
    label: '7±2 天(或出院)时GCS 评分完成数',
    prop: 'exitGCSCompleteNum',
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
    title: '上报病历类型占比图',
    chartConfig: lodash.cloneDeep(chartsConfigs.instrumentPanel(
      0,
      '颅内动脉瘤手术病历占比'
    ))
  },
  {
    title: '颅内动脉瘤手术完整病历分布图',
    chartConfig: {
      ...chartsConfigs.pieChartOption()
    }
  },
  {
    title: '颅内动脉瘤手术病历各项评估完成统计图',
    type: 'customBar',
    chartConfig: {}
    // chartConfig: {
    //   ...lodash.cloneDeep(chartsConfigs.horizontalBarChartBasicOption),
    //   series: {
    //     name: '病例数',
    //     type: 'bar',
    //     barWidth: echartsToPx(24),
    //     data: [],
    //     itemStyle: {
    //       color: '#6F9AD8',
    //       borderRadius: [0, echartsToPx(12), echartsToPx(12), 0]
    //     },
    //     label: {
    //       show: true,
    //       position: 'right',
    //       fontSize: echartsToPx(12),
    //       // fontFamily: 'D-DIN',
    //       color: '#333333'
    //     }
    //   }
    // }
  }
])

const compositeScoreOptions = ref(chartsConfigs.radarOptions())
watch(() => props.overViewData,
  (newVal, oldVal) => {
    const indicator = []
    const data = []
    predictiveScore.value.forEach(item => {
      indicator.push({ name: item.label, max: 100 })
      data.push(newVal[item.prop] || 0)
    })
    compositeScoreOptions.value = chartsConfigs.radarOptions(indicator, data, ['50%', '60%'], '92%')
    if (props.medicalRecordNumber - 0) {
      chartsOption.value[0].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        ((newVal.healingTypeNum - 0) / (props.medicalRecordNumber - 0)).toFixed(2),
        '颅内动脉瘤手术病历占比',
        [0, '-75%'],
        '79%'
      ))
    } else {
      chartsOption.value[0].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        0,
        '颅内动脉瘤手术病历占比',
        [0, '-75%'],
        '79%'
      ))
    }
    chartsOption.value[1].chartConfig.series.radius = ['53%', '67%']
    if (Number(newVal.completeNum) || Number(newVal.healingTypeNum - newVal.completeNum)) {
      chartsOption.value[1].chartConfig = chartsConfigs.pieChartOption([
        {
          name: '颅内动脉瘤手术完整病历数',
          value: newVal.completeNum || 0
        }, {
          name: '颅内动脉瘤手术非完整病历数',
          value: (newVal.healingTypeNum - newVal.completeNum) || 0
        }
      ])
      // 引导线单独换行处理
      chartsOption.value[1].chartConfig.series.label.formatter = '{b}：\n{c}（{d}%)'
    }

    chartsOption.value[2].chartConfig.data = [{
      name: '发病前 mRS 评分完成数',
      value: newVal.mrsCompleteNum || 0,
      totalNumber: newVal.healingTypeNum || 0
    }, {
      name: '入院 GCS 评分完成数',
      value: newVal.enterGCSCompleteNum || 0,
      totalNumber: newVal.healingTypeNum || 0
    }, {
      name: 'Hunt-Hess 分级级别完成数',
      value: newVal.huntHessCompleteNum || 0,
      totalNumber: newVal.healingTypeNum || 0
    }, {
      name: '7±2 天(或出院)时GCS 评分完成数',
      value: newVal.exitGCSCompleteNum || 0,
      totalNumber: newVal.healingTypeNum || 0
    }, {
      name: '7±2 天(或出院)时mRS 评分完成数',
      value: newVal.mrs72CompleteNum || 0,
      totalNumber: newVal.healingTypeNum || 0
    }]
  },
  {
    immediate: true
  }
)
</script>
<style lang="scss" scoped>
.intravenousThrombolysis {
  .overView {
    display: flex;
    width: 100%;
    // padding: 24px 16px 8px 16px;

    .overViewLeft,
    .overViewRight {
      border-radius: 8px;
      .title {
        position: relative;
        margin-bottom: 24px;
        padding-left: 8px;
        line-height: 26px;
        font-weight: 500;
        font-size: 18px;
        color: var(--theme-text);
      }
    }
    .overViewRight {
      display: flex;
      position: relative;
      flex-direction: column;
      box-sizing: border-box;
      width: 594px;
      height: 334px;
      padding: 24px;
      border-radius: 8px;
      // flex: 1;
      background: var(--theme-card);
      .title {
        margin-bottom: 0;
      }
      .chartContainer {
        flex: 1;
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
    .overViewLeft {
      box-sizing: border-box;
      width: 1206px;
      margin-right: 16px;
      padding: 24px 16px;
      background: var(--theme-card);
      .dataIndex {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        .itemKey {
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-sizing: border-box;
          width: calc((100% - 48px) / 4);
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
        .itemKey:nth-child(4n) {
          margin-right: 0;
        }
        .itemKey:nth-of-type(n+5) {
          margin-bottom: 0; /* 设置最后一排的 itemKey 的 margin-bottom 为 0 */
        }
      }
    }

    .overViewRight {
      box-sizing: border-box;
      width: 594px;
      height: 334px;
      padding: 24px;
      background: var(--theme-card);
    }
  }
  .chartsContianer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 481px;
    margin-top: 16px;
    .itemChartContainer {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 595px;
      height: 100%;
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
    }
    .itemChartContainer:nth-child(1),
    .itemChartContainer:nth-child(2) {
      margin-right: 16px;
    }
    .itemChartContainer:nth-child(3) {
      margin-right: 0; /* 第三个元素的 margin-right 为 0 */
      padding: 0;
      // padding-bottom: 32px;
    }
  }
}
</style>
