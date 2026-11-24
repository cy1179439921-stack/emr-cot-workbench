<template>
  <div class="predictiveAnalysis">
    <el-scrollbar class="elScrollbar" height="100%">
      <div class="itemTitle">
        <span>直报数据关键指标预估分析</span>
        <div class="monthContainer">
          <span class="demonstration">月份</span>
          <el-date-picker
            :disabled-date="disabledDate"
            value-format="YYYY-MM"
            :clearable="false"
            v-model="date"
            type="month"
            @change="handleChange"
            placeholder="请选择月份"
          />
        </div>
      </div>
      <div>
        <div class="scoreContainer">
          <div class="thisScoreContainer">
            <div class="TheFirstPart">
              <div class="title">
                <CommonSubTitle text="预估评分"></CommonSubTitle>
                <el-tooltip class="box-item" effect="dark" placement="bottom">
                  <img :src="tooltipIcon" class="tooltipIcon" alt="">
                  <template #content>
                    <div class="toolTipTxt">
                      总分值= (AIS 静脉溶栓分值)×20%+(AIS 血管内治疗分值)×23%+(CAS
                      分值)×15%+(CEA 分值)×20%+(动脉 瘤 手 术分值)×15%。 (总分 93分)
                      三级医院卒中中心 5 项技术，无技术缺陷，综合分值=总分值
                      三级医院卒中中心 5 项技术，有技术缺陷，综合分值=总分值×(100%-
                      10%*技术缺陷数)
                      注：技术缺陷指：各技术月度工作量不达三级医院卒中中心建设标准，
                      AIS 静脉溶栓≤5 例/月， AIS 血管内治疗≤2 例,CEA≤2 例,CAS≤3
                      例,动脉 瘤手术≤3 例。
                      以上技术只要有一项不达三级医院卒中中心建设标准，则缺陷数+1。
                      (二)二级医院卒中中心综合排名 总分值= (AIS
                      静脉溶栓分值)×50%+(AIS 血管内治疗分值)×20%+(脑出
                      血手术分值)×20%。 (总分93 分)
                    </div>
                  </template>
                </el-tooltip>
              </div>
              <div class="content">
                <div class="thisScore">
                  <div class="thisScoreSub">
                    <div class="score">{{ overViewData.estimationScore }}</div>
                    <!-- <div>66.666</div> -->
                    <div class="unit">(分)</div>
                  </div>
                </div>
                <div class="scoreContent">
                  <div class="titleContent">
                    <img :src="robot2" alt="" class="robot">
                    <img :src="scoreTitle" alt="" class="scoreTitle">
                  </div>
                  <div class="starContainer">
                    <div class="customRateContainer">
                      <customRate :rateValue="rateValue(overViewData.estimationScore)"/>
                    </div>
                    <div class="unitTxt">{{ overViewData.estimationScore }}</div>
                    <!-- <div class="unitTxt">98.666</div> -->
                    <div class="txt" v-text='tranfromTxt(overViewData.estimationScore)'></div>
                  </div>
                  <div class="tips">颐邦智能最新为您预估</div>
                </div>
              </div>
            </div>
            <div class="line"></div>
            <div class="TheSecondPart">
              <div class="title">
                <CommonSubTitle text="数据指标"></CommonSubTitle>
              </div>
              <div class="dataIndexContainer">
                <div v-for="(item,index) in dataIndex" :key="index" class="dataIndexItem">
                  <div class="top">
                    <div class="topIndex">{{ index+1 }}</div>
                    <div class="label">
                      <span>{{ item.label }}</span>
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        placement="bottom"
                      >
                        <img :src="tooltipIcon" class="tooltipIcon" alt="">
                        <template #content>
                          <div class="toolTipTxt">
                            {{ item.toolTipTxt }}
                          </div>
                        </template>
                      </el-tooltip>
                    </div>
                    <div class="val">
                      <span>{{ overViewData[item.prop] }}</span>
                      <span class="unit">条</span>
                    </div>
                  </div>
                  <div class="customProcess">
                    <div v-if="index!==0" class="process" :style="{width: getProcess(),height: '100%'}"></div>
                    <div v-if="index===0&&(overViewData[item.prop]==0)" class="process"></div>
                  </div>
                  <img v-if="index===0" :src="dataIndexImg" class="sign" alt="">
                </div>
              </div>
            </div>
          </div>
          <div class="scoringTrend">
            <div class="title">
              <div class="titleContainer">
                <CommonSubTitle text="预估评分趋势图"></CommonSubTitle>
              </div>
              <commonLengend text="评分趋势"></commonLengend>
            </div>

            <div class="chartsContainer">
              <common-echarts :option="scoringTrendOptions">
              </common-echarts>
            </div>

          </div>
        </div>
      </div>

      <div class="treatmentTypeTabsContainer">
        <div
          v-for="(item, index) in treatmentTypeTabs"
          :key="index"
          :class="{itemTitle:treatmentTypeTab===item.id,treatmentTypeTab:true}"
          @click="handleTreatmentType(item)">
          <div>{{ item.label }}</div>
        </div>
      </div>
      <div>
        <intravenousThrombolysis
          :medicalRecordNumber="Number(overViewData.medicalRecordNumber)"
          :overViewData ='overViewData.aisIntravenousThrombolysis'
          v-if="treatmentTypeTab===1">
        </intravenousThrombolysis>
        <endovascularTherapy
          :date="date"
          :medicalRecordNumber="Number(overViewData.medicalRecordNumber)"
          :overViewData ='overViewData.aisVascularTreatment'
          v-if="treatmentTypeTab===2">
        </endovascularTherapy>
        <CASAndCEA
          :medicalRecordNumber="Number(overViewData.medicalRecordNumber)"
          :ceaScore ='overViewData.cea'
          :casScore ='overViewData.cas'
          :medicalNum = 'overViewData.num05'
          v-if="treatmentTypeTab===3">
        </CASAndCEA>
        <aneurysmOperation
          :medicalRecordNumber="Number(overViewData.medicalRecordNumber)"
          :overViewData ='overViewData.aneurysmSurgery'
          v-if="treatmentTypeTab===4">
        </aneurysmOperation>
        <intracerebralHemorrhageOperation
          :medicalRecordNumber="Number(overViewData.medicalRecordNumber)"
          :overViewData ='overViewData.brainHemorrhageSurgery'
          v-if="treatmentTypeTab===5">
        </intracerebralHemorrhageOperation>
      </div>
    </el-scrollbar>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import intravenousThrombolysis from './intravenousThrombolysis.vue'
import endovascularTherapy from './endovascularTherapy.vue'
import CASAndCEA from './CASAndCEA.vue'
import aneurysmOperation from './aneurysmOperation.vue'
import intracerebralHemorrhageOperation from './intracerebralHemorrhageOperation.vue'
import customRate from './customRate.vue'
import { getAllScore, scoringTrend } from '@/api/jiancanAPI/api_homePage.js'
import { chartsConfigs } from './configs/chartsConfigs.js'
import lodash from 'lodash'
import tooltipIcon from '@/assets/tooltipIcon2.png'
import scoreTitle from '@/assets/scoreTitle.png'
import robot2 from '@/assets/robot2.gif'
import dataIndexImg from '@/assets/dataIndexImg.png'
import { debounce } from '@/utils/utils.js'
import { useUserStore } from '@/store/user'
const userStore = useUserStore()
// const route = useRoute()
const overViewData = ref({
  aisIntravenousThrombolysis: {}, // AIS静脉溶栓数据分数
  aisVascularTreatment: {}, // AIS血管内治疗数据分数
  aneurysmSurgery: {}, // 动脉瘤手术分数
  brainHemorrhageSurgery: {}, // 脑出血分数
  cea: {},
  cas: {}
})
const getNowMonth = () => {
  const date = new Date()
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  month = month > 9 ? month : '0' + month
  const nowMonth = year + '-' + month
  return nowMonth
}
const getPreMonth = () => {
  const arr = getNowMonth().split('-')
  const year = arr[0] // 获取当前日期的年份
  const month = arr[1] // 获取当前日期的月份

  let year2 = year
  let month2 = parseInt(month) - 1
  if (month2 === 0) {
    // 1月的上一月是前一年的12月
    year2 = parseInt(year2) - 1
    month2 = 12
  }

  if (month2 < 10) {
    // 10月之前都需要补0
    month2 = '0' + month2
  }
  const preMonth = year2 + '-' + month2
  return preMonth
}

const date = ref(getPreMonth())

// eslint-disable-next-line no-unused-vars
const dataIndex = ref([
  {
    label: '病历数',
    toolTipTxt: '系统内创建的病历数量',
    prop: 'medicalRecordNumber'
  },
  {
    label: '数据完整病历数',
    toolTipTxt: '系统内符合所有必填项完成填写的病历数量',
    prop: 'completeMedicalRecordNumber'
  }
])
const getProcess = () => {
  if (Number(overViewData.value.medicalRecordNumber)) {
    return ((overViewData.value.completeMedicalRecordNumber / overViewData.value.medicalRecordNumber) * 100).toFixed(0) + '%'
  } else {
    return '0'
  }
}
const treatmentTypeTab = ref(1)
const treatmentTypeTabs = ref([
  {
    label: 'AIS静脉溶栓数据技术分析',
    id: 1
  },
  {
    label: 'AIS介入再通数据技术分析',
    id: 2
  },
  {
    label: 'CAS/CEA数据技术分析',
    id: 3
  },
  {
    label: '颅内动脉瘤手术数据技术分析',
    id: 4
  },
  {
    label: '脑出血手术数据技术分析',
    id: 5
  }
])

const handleTreatmentType = (tab) => {
  treatmentTypeTab.value = tab.id
  // router.push({
  //   path: '/hospitalHomePage',
  //   query: {
  //     index: 2,
  //     treatmentTypeTab: treatmentTypeTab.value
  //   }
  // })
}

const handleChange = (val) => {
  getAllScoreFn()
}
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}
const getAllScoreFn = () => {
  getAllScore({
    month: date.value
  }).then(res => {
    overViewData.value = lodash.get(res, 'data') || {}
  })
}
getAllScoreFn()
const scoringTrendOptions = ref(chartsConfigs.lineChartBasicOption(
  {
    yAxis: {
      min: 0,
      max: 100
    }
  }
))
const scoringTrendFn = () => {
  scoringTrend().then(res => {
    if (res.code === 10000) {
      scoringTrendOptions.value = chartsConfigs.lineChartBasicOption({
        xAxisData: res.data?.x || [],
        yAxisData: res.data?.y || [],
        name: '评分趋势',
        yAxis: {
          min: 0,
          max: 100
        }
      })
    }
  })
}
scoringTrendFn()
const tranfromTxt = (num) => {
  if (Number(num) >= 80) {
    return '“优秀”'
  } else if (Number(num) > 60 && Number(num) < 80) {
    return '“良好”'
  } else {
    return '“一般”'
  }
}
const rateValue = (num) => {
  if (num) {
    return ((num - 0) / 100 * 5).toFixed(1) || 0
  } else {
    return 0
  }
}

let debouncedResize = null

onMounted(() => {
  // treatmentTypeTab.value = (route.query.treatmentTypeTab - 0) || 1
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
</script>
<style lang="scss" scoped>
.itemTitle {
  position: relative;
  height: 26px;
  margin-top: 24px;
  margin-bottom: 24px;
  padding-left: 12px;
  line-height: 22px;
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
  &:nth-of-type(1) {
    margin-top: 0;
  }
  span {
    position: relative;
    z-index: 20;
  }
  &::before {
    position: absolute;
    left: 0;
    bottom: -5px;
    z-index: 1;
    width: 100px;
    height: 16px;
    border-radius: 8px;
    background:
      linear-gradient(
        90deg,
        rgba(54, 112, 248, 0.5) 0%,
        rgba(60, 129, 207, 0) 100%
      );
    opacity: 1;
    content: '';
  }
}
.monthContainer {
  position: absolute;
  right: 0;
  top: 0;
  line-height: 14px;
  font-weight: 500;
  font-size: 12px;
  color: var(--theme-text);
  .demonstration {
    margin-right: 12px;
  }
  :deep(.el-input__wrapper) {
    // padding-top: 5px;
    // padding-bottom: 5px;
    box-shadow: none;
  }
}
.predictiveAnalysis {
  overflow: auto;
  box-sizing: border-box;
  height: 100%;
  //padding: 20px;
  // padding-top: 4px;
  .elScrollbar {
    box-sizing: border-box;
    padding: 16px;
    padding-top: 0;
  }
}
.toolTipTxt {
  max-width: 486px;
  line-height: 21px;
  font-weight: 400;
  font-size: 14px;
  color: #fff;
}
.treatmentTypeTabsContainer {
  display: flex;
  align-items: center;
  height: 26px;
  margin-top: 32px;
  margin-bottom: 24px;
  line-height: 26px;

  .treatmentTypeTab {
    margin-right: 40px;
    cursor: pointer;
    line-height: 22px;
    font-size: 16px;
    color: var(--theme-text-2);
    &.itemTitle {
      margin-top: 0;
      margin-bottom: 0;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }
  }
}
:deep(.tooltipIcon) {
  width: 14px;
  height: auto;
  margin-left: 5px;
  cursor: pointer;
}

.scoreContainer {
  display: flex;
  align-items: center;
  .thisScoreContainer {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 1206px;
    height: 285px;
    margin-right: 16px;
    padding: 24px;
    border-radius: 8px;
    background: var(--theme-card);
    .TheFirstPart {
      display: flex;
      flex-direction: column;
      // width: 702px;
      height: 100%;
    }

    .title {
      display: flex;
      align-items: center;
      line-height: 26px;
      text-align: left;
      font-weight: 500;
      font-size: 18px;
      color: #1a1a1a;
    }
    .content {
      display: flex;
      position: relative;
      // top: -12px;
      margin-top: 3px;
      // align-items: center;
      .scoreContent {
        display: flex;
        flex-direction: column;
        margin-top: 42px;
        .titleContent {
          display: flex;
          align-items: center;
          .robot {
            width: 43px;
            height: 49px;
            margin-right: 6px;
          }
          .scoreTitle {
            width: 205px;
            height: auto;
          }
        }
        .starContainer {
          display: flex;
          align-items: center;
          height: 58px;
          .customRateContainer {
            height: 36px;
            margin-top: 4px;
            // overflow: hidden;
            // margin-top: 10px;
            // padding-top: 11px;
            // padding-bottom: 11px;
          }
          .unitTxt {
            margin-left: 15px;
            margin-right: 7px;
            // margin-top: -8px;
            line-height: 50px;
            text-align: left;
            font-family: D-DIN;
            font-weight: 500;
            font-size: 46px;
            color: #1a1a1a;
          }
          .txt {
            width: 72px;
            line-height: 26px;
            text-align: left;
            text-align: center;
            font-size: 18px;
            color: var(--theme-text-2);
          }
        }
        .tips {
          margin-top: 9px;
          line-height: 20px;
          font-weight: 400;
          font-size: 14px;
          color: var(--theme-text-2);
        }
      }
    }
    .thisScore {
      display: flex;
      justify-content: center;
      // align-items: center;
      width: 207px;
      height: 207px;
      margin-left: 34px;
      margin-right: 57px;
      background: url('@/assets/scoreBg.png') no-repeat;
      background-size: 100% 100%;
      // line-height: 46px;
      text-align: left;
      text-align: center;
      font-family: D-DIN;
      font-weight: 500;
      font-size: 42px;
      color: #fff;
      .thisScoreSub {
        position: relative;
        margin-top: 70px;
        .score {
          height: 46px;
        }
        .unit {
          font-weight: 500;
          font-size: 19px;
        }
      }
    }

    .line {
      width: 0;
      height: 207px;
      margin: 0 60px 0 37px;
      border-left: 1px solid #e0e6f1;
    }
    .TheSecondPart {
      flex: 1;
      height: 100%;
      .title {
        // margin-bottom: 19px;
        margin-bottom: 25px;
        line-height: 26px;
        font-weight: 500;
        font-size: 18px;
        color: #1a1a1a;
      }
      .dataIndexContainer {
        display: flex;
        flex-direction: column;
        padding-right: 31px;
        .dataIndexItem {
          display: flex;
          flex-direction: column;
          &:nth-of-type(1) {
            .customProcess {
              // width: 328px;
              height: 16px;
              background: var(--theme-primary);
              .process {
                height: 100%;
                background: rgba(54, 112, 248, 0.05);
              }
            }
            .sign {
              width: 89px;
              height: 39px;
              margin: 15px auto 12px;
            }
          }
          &:nth-of-type(2) {
            .customProcess {
              // width: 328px;
              height: 16px;
              background: var(--theme-fill);
              .process {
                background: #04a273;
              }
            }
          }
          .top {
            display: flex;
            align-items: center;
            .topIndex {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 20px;
              height: 20px;
              margin-right: 12px;
              border: 1px solid rgba(54, 112, 248, 0.05);
              border-radius: 4px;
              background: rgba(54, 112, 248, 0.05);
              line-height: 20px;
              font-weight: 500;
              font-size: 14px;
              color: var(--theme-text);
            }
            .label {
              display: flex;
              align-items: center;
              flex: 1;
              margin-right: 5px;
              line-height: 22px;
              font-size: 16px;
              color: var(--theme-text);
            }
            .val {
              line-height: 30px;
              font-family: DIN Alternate;
              font-weight: 500;
              font-size: 26px;
              color: var(--theme-text);
              .unit {
                font-size: 18px;
              }
            }
          }
          .customProcess {
            margin-top: 8px;
          }
        }
      }
    }
  }
  .scoringTrend {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    height: 285px;
    padding: 24px;
    border-radius: 8px;
    background-color: var(--theme-card);

    .title {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      line-height: 26px;
      text-align: left;
      font-weight: 500;
      font-size: 18px;
      color: #1a1a1a;
      .titleContainer {
        flex: 1;
      }
      .CommonSubTitle {
        flex: 1;
      }
      .legendContainer {
        width: auto;
      }
    }
    .chartsContainer {
      flex: 1;
    }
  }
}
</style>
