<template>
  <div class="intravenousThrombolysis">
    <div class="overView">
      <!-- <div class="title">CAS预估评分</div>
      <div class="predictiveScore">
        <div v-for="(item,index) in CASPredictiveScore" :key="index" :class="{itemKey:true,keyPoint:item.keyPoint}">
          <div class="label">
            <img :src="greenStar" class="star" v-if="item.keyPoint" alt="">
            <span>{{ item.label }}</span>
          </div>
          <div class="val">{{casScore[item.prop] }}</div>
        </div>
      </div> -->
      <div class="overViewLeft">
        <div class="title">
          <CommonSubTitle text="CAS数据指标"></CommonSubTitle>
        </div>

        <div class="dataIndex">
          <div v-for="(item,index) in CASDataIndex" :key="index" class="itemKey">
            <div class="itemKeyLeft">
              <div class="label">{{ item.label }}</div>
              <div class="val" v-if="!item.formatter">
                <span>{{casScore[item.prop] }}</span>
                <em>{{ item.units }}</em>
              </div>
              <div class="val" v-else>
                <span>{{ item.formatter(casScore) }}</span>
                <em class="unit">{{ item.units }}</em>
              </div>
            </div>
            <div class="itemKeyRight">
              <img :src="item.icon" alt="" />
            </div>
          </div>
        </div>
      </div>
      <!-- <div class="title">CEA预估评分</div>
      <div class="predictiveScore">
        <div v-for="(item,index) in CEAPredictiveScore" :key="index" :class="{itemKey:true,keyPoint:item.keyPoint}">
          <div class="label">
            <img :src="greenStar" class="star" v-if="item.keyPoint" alt="">
            <span>{{ item.label }}</span>
          </div>
          <div class="val">{{ceaScore[item.prop] }}</div>
        </div>
      </div> -->
      <div class="overViewRight">
        <div class="title">
          <CommonSubTitle text="CEA数据指标"></CommonSubTitle>
        </div>

        <div class="dataIndex">
          <div v-for="(item,index) in CEADataIndex" :key="index" class="itemKey">
            <div class="itemKeyLeft">
              <div class="label">{{ item.label }}</div>
              <div class="val" v-if="!item.formatter">
                <span>{{ceaScore[item.prop] }}</span>
                <em>{{ item.units }}</em>
              </div>
              <div class="val" v-else>
                <span>{{ item.formatter(ceaScore) }}</span>
                <em class="unit">{{ item.units }}</em>
              </div>
            </div>
            <div class="itemKeyRight">
              <img :src="item.icon" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chartsContianer">
      <div v-for="(item,index) in chartsOption " :key="index" class="itemChartContainer">
        <!-- <div class="chartTitle" v-if="item.type!=='customBar'">
          {{ item.title }}
        </div> -->
        <CommonSubTitle :text=" item.title " v-if="item.type!=='customBar'"></CommonSubTitle>
        <div class="chartContainer" v-if="item.type!=='customBar'">
          <common-echarts :option="item.chartConfig">
          </common-echarts>
        </div>
        <div class="compositeScoreContainer" v-if="index===0||index===1">
          <span class="compositeScore" v-if="index===0">
            {{ casScore.allScore||0 }}
          </span>
          <span class="compositeScore" v-if="index===1">
            {{ ceaScore.allScore||0 }}
          </span>
          <span>分</span>
        </div>
        <div class="chartContainer" v-if="item.type==='customBar'">
          <commonMapList :AISDistributionConfig="item.chartConfig.data" :title="item.title"></commonMapList>
        </div>
      </div>
    </div>
    <!-- <div class="AISDistribution">
      <div class="chartTitle">
        CEA病历各项评估完成统计图
      </div>
      <div class="chartContainer">
        <common-echarts :option="AISDistributionConfig">
        </common-echarts>
      </div>
    </div> -->
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import lodash from 'lodash'
import { chartsConfigs } from './configs/chartsConfigs.js'
import commonMapList from '@/components/common/commonMapList.vue'
const props = defineProps({
  ceaScore: {
    type: Object,
    default: () => {
      return {}
    }
  },
  casScore: {
    type: Object,
    default: () => {
      return {}
    }
  },
  medicalRecordNumber: {
    type: [Number, String],
    default: 0
  },
  medicalNum: {
    type: [Number, String],
    default: 0
  }
})
const CASPredictiveScore = ref([
  {
    label: 'CAS例数得分',
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
const CASDataIndex = ref([
  {
    label: 'CAS 病历例数',
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
    label: '入院 NIHSS 评分完成数',
    prop: 'enterNIHSSCompleteNum',
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
const CEAPredictiveScore = ref([
  {
    label: 'CEA例数得分',
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
  //   label: '病历完整度得分',
  //   prop: 'val'
  // },
  // {
  //   label: '技术综合分',
  //   keyPoint: true,
  //   prop: 'allScore'
  // }
])
const CEADataIndex = ref([
  {
    label: 'CEA 病历例数',
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
    label: '入院 NIHSS 评分完成数',
    prop: 'enterNIHSSCompleteNum',
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
    title: 'CAS技术综合评分',
    chartConfig: chartsConfigs.radarOptions()
  },
  {
    title: 'CEA技术综合评分',
    chartConfig: chartsConfigs.radarOptions()
  },
  {
    title: '上报病历类型占比图',
    chartConfig: lodash.cloneDeep(chartsConfigs.instrumentPanel(
      0,
      'CAS/CEA病历占比'
    ))
  },
  {
    title: 'CAS病历各项评估完成统计图',
    type: 'customBar',
    chartConfig: {
      // ...lodash.cloneDeep(chartsConfigs.pieChartOption),
      // color: ['#04A273', '#FAC858', '#FF5F5A', '#3C81CF']
    }
  },
  {
    title: 'CEA病历各项评估完成统计图',
    type: 'customBar',
    chartConfig: {

    }
  },
  {
    title: 'CAS/CEA治疗完整病历分布图',
    chartConfig: {
      ...chartsConfigs.pieChartOption()
    }
  }
])

watch(() => props.ceaScore,
  (newVal, oldVal) => {
    // 第一个图
    const CASIndicator = []
    const CASData = []
    CASPredictiveScore.value.forEach(item => {
      CASIndicator.push({ name: item.label, max: 100 })
      CASData.push(props.casScore[item.prop] || 0)
    })
    chartsOption.value[0].chartConfig = chartsConfigs.radarOptions(CASIndicator, CASData, ['50%', '60%'], '92%')

    // 第二个图
    const CEAIndicator = []
    const CEAData = []
    CEAPredictiveScore.value.forEach(item => {
      CEAIndicator.push({ name: item.label, max: 100 })
      CEAData.push(props.ceaScore[item.prop] || 0)
    })
    chartsOption.value[1].chartConfig = chartsConfigs.radarOptions(CEAIndicator, CEAData, ['50%', '60%'], '92%')

    // 第三个图
    if (props.medicalRecordNumber - 0) {
      const num = (props.medicalNum / props.medicalRecordNumber) || 0
      chartsOption.value[2].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        num,
        'CAS/CEA病历占比'
      ))
    } else {
      chartsOption.value[2].chartConfig = lodash.cloneDeep(chartsConfigs.instrumentPanel(
        0,
        'CAS/CEA病历占比'
      ))
    }
    // 第四个图
    chartsOption.value[3].chartConfig.data = [
      {
        name: '7±2 天(或出院)时mRS 评分完成数',
        value: props.casScore.mrs72CompleteNum || 0,
        totalNumber: props.casScore.healingTypeNum || 0
      },
      {
        name: '7±2 天(或出院)时NIHSS 评分完成数',
        value: props.casScore.exitNIHSSCompleteNum || 0,
        totalNumber: props.casScore.healingTypeNum || 0
      },
      {
        name: '入院 NIHSS 评分完成数',
        value: props.casScore.enterNIHSSCompleteNum || 0,
        totalNumber: props.casScore.healingTypeNum || 0
      },
      {
        name: '发病前 mRS 评分完成数',
        value: props.casScore.mrsCompleteNum || 0,
        totalNumber: props.casScore.healingTypeNum || 0
      }
    ]
    // 第五个图
    chartsOption.value[4].chartConfig.data = [
      {
        name: '7±2 天(或出院)时mRS 评分完成数',
        value: props.ceaScore.mrs72CompleteNum || 0,
        totalNumber: props.ceaScore.healingTypeNum || 0
      },
      {
        name: '7±2 天(或出院)时NIHSS 评分完成数',
        value: props.ceaScore.exitNIHSSCompleteNum || 0,
        totalNumber: props.ceaScore.healingTypeNum || 0
      },
      {
        name: '入院 NIHSS 评分完成数',
        value: props.ceaScore.enterNIHSSCompleteNum || 0,
        totalNumber: props.ceaScore.healingTypeNum || 0
      },
      {
        name: '发病前 mRS 评分完成数',
        value: props.ceaScore.mrsCompleteNum || 0,
        totalNumber: props.ceaScore.healingTypeNum || 0
      }
    ]
    // 第六个图
    const data = [
      {
        name: 'CEA完整病历',
        value: props.ceaScore.completeNum || 0
      },
      {
        name: 'CEA非完整病历',
        value: (props.ceaScore.healingTypeNum - props.ceaScore.completeNum) || 0
      },
      {
        name: 'CAS完整病历',
        value: props.casScore.completeNum || 0
      },
      {
        name: 'CAS非完整病历',
        value: (props.casScore.healingTypeNum - props.casScore.completeNum) || 0
      }
    ]
    let isData = false
    data.forEach(item => {
      if (Number(item.value)) {
        isData = true
      }
    })
    if (isData) {
      chartsOption.value[5].chartConfig = chartsConfigs.pieChartOption(data, ['#FAC858', '#FF4E4E', '#3670F8', '#04A273'])
      chartsOption.value[5].chartConfig.series.radius = ['51%', '65%']
      // 引导线单独换行处理
      chartsOption.value[5].chartConfig.series.label.formatter = '{b}：\n{c}（{d}%)'
    }
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
    .overViewLeft,
    .overViewRight {
      width: 50%;
      padding: 24px 18px 24px 16px;
      border-radius: 8px;
      background-color: var(--theme-card);
      >.title {
        position: relative;
        margin-bottom: 24px;
        padding-left: 8px;
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
        &:nth-of-type(5) {
          margin-top: 32px;
        }
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
          width: calc((100% - 32px) / 3);
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
        .itemKey:nth-child(3n) {
          margin-right: 0;
        }
        .itemKey:nth-last-child(-n+3) {
          margin-bottom: 0; /* 设置最后一排的 itemKey 的 margin-bottom 为 0 */
        }
      }
      .predictiveScore {
        margin-bottom: 28px;
      }
    }
    .overViewLeft {
      margin-right: 16px;
    }
  }
}
.chartsContianer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 829px;
  margin-top: 16px;
  .itemChartContainer {
    display: flex;
    overflow: hidden;
    position: relative;
    flex-direction: column;
    box-sizing: border-box;
    width: 595px;
    height: 448px;
    padding: 24px 20px;
    border-radius: 8px;
    background: var(--theme-card);
    &:nth-of-type(1),
    &:nth-of-type(2),
    &:nth-of-type(3) {
      height: 365px;
      margin-bottom: 16px;
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
  .itemChartContainer:nth-child(4),
  .itemChartContainer:nth-child(5) {
    padding: 0;
    // padding-bottom: 32px;
  }
}
.AISDistribution {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 425px;
  margin-top: 16px;
  padding: 24px 20px;
  border-radius: 12px;
  background-color: var(--theme-card);
  .chartTitle {
    line-height: 23px;
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
  .chartContainer {
    flex: 1;
    width: calc(50% + 10px);
  }
}
</style>
