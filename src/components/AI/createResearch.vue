<template>
  <div class="createResearch">
    <div class="titleHeader" v-if="!isInit">
      创建研究队列
    </div>
    <div class="stepBar">
      <template v-for="(item,index) in steps" :key="index">
        <div :class="{stepItem:true,active:step===item.id}">
          <div v-show="!doneList.includes(item.id)" class="stepItemNum">{{ index + 1 }}</div>
          <div v-show="doneList.includes(item.id)" class="doneIcon">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div :class="{stepItemName:true,doneName:doneList.includes(item.id)}">
            {{ item.name }}
          </div>
        </div>
        <div class="line" v-if="index < steps.length - 1"></div>
      </template>
    </div>
    <div class="researchTopic">
      <div class="aiLterContainer" v-if="step===1&&isInit" >
        <img :src="aiLogo" alt="" class="logo">
        <div class="main">
          <el-input
            v-model="searchText"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 12 }"
            resize="none"
            class="search"
            placeholder="请填写多个关键词，并用分号隔开"/>
          <div class="opContainer">
            <div class="deepThinking">深度思考</div>
            <el-button class="send-button" @click="handleNext" :disabled="!searchText?.trim()">
              <i class="iconfont icon-fasong"></i>
            </el-button>
            <!-- <img class="sendIcon" src="@/assets/AISendIcon.png" alt="" @click="handleNext"> -->
          </div>
        </div>
        <div class="searchContainer">
          <mySearch
            ref="mySearchRef"
            :search="search"
            :options="options"
            :needDel="false"
            @handleSearch="handleSub"
            :value="searchValue"
          >
          </mySearch>
        </div>
      </div>
      <div v-if="step===1&&!isInit" class="stepContainer oneTwo">
        <div class="title">
          <i class="iconfont icon-zhexiantu-01"></i>
          数据管理与分析结果
        </div>
        <div class="mainContent">
          <el-scrollbar>
            <div class="subTitle">数据概览</div>
            <div class="numberContainer">
              <div class="card" v-for="(item, index) in cardInfo" :key="index">
                <div class="content">
                  <div class="card-title">{{item.title}}</div>
                  <div class="card-count">{{addThousandSeparator(overviewData[item.prop]||0)}}</div>
                </div>
                <img class="card-icon" :src="item.icon" alt="">
              </div>
            </div>
            <div class="subTitle">数据分布</div>
            <div class="chartsContainer">
              <div class="chartItem">
                <div class="chartTitle">性别</div>
                <div class="chartsContainer"></div>
                <common-echarts ref="echarsDom" :option="options1"></common-echarts>
              </div>
              <div class="chartItem">
                <div class="chartTitle">年龄</div>
                <div class="chartsContainer">
                  <common-echarts ref="echarsDom" :option="options2"></common-echarts>
                </div>
              </div>
            </div>
            <div class="subTitle">查询结果</div>
            <div class="tableContaienr">
              <myTable
                ref="myTableRef"
                class="myTable"
                :tableData="common.tableData"
                :column="common.column"
                handlerName="操作"
                :handlerWidth="172"
                :showToolTip="common.showToolTip"
                :pagination="true"
                :pageResult="pageResult"
              >
                <template #option="scope">
                  <div class="oprContainer">
                    <el-button type="primary" link @click="handleFn(scope.row)" >患者主页</el-button>
                    <el-button type="primary" link @click="handleFn(scope.row)">当前就诊</el-button>
                  </div>
                </template>
                <template #medicalRecordTypeList="scope">
                  <template v-if="scope.row.medicalRecordType == 1">
                    <i class="iconfont icon-zhuyuan1 beHospitalized"></i
                    ><span>住院</span>
                  </template>
                  <template v-if="scope.row.medicalRecordType == 2">
                    <i class="iconfont icon-menjizhen outpatientService"></i>
                    <span>门急诊</span>
                  </template>
                  <template v-if="scope.row.medicalRecordType == 3">
                    <i class="iconfont icon-tijian outpatientService"></i>
                    <span>体检</span>
                  </template>
                </template>
                <template #diseaseTypeIdList="scope">
                  <template v-if="scope.row.diseaseTypeNames">
                    <CommonTooltipWithSlotContent className="diseaseTooltip" >
                      <div class="singleLineTooltipText">
                        <span v-for="(item, index) in scope.row.diseaseTypeNames.split('；')" :key="'disease' + index" class="itemTag">{{ item }}</span>
                      </div>
                      <template #content>
                        <div class="tooltip-custom">
                          <div class="item" v-for="(item, index) in scope.row.diseaseTypeNames.split('；')" :key="'tooltip' + index">
                            {{ item }}
                          </div>
                        </div>
                      </template>
                    </CommonTooltipWithSlotContent>
                  </template>
                  <div v-else>-</div>
                </template>
              </myTable>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div v-if="step===2" class="stepContainer two">
        <div class="AIIndexContainer">
          <div class="title">
            <img src="@/assets/AIIndexIcon.png" alt="">
            <span>
              AI推荐指标
            </span>
          </div>
          <div class="indexContent">
            <el-scrollbar>
              <div v-for="(item,index) in indexContentList" :key="index" class="indexItem">
                <div class="indexTitle">{{ item.title }}</div>
                <div class="indexs">
                  <div class="indexsItem" v-for="(v,vIndex) in item.indexs" :key="vIndex">
                    {{ v }}
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </div>
        <div class="indexManageContainer">
          <!-- <el-button type="primary" class="nextBtn" @click="handleNext">确认指标进行下一步任务提取</el-button> -->
          <div class="title">
            <i class="iconfont icon-zhexiantu-01"></i>
            <span>指标管理与分析</span>
          </div>
          <div class="indexNumber">
            <img src="@/assets/indexNumber.png" alt="">
            <span class="title">指标统计：</span>
            <span>指标总数：189</span>
          </div>
          <div class="tableContainer">
            <div class="title">
              <div class="titleText">指标列表</div>
              <el-button type="primary" class="editBtn">
                <i class="iconfont icon-bianji3"></i>
                编辑</el-button>
            </div>
            <myTable
              ref="myTableRef"
              class="myTable"
              :tableData="common2.tableData"
              :column="common2.column"
              handlerName="操作"
              :handlerWidth="128"
              :showToolTip="common2.showToolTip"
              :pagination="true"
              :pageResult="pageResult2"
            >
              <template #option="scope">
                <div class="oprContainer">
                  <el-button type="primary" link @click="editRow(scope.row)" >编辑</el-button>
                  <el-button link class="redBtn" @click="deleteRow(scope.row)" >删除</el-button>
                </div>
              </template>
            </myTable>
          </div>
        </div>
      </div>
      <div v-if="step===3" class="stepContainer three">
        <div class="resultContainer">
          <div class="title">
            <img src="@/assets/tiqu.png" alt="">
            <div>研究指标提取</div>
          </div>
          <div >
            <div class="resultDom">
              <img src="@/assets/result1.png" alt="">
              <div class="resTilte">病历数：</div>
              <div>患者人数146，占全部患者的13%，就诊数146，占全部就诊的8%</div>
            </div>
            <div class="resultDom">
              <img src="@/assets/result2.png" alt="">
              <div class="resTilte">指标数：</div>
              <div>189个指标</div>
            </div>
            <div class="resultDom">
              <img src="@/assets/result3.png" alt="">
              <div class="resTilte">任务：</div>
              <div class="process">
                <span>更新进度：</span>
                <el-progress class="processDom" :show-text="false" :percentage="percentage" ></el-progress>
                <span>{{currentNumber+'/27594'}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="resultContainer">
          <!-- <el-button class="nextBtn" type="primary" @click="handleEmits">进入统计分析</el-button> -->
          <div class="title">
            <img src="@/assets/tiqu.png" alt="">
            <div>提取结果</div>
          </div>
          <div class="tableContainer">
            <myTable
              ref="myTableRef"
              class="myTable"
              :tableData="common3.tableData"
              :column="common3.column"
              handlerName=""
              :option="false"
              :isSlotOption="false"
              :handlerWidth="0"
              :showToolTip="common3.showToolTip"
              :pagination="true"
              :pageResult="pageResult3"
            >
            </myTable>
          </div>
        </div>
      </div>

    </div>
    <div class="bottomDom" v-if="!isInit">
      <div class="operBtn" @click="handleNext">
        <i class="iconfont icon-yijianbianji" v-if="!btnLoading"></i>
        <Loading :size="16" color="#fff" v-else/>
        <span v-if="step===1">确定数据进行指标准备</span>
        <span v-if="step===2">确认指标进行下一步任务提取</span>
        <span v-if="step===3">进入统计分析</span>
      </div>

    </div>
  </div>

</template>
<script setup>
// eslint-disable-next-line no-unused-vars
import { ref, onMounted, reactive } from 'vue'
import aiLogo from '@/assets/createResearchLogo.png'
import lodash from 'lodash'
import { getDiagnosisCodeList } from '@/api/jiancanAPI/api_home'
import { addThousandSeparator } from '@/utils/utils.js'
import { homePageConfigs } from '@/components/configs/chartsConfig.js'
// eslint-disable-next-line no-unused-vars
import { data1, indexList, indexListTableData, resultData, payTypeList, ethnicGroup, enterHospitalList } from './data.js'
import { useTree } from '@/hooks/treeData.js'
import { codomainTypeOptions } from '@/utils/dictionaries.js'
const emits = defineEmits(['next'])
const handleEmits = () => {
  emits('next')
}
const props = defineProps({
  defaultData: {
    type: Object,
    default: () => ({})
  }
})
const { initTreeData } = useTree(true)
// const emits = defineEmits(['next'])
const step = ref(1)
const steps = ref([
  {
    name: '临床回顾性样本数据准备：查询病例数据',
    id: 1
  },
  {
    name: '并行研究指标准备',
    id: 2
  },
  {
    name: '创建研究专病队列：研究指标提取',
    id: 3
  }
])
const searchText = ref(props.defaultData)

const doneList = ref([])
const currentNumber = ref(0)
const percentage = ref(0)
const btnLoading = ref(false)
const handleNext = () => {
  btnLoading.value = true
  setTimeout(() => {
    btnLoading.value = false

    if (isInit.value) {
      isInit.value = false
      setTimeout(() => {
        common.tableData = data1
        pageResult.value.total = 589
      }, 2000)
    } else {
      doneList.value.push(step.value)
      step.value += 1
      if (step.value === 2) {
        setTimeout(() => {
          common2.tableData = indexListTableData
          pageResult2.value.total = 189
        }, 1000)
      }
      if (step.value === 3) {
        const timer = setInterval(() => {
          currentNumber.value += 800
          if (currentNumber.value >= 27594) {
            clearInterval(timer)
            currentNumber.value = 27594
            common3.tableData = resultData
            pageResult3.value.total = 27594
          }
          percentage.value = ((currentNumber.value / 27594) * 100).toFixed(0) - 0
        }, 80)
      }
      if (step.value === 4) {
        handleEmits()
      }
    }
  }, 3000)
}
const isInit = ref(true)
const options = ref({
  formProps: {
    'label-position': 'top',
    'label-width': '70px'
  }
})
const relationEnumValues = [
  {
    name: '大于',
    id: 1,
    value: 'gt'
  },
  {
    name: '等于',
    id: 2,
    value: 'eq'
  },
  {
    name: '小于',
    id: 3,
    value: 'lt'
  },
  {
    name: '介于',
    id: 4,
    value: 'between'
  }
]
const sexEnumValues = [
  {
    name: '男',
    id: 1
  },
  {
    name: '女',
    id: 2
  },
  {
    name: '未知',
    id: 0
  }
]
const searchValue = ref({
  hospitalId: [1],
  diseaseType: [1, 2],
  medicalType: [1, 2]
})
const diagnosisList = ref([])
const search = ref([
  {
    id: '0-1',
    type: 'mulSelect',
    label: '医院',
    maxlength: 19,
    value: 'hospitalId',
    EnumValues: [
      {
        name: '千佛山医院',
        id: 1
      }
    ]
  },
  {
    id: '0-1',
    type: 'mulSelect',
    label: '病种',
    maxlength: 19,
    value: 'diseaseType',
    EnumValues: [
      {
        name: '脑出血',
        id: 1
      },
      {
        name: '脑梗死',
        id: 2
      }
    ]
  },
  {
    id: '0-1',
    type: 'mulSelect',
    label: '就诊类型',
    maxlength: 19,
    value: 'medicalType',
    EnumValues: [
      {
        name: '门(急)诊',
        id: 1
      },
      {
        name: '住院',
        id: 2
      }
    ]
  },

  {
    label: '性别',
    id: '2-1',
    soleID: '2-1',
    type: 'select',
    value: 'sex',
    width: 60,
    EnumValues: sexEnumValues
  },
  {
    label: '年龄',
    id: '2-1-2',
    soleID: '2-1-2',
    width: 60,
    isFixed: true,
    type: 'relationSelect',
    codomainType: 1,
    value: 'age', // 大于 等于 小于时候的值
    rangeValue: 'ageRange', // 介于 关系时候的值
    relationValue: 'relationValue', // 关系值 大于 等于 小于 介于
    EnumValues: relationEnumValues,
    precision: 0,
    min: 1,
    max: 120,
    valueRange: [1, 120],
    formatter: (row) => {
      return String(row?.age) || '-'
    }
  },
  {
    label: '入院时间',
    id: '2-6-1',
    soleID: '2-6-1',
    type: 'datetimerange',
    value: 'enterHospitalTime',
    minWidth: 120,
    codomainType: 5
  },
  {
    label: '出院时间',
    id: '2-6-2',
    soleID: '2-6-2',
    type: 'datetimerange',
    value: 'exitHospitalTime',
    codomainType: 5,
    minWidth: 120
  },
  {
    label: '主要诊断-诊断名称',
    id: '2-3-1',
    soleID: '2-3-1',
    type: 'select-v2',
    codomainType: 4,
    minWidth: 140,
    EnumValues: diagnosisList,
    value: 'mainDiagnosisList',
    formatter: (row) => {
      return row?.mainDiagnosis || '-'
    }
  }
])
const mySearchRefValue = ref(null)
const handleSub = () => {
  console.log(mySearchRefValue.value)
}
const overviewData = ref({
  patientNum: 146,
  recordNum: 146,
  hospitalNum: 146,
  outpatientNum: 0
})
const cardInfo = ref([
  {
    title: '患者数量',
    prop: 'patientNum',
    icon: new URL('@/assets/AIS02.png', import.meta.url).href
  },
  {
    title: '就诊数量',
    prop: 'recordNum',
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
  }
])
const options1 = ref(homePageConfigs.pieChartOption([{
  name: '男',
  value: 47
},
{
  name: '女',
  value: 99
}], ['#FAC858', '#02AE7B']))
const options2 = ref(homePageConfigs.pieChartOption([{
  name: '50-60',
  value: 47
},
{
  name: '60-70',
  value: 30
},
{
  name: '70-80',
  value: 69
}], ['#9EB5EB', '#02AE7B', '#FF4E4E', '#FAC858', '#6694FF']))

const common = reactive({
  showToolTip: false,
  text: '',
  tableData: [],
  column: [
    { label: '就诊ID', value: 'id', fixed: 'left', minWidth: 140 },
    { label: '患者ID', value: 'patientId', fixed: 'left', minWidth: 140 }
  ]
})
common.column = common.column.concat(
  initTreeData[0].children[0].children
)

const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
const handleFn = (row) => {
  console.log('row', row)
}
const indexContentList = ref(indexList)
// 获取所在位置名称
const getIndexPassName = (row) => {
  if (!row.indexPass) return ''
  const indexPassArray = row.indexPass.split(',').map(item => item.trim())
  // 使用 map 对数组中的每个项进行映射，得到对应的标签
  const mappedLabels = indexPassArray.map(item => {
    switch (item) {
      case 'basic_information':
        return '病案首页'
      case 'enter_record':
        return '入院记录'
      case 'exit_record':
        return '出院记录'
      case 'inspections':
        return '实验室检查'
      case 'image_reports':
        return '影像检查'
      case 'pathologies':
        return '病理'
      case 'operations':
        return '手术记录'
      case 'advices':
        return '医嘱'
      case 'course_record':
        return '病程记录'
      default:
        return '' // 未匹配到时返回空字符串
    }
  })
  // 将映射后的标签数组用逗号连接并返回
  return mappedLabels.join(', ')
}
const getDataTypeName = (type) => codomainTypeOptions.value.find(item => item.value === type)?.label || ''
const common2 = reactive({
  showToolTip: false,
  text: '',
  tableData: [],
  column: [
    { label: '指标名称', value: 'name', minWidth: 140 },
    { label: '英文名称', value: 'nameEn', minWidth: 140 },
    {
      label: '医学含义',
      value: 'medicalMean',
      minWidth: 140,
      formatter: (row) => {
        return row.medicalMean || '-'
      }
    },
    { label: '指标索引', value: 'indexTypeName', minWidth: 140 },
    {
      label: '所在位置',
      value: 'indexPass',
      minWidth: 140,
      formatter: (row) => {
        return getIndexPassName(row)
      }
    },
    {
      label: '数据类型',
      value: 'codomainType',
      minWidth: 140,
      formatter: (row) => {
        return getDataTypeName(row.codomainType)
      }
    },
    {
      label: '值域/枚举',
      value: 'enumOptionsString',
      minWidth: 140,
      formatter: (row) => {
        return row.enumOptionsString || '-'
      }
    }
  ]
})
const pageResult2 = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
  layout: 'total, sizes, prev, pager, next'
})
const common3 = reactive({
  showToolTip: false,
  text: '',
  tableData: [],
  column: []
})
const tableHeader = {
  性别: '1',
  年龄: '58',
  民族: '01',
  出生日期: '1966-10-22',
  主要医疗付费方式: '02',
  住院号: '0001188673',
  入院途径: '2',
  发病至门急诊时间: '',
  住院日期: '2025-04-07 10:39',
  出院日期: '2025-05-06',
  住院天数: '29',
  离院方式: '1',
  住院总费用: '263113.65',
  主要诊断名称: '重症肺炎',
  主要诊断编码: 'I63.901',
  其他诊断名称1: '脑干梗塞',
  其他诊断编码1: '163.901',
  其他诊断名称2: '',
  手术及操作名称1: '手术及操作名称',
  手术及操作编码1: '44.92',
  手术日期1: '2025-04-07',
  手术及操作名称2: '经皮颅内动脉取栓术',
  手术及操作编码2: '39.7400x002',
  手术日期2: '2025-04-07',
  手术及操作名称3: '脑血管造影术',
  手术及操作编码3: '88.4101',
  手术日期3: '2025-04-07',
  手术及操作名称4: '经皮基底动脉球囊扩张成形术',
  手术及操作编码4: '0.6201',
  手术日期4: '2025-04-10',
  手术及操作名称5: '暂时性气管切开术',
  手术及操作编码5: '31.1x00',
  手术日期5: '2025-04-21',
  手术及操作名称6: '',
  手术及操作编码6: '',
  手术日期6: '',
  治疗类型: ';02;',
  脑梗死发病是否在院: '2',
  脑梗死患者到院时间: '2025-04-07 10:34',
  脑梗死发病时间是否明确: '1',
  脑梗死患者发病时间: '2025-04-07 08:39',
  脑出血发病是否在院: '',
  脑出血患者到院时间: '',
  脑出血发病时间是否明确: '',
  脑出血患者发病时间: '',
  本次发病前mRS评分: '2',
  本次发病前mRS评分分数: '',
  本次入院NIHSS评分: '',
  本次入院NIHSS评分分数: '',
  '是否进行吞咽功能评估（洼田饮水试验）': '2',
  是否脑疝: '',
  入院GCS评分: '',
  入院GCS评分分数: '',
  有无既往动脉瘤破裂史: '',
  动脉瘤临床分类: '',
  动脉瘤发病时间: '',
  'Hunt-Hess分级': '',
  'Hunt-Hess分级级别': '',
  Fisher分级: '',
  Fisher分级级别: '',
  是否尼莫地平预防血管痉挛治疗: '',
  '颈动脉狭窄或闭塞是否有症状（缺血或脑梗死症状）': '',
  颈部血管检查: '',
  入院后首次收缩压: '120',
  入院后首次舒张压: '70',
  '发病机制（TOAST分型）': '4',
  是否烟雾病: '2',
  溶栓前NIHSS评分: '',
  溶栓前NIHSS评分分数: '',
  开始静脉溶栓的场所: '',
  开始静脉溶栓时间: '',
  ONT时间: '',
  DNT时间: '',
  静脉溶栓药物: '',
  其他静脉溶栓药物名称: '',
  有无溶栓并发症: '',
  溶栓并发症: '',
  溶栓并发症其他: '',
  溶栓结束后即刻NIHSS评分: '',
  溶栓结束后即刻NIHSS评分分数: '',
  溶栓后24hNIHSS评分: '',
  溶栓后24hNIHSS评分分数: '',
  '溶栓后7±2天NIHSS评分': '',
  '溶栓后7±2天NIHSS评分分数': '',
  未给予血管内治疗的原因: '',
  取栓方式: '2',
  二次发病时间: '',
  术前NIHSS评分: '2',
  术前NIHSS评分分数: '',
  穿刺完成时间: '2025-04-07 13:00',
  OPT时间: '261',
  DPT时间: '146',
  血管内开通方法: ';01;05;',
  术后mTICI是否分级: '2',
  术后mTICI分级结果: '',
  首次血管成功再通时间: '',
  ORT时间: '不详',
  DRT时间: '不详',
  血管内开通治疗手术并发症: ';98;',
  血管内开通治疗手术其他并发症内容: '',
  术后24hNIHSS评分: '2',
  术后24hNIHSS评分分数: '',
  '术后7±2天NIHSS评分': '2',
  '术后7±2天NIHSS评分分数': '',
  未溶栓原因: ';99;',
  出血部位: '',
  出血大小: '',
  脑出血病因诊断: '',
  其他影像学检查: '',
  脑出血手术开始时间: '',
  脑出血发病到开始手术时间: '',
  脑出血到院到开始手术时间: '',
  脑出血麻醉方式: '',
  脑出血手术方式: '',
  微创血肿穿刺术类型: '',
  脑出血其他手术方式: '',
  脑出血手术并发症: '',
  脑出血手术并发症其他: '',
  是否抗血小板治疗: '1',
  抗血小板药物名称: ';02;',
  是否发病48小时内用药: '1',
  颅内血管检查方式: '',
  动脉瘤数量: '',
  动脉瘤1侧别: '',
  动脉瘤1部位: '',
  动脉瘤1部位颈内动脉ICA: '',
  动脉瘤1部位大脑前动脉ACA: '',
  动脉瘤1部位大脑中动脉MCA: '',
  动脉瘤1部位椎动脉VA: '',
  动脉瘤1部位基底动脉BA: '',
  动脉瘤1部位大脑后动脉PCA: '',
  动脉瘤1部位其他: '',
  '动脉瘤1大小(长)': '',
  '动脉瘤1大小(宽)': '',
  '动脉瘤1大小(高)': '',
  '动脉瘤1大小（瘤颈)': '',
  动脉瘤1类型: '',
  动脉瘤2侧别: '',
  动脉瘤2部位: '',
  动脉瘤2部位颈内动脉ICA: '',
  动脉瘤2部位大脑前动脉ACA: '',
  动脉瘤2部位大脑中动脉MCA: '',
  动脉瘤2部位椎动脉VA: '',
  动脉瘤2部位基底动脉BA: '',
  动脉瘤2部位大脑后动脉PCA: '',
  动脉瘤2部位其他: '',
  '动脉瘤2大小(长)': '',
  '动脉瘤2大小(宽)': '',
  '动脉瘤2大小(高)': '',
  '动脉瘤2大小（瘤颈)': '',
  动脉瘤2类型: '',
  动脉瘤3侧别: '',
  动脉瘤3部位: '',
  动脉瘤3部位颈内动脉ICA: '',
  动脉瘤3部位大脑前动脉ACA: '',
  动脉瘤3部位大脑中动脉MCA: '',
  动脉瘤3部位椎动脉VA: '',
  动脉瘤3部位基底动脉BA: '',
  动脉瘤3部位大脑后动脉PCA: '',
  动脉瘤3部位其他: '',
  '动脉瘤3大小(长)': '',
  '动脉瘤3大小(宽)': '',
  '动脉瘤3大小(高)': '',
  '动脉瘤3大小（瘤颈)': '',
  动脉瘤3类型: '',
  动脉瘤4侧别: '',
  动脉瘤4部位: '',
  动脉瘤4部位颈内动脉ICA: '',
  动脉瘤4部位大脑前动脉ACA: '',
  动脉瘤4部位大脑中动脉MCA: '',
  动脉瘤4部位椎动脉VA: '',
  动脉瘤4部位基底动脉BA: '',
  动脉瘤4部位大脑后动脉PCA: '',
  动脉瘤4部位其他: '',
  '动脉瘤4大小(长)': '',
  '动脉瘤4大小(宽)': '',
  '动脉瘤4大小(高)': '',
  '动脉瘤4大小（瘤颈)': '',
  动脉瘤4类型: '',
  动脉瘤1是否手术: '',
  动脉瘤1手术类型: '',
  动脉瘤1手术时间: '',
  动脉瘤1夹闭术治疗结果: '',
  动脉瘤1夹闭术夹闭后载瘤动脉情况: '',
  动脉瘤1夹闭术中有无并发症: '',
  动脉瘤1夹闭术中并发症: '',
  动脉瘤1夹闭术其他并发症: '',
  动脉瘤1介入治疗有无弹簧圈: '',
  动脉瘤1介入治疗弹簧圈个数: '',
  动脉瘤1介入治疗有无支架: '',
  动脉瘤1介入治疗支架个数: '',
  动脉瘤1介入治疗有无球囊: '',
  动脉瘤1介入治疗球囊个数: '',
  动脉瘤1介入治疗其他栓塞材料: '',
  动脉瘤1介入治疗其他栓塞材料描述: '',
  动脉瘤1介入后动脉瘤治疗结果: '',
  动脉瘤1介入后载瘤动脉情况: '',
  动脉瘤1栓塞术过程中有无并发症: '',
  动脉瘤1栓塞术过程中并发症: '',
  动脉瘤1栓塞术过程中急性血栓形成部位: '',
  动脉瘤1栓塞术过程中动脉夹层部位: '',
  动脉瘤1栓塞术过程中其他术中并发症说明: '',
  动脉瘤2是否手术: '',
  动脉瘤2手术类型: '',
  动脉瘤2手术时间: '',
  动脉瘤2夹闭术治疗结果: '',
  动脉瘤2夹闭术夹闭后载瘤动脉情况: '',
  动脉瘤2夹闭术中有无并发症: '',
  动脉瘤2夹闭术中并发症: '',
  动脉瘤2夹闭术其他并发症: '',
  动脉瘤2介入治疗有无弹簧圈: '',
  动脉瘤2介入治疗弹簧圈个数: '',
  动脉瘤2介入治疗有无支架: '',
  动脉瘤2介入治疗支架个数: '',
  动脉瘤2介入治疗有无球囊: '',
  动脉瘤2介入治疗球囊个数: '',
  动脉瘤2介入治疗其他栓塞材料: '',
  动脉瘤2介入治疗其他栓塞材料描述: '',
  动脉瘤2介入后动脉瘤治疗结果: '',
  动脉瘤2介入后载瘤动脉情况: '',
  动脉瘤2栓塞术过程中有无并发症: '',
  动脉瘤2栓塞术过程中并发症: '',
  动脉瘤2栓塞术过程中急性血栓形成部位: '',
  动脉瘤2栓塞术过程中动脉夹层部位: '',
  动脉瘤2栓塞术过程中其他术中并发症说明: '',
  动脉瘤3是否手术: '',
  动脉瘤3手术类型: '',
  动脉瘤3手术时间: '',
  动脉瘤3夹闭术治疗结果: '',
  动脉瘤3夹闭术夹闭后载瘤动脉情况: '',
  动脉瘤3夹闭术中有无并发症: '',
  动脉瘤3夹闭术中并发症: '',
  动脉瘤3夹闭术其他并发症: '',
  动脉瘤3介入治疗有无弹簧圈: '',
  动脉瘤3介入治疗弹簧圈个数: '',
  动脉瘤3介入治疗有无支架: '',
  动脉瘤3介入治疗支架个数: '',
  动脉瘤3介入治疗有无球囊: '',
  动脉瘤3介入治疗球囊个数: '',
  动脉瘤3介入治疗其他栓塞材料: '',
  动脉瘤3介入治疗其他栓塞材料描述: '',
  动脉瘤3介入后动脉瘤治疗结果: '',
  动脉瘤3介入后载瘤动脉情况: '',
  动脉瘤3栓塞术过程中有无并发症: '',
  动脉瘤3栓塞术过程中并发症: '',
  动脉瘤3栓塞术过程中急性血栓形成部位: '',
  动脉瘤3栓塞术过程中动脉夹层部位: '',
  动脉瘤3栓塞术过程中其他术中并发症说明: '',
  动脉瘤4是否手术: '',
  动脉瘤4手术类型: '',
  动脉瘤4手术时间: '',
  动脉瘤4夹闭术治疗结果: '',
  动脉瘤4夹闭术夹闭后载瘤动脉情况: '',
  动脉瘤4夹闭术中有无并发症: '',
  动脉瘤4夹闭术中并发症: '',
  动脉瘤4夹闭术其他并发症: '',
  动脉瘤4介入治疗有无弹簧圈: '',
  动脉瘤4介入治疗弹簧圈个数: '',
  动脉瘤4介入治疗有无支架: '',
  动脉瘤4介入治疗支架个数: '',
  动脉瘤4介入治疗有无球囊: '',
  动脉瘤4介入治疗球囊个数: '',
  动脉瘤4介入治疗其他栓塞材料: '',
  动脉瘤4介入治疗其他栓塞材料描述: '',
  动脉瘤4介入后动脉瘤治疗结果: '',
  动脉瘤4介入后载瘤动脉情况: '',
  动脉瘤4栓塞术过程中有无并发症: '',
  动脉瘤4栓塞术过程中并发症: '',
  动脉瘤4栓塞术过程中急性血栓形成部位: '',
  动脉瘤4栓塞术过程中动脉夹层部位: '',
  动脉瘤4栓塞术过程中其他术中并发症说明: '',
  'CEA/CAS手术开始时间': '',
  'CEA/CAS手术部位': '',
  'CEA/CAS手术实施的监测手段': '',
  'CEA/CAS手术采取方式': '',
  'CEA/CAS手术是否采用补片': '',
  CEA手术并发症: '',
  CAS手术并发症: '',
  '7±2天（或出院）时mRS评分': '2',
  '7±2天（或出院）时mRS评分分数': '',
  '7±2天（或出院）时NIHSS评分': '2',
  '7±2天（或出院）时NIHSS评分分数': '',
  '7±2天（或出院）时GCS评分': '',
  '7±2天（或出院）时GCS评分分数': '',
  是否接受康复治疗: '1',
  开始康复治疗日期: '2025-04-16',
  死亡原因: '',
  死亡原因其他: '',
  死亡时间: '',
  出院用药: ';05;01;03;',
  既往有房颤病史或此次住院检查提示房颤: '',
  烟雾病临床表现类型: '',
  既往是否有类似病史: '',
  烟雾病上次发病时间: '',
  烟雾病既往手术情况: '',
  烟雾状血管侧别: '',
  左侧烟雾状血管位置: '',
  左侧烟雾状血管位置其他: '',
  右侧烟雾状血管位置: '',
  右侧烟雾状血管位置其他: '',
  颅内外是否有代偿: '',
  烟雾病本次发病是否手术治疗: '',
  烟雾病手术开始时间: '',
  烟雾病左侧治疗方式: '',
  烟雾病左侧治疗方式其他: '',
  烟雾病右侧治疗方式: '',
  烟雾病右侧治疗方式其他: '',
  烟雾病手术治疗并发症: '',
  烟雾病手术治疗并发症其他: '',
  AVM类型: '',
  AVM大小: '',
  AVM部位特征: '',
  静脉引流位置: '',
  'Spetzler–Marin评分分数': '',
  有无静脉血栓: '',
  AVM患者是否手术治疗: '',
  AVM治疗时间: '',
  AVM治疗策略: '',
  AVM治疗并发症: '',
  AVM治疗并发症其他: '',
  AVM左侧责任病灶位置: '',
  AVM右侧责任病灶位置: '',
  AVM中线部位责任病灶位置: '',
  AVM中线部位责任病灶位置其他: ''
}
Object.keys(tableHeader).forEach(item => {
  common3.column.push({
    label: item,
    value: item,
    formatter: (row) => {
      if (item === '性别') {
        return row[item] ? (row[item] === 1 ? '男' : '女') : '未知'
      } else if (item === '主要医疗付费方式') {
        return payTypeList[row[item]]
      } else if (item === '民族') {
        return ethnicGroup[row[item]]
      } else if (item === '入院途径') {
        return enterHospitalList[row[item]]
      } else {
        return row[item] || '-'
      }
    }
  })
})
const pageResult3 = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0,
  layout: 'total, sizes, prev, pager, next'
})
onMounted(async() => {
  await getDiagnosisCodeList({
    pageNum: 1,
    pageSize: 50000
  }).then(res => {
    if (res.code === 10000) {
      const arr = lodash.get(res, 'data.items', [])
      arr.forEach(item => {
        // diagnosisCodeList.value.push({
        //   label: `${item.code}（${item.name}）`,
        //   value: item.code
        // })
        diagnosisList.value.push({
          label: `${item.code}（${item.name}）`,
          value: item.name
        })
      })
    }
  })
})
</script>
<style scoped lang="scss">
.createResearch {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--theme-bg)#f0f3f8;
  .titleHeader {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 65px;
    margin-bottom: 16px;
    padding: 0 24px;
    border-radius: 16px;
    background: var(--theme-card);
    font-weight: 700;
    font-size: 16px;
    color: #3d3d3d;
  }
  .bottomDom {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 91px;
    margin-top: 16px;
    border-radius: 16px;
    background: var(--theme-card);
    .operBtn {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 51px;
      // width: 269px;
      padding: 0 34px;
      border-radius: 26px;
      background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
      cursor: pointer;
      font-weight: 600;
      font-size: 16px;
      color: #fdfdfd;
      :deep(.loading) {
        margin-right: 12px;
      }
      .iconfont {
        margin-right: 12px;
      }
    }
  }
  .stepBar {
    display: flex;
    overflow: hidden;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 76px;
    margin-bottom: 16px;
    padding: 0 52px;
    border: 4px solid #fff;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(54, 112, 248, 0.13) 5%, rgba(255, 255, 255, 1) 100%);
    .stepItem {
      display: flex;
      align-items: center;
      &.active {
        .stepItemNum {
          background: var(--theme-primary);
          color: #fff;
        }
        .stepItemName {
          color: var(--theme-primary);
        }
      }
      .stepItemNum {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        margin-right: 12px;
        border-radius: 50%;
        background: #e2e2e4;
        font-size: 16px;
        color: #999faf;
      }
      .doneIcon {
        margin-right: 12px;
        :deep(.el-icon) {
          font-size: 28px;
          color: var(--theme-primary);
        }
      }
      .stepItemName {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 16px;
        color: var(--theme-text-3);
        &.doneName {
          font-weight: 600;
          font-size: 16px;
          color: #3d3d3d;
        }
      }
    }
    .line {
      flex: 1;
      margin: 0 24px;
      border: 2px solid #e2e2e4;
    }
  }
}
.researchTopic {
  display: flex;
  overflow: hidden;
  align-items: center;
  flex: 1;
  width: 100%;
  height: 0;

  .aiLterContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    background: url('@/assets/aiBg.png') no-repeat;
    background-size: 100% 100%;
    .logo {
      // width: 356px;
      height: 83px;
      margin-top: 83px;
      margin-bottom: 66px;
    }
    .main {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      width: 880px;
      height: auto;
      min-height: 111px;
      padding: 16px 24px;
      border: 1px solid #dbdcdf;
      border-radius: 16px;
      background-color: var(--theme-fill);
      // background: url('@/assets/searchBorder.png') no-repeat;
      background-size: 100% 100%;
      :deep(.search) {
        // flex: 1;
        // height: 0;
        overflow-y: hidden;
        height: auto;
        margin-bottom: 10px;
        .el-textarea__inner {
          overflow-y: hidden;
          box-sizing: border-box;
          height: auto;
          min-height: 40px !important;
          padding: 0;
          border: 0;
          border-radius: 0;
          background-color: inherit;
          box-shadow: none;
          resize: none;
          line-height: inherit;
        }
      }
      .opContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .deepThinking {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 89px;
          height: 31px;
          border: 1px solid #c9d9ff;
          border-radius: 16px;
          background: #e4e7fd;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          color: var(--theme-primary);
        }
        .sendIcon {
          width: 29px;
          height: 29px;
          cursor: pointer;
        }
        .send-button {
          width: 31px;
          height: 31px;
          border: none;
          background-color: inherit;
          cursor: pointer;
          i {
            font-size: 31px;
            color: var(--theme-primary);
          }
          &.is-disabled {
            i {
              color: #99b6fa;
            }
          }
        }
      }
    }
    .searchContainer {
      box-sizing: border-box;
      width: 880px;
      height: auto;
      margin-top: 21px;
      padding: 24px;
      border: 1px solid #fff;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.9);
    }
  }
  .recommended {
    margin-top: 16px;
    .recommendedItem {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 882px;
      height: 37px;
      margin-bottom: 16px;
      padding: 0 18px;
      border: 1px solid #fff;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      line-height: 23px;
      font-weight: 400;
      font-size: 14px;
      color: var(--theme-text-2);
      &.actived {
        border: 1px solid var(--theme-primary);
        background: var(--theme-primary-soft);
        color: var(--theme-primary);
      }
      .bookIcon {
        width: 14px;
        height: 15px;
        margin-right: 10px;
      }
    }
  }
}
:deep(.commonSearch) {
  .el-form-item {
    margin-right: 30px;
    &:nth-of-type(3n) {
      margin-right: 0 !important;
    }
  }

  .el-select,
  .el-date-editor {
    width: 255px !important;
  }
  .ageInput {
    width: 140px !important;
  }
}
.stepContainer {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  border-radius: 16px;
  background: var(--theme-card);
  &.oneTwo {
    .title {
      margin-bottom: 16px;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-primary);
    }
    :deep(.mainContent) {
      flex: 1;
      height: 0;
      padding: 16px 24px;
      border: 1px solid #c9d8fc;
      border-radius: 8px;
      background: var(--theme-primary-soft);
      .el-scrollbar__view {
        position: relative;
      }
      .nextBtn {
        position: absolute;
        right: 0;
        top: 0;
        width: 172px;
        height: 32px;
        border-radius: 16px;
        background: var(--theme-primary);
        line-height: 22px;
        text-align: left;
        font-weight: 350;
        font-size: 14px;
        color: #fefeff;
      }
      .subTitle {
        line-height: 28px;
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-primary);
      }
      .numberContainer {
        display: flex;
        box-sizing: border-box;
        height: 148px;
        margin-top: 16px;
        margin-bottom: 24px;
        padding: 24px;
        border-radius: 8px;
        background: var(--theme-card);
        .card {
          display: flex;
          align-items: center;
          flex: 1;
          box-sizing: border-box;
          height: 100%;
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
      .chartsContainer {
        display: flex;
        align-items: center;
        height: 271px;
        margin-top: 16px;
        .chartItem {
          display: flex;
          flex-direction: column;
          flex: 1;
          box-sizing: border-box;
          height: 100%;
          padding: 16px 24px;
          border-radius: 8px;
          background-color: var(--theme-card);
          &:nth-of-type(1) {
            margin-right: 16px;
          }
          .chartsContainer {
            flex: 1;
            height: 0;
          }
        }
      }
      .tableContaienr {
        height: 1240px;
        margin-top: 16px;
        padding: 24px;
        border-radius: 8px;
        background-color: var(--theme-card);
        .myTable {
          overflow: hidden;
          flex: 1;
        }
      }
    }
  }
  &.two {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    background: transparent;
    .AIIndexContainer {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      box-sizing: border-box;
      width: calc(50% - 8px);
      height: 100%;
      margin-right: 16px;
      padding: 24px;
      border-radius: 8px;
      background: var(--theme-card);
      .title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        line-height: 23px;
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-primary);
        img {
          width: 15px;
          height: 15px;
          margin-right: 10px;
        }
      }
      .indexContent {
        display: flex;
        flex-direction: column;
        flex: 1;
        box-sizing: border-box;
        height: 0;
        padding: 24px;
        border: 1px solid #c9d8fc;
        border-radius: 8px;
        background: var(--theme-primary-soft);
        .indexItem {
          margin-bottom: 8px;
          .indexTitle {
            margin-bottom: 16px;
            line-height: 28px;
            font-weight: 600;
            font-size: 16px;
            color: var(--theme-text);
          }
          .indexs {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            .indexsItem {
              display: flex;
              align-items: center;
              height: 29px;
              margin-right: 16px;
              margin-bottom: 16px;
              padding: 0 18px;
              border: 1px solid var(--theme-primary);
              border-radius: 2px;
              background: rgba(255, 255, 255, 0.8);
              line-height: 20px;
              font-size: 14px;
              color: var(--theme-primary);
            }
          }
        }
      }
    }
    .indexManageContainer {
      display: flex;
      position: relative;
      flex-direction: column;
      box-sizing: border-box;
      width: calc(50% - 8px);
      height: 100%;
      padding: 24px;
      border-radius: 8px;
      background: var(--theme-card);
      .nextBtn {
        position: absolute;
        right: 24px;
        top: 16px;
        border-radius: 16px;
      }
      .title {
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-primary);
        .iconfont {
          margin-right: 12px;
        }
      }
      .indexNumber {
        display: flex;
        align-items: center;
        height: 70px;
        margin-top: 24px;
        margin-bottom: 16px;
        padding: 0 24px;
        border: 1px solid #c9d8fc;
        border-radius: 8px;
        background: var(--theme-primary-soft);
        img {
          width: 27px;
          height: 27px;
          margin-right: 17px;
        }
        .title {
          line-height: 28px;
          font-weight: 600;
          font-size: 16px;
          color: var(--theme-primary);
        }
        span {
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text-2);
        }
      }
      .tableContainer {
        display: flex;
        overflow: hidden;
        flex-direction: column;
        flex: 1;
        height: 0;
        padding: 12px 24px 16px;
        border: 1px solid #c9d8fc;
        border-radius: 8px;
        background: var(--theme-primary-soft);
        .title {
          display: flex;
          align-items: center;
          height: 32px;
          margin-bottom: 12px;
          .titleText {
            flex: 1;
            font-weight: 600;
            font-size: 16px;
            color: var(--theme-primary);
          }
          .editBtn {
            border-radius: 16px;
          }
        }
        .myTable {
          flex: 1;
          height: 0;
        }
      }
    }
  }
  &.three {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0;
    background: transparent;
    .resultContainer {
      display: flex;
      position: relative;
      flex-direction: column;
      flex-shrink: 0;
      box-sizing: border-box;
      width: calc(50% - 8px);
      height: 100%;
      margin-right: 16px;
      padding: 24px;
      border-radius: 8px;
      background: var(--theme-card);
      .nextBtn {
        position: absolute;
        right: 24px;
        top: 16px;
        border-radius: 16px;
      }
      .title {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        line-height: 23px;
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-primary);
        img {
          width: 15px;
          height: 15px;
          margin-right: 10px;
        }
      }
      .resultDom {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        height: 70px;
        margin-bottom: 16px;
        padding: 0 24px;
        border: 1px solid #c9d8fc;
        border-radius: 8px;
        background: var(--theme-primary-soft);
        img {
          width: 27px;
          margin-right: 12px;
        }
        .resTilte {
          line-height: 28px;
          font-weight: 600;
          font-size: 16px;
          color: var(--theme-primary);
        }
        .process {
          display: flex;
          align-items: center;
          .processDom {
            width: 140px;
            margin-right: 10px;
          }
        }
      }
      .tableContainer {
        flex: 1;
        height: 0;
        padding: 24px;
        border: 1px solid #c9d8fc;
        border-radius: 8px;
        background: var(--theme-primary-soft);
      }
    }
  }
}
.beHospitalized,
.outpatientService {
  margin-right: 8px;
  font-size: 14px;
  color: var(--theme-primary);
}
.singleLineTooltipText {
  overflow: hidden;
  flex: 1;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.itemTag {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  height: 20px;
  margin-right: 8px;
  padding: 0 8px;
  border-radius: 2px;
  background: var(--theme-fill);
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--theme-text);
  white-space: nowrap;
}
.redBtn {
  color: #f76868;
}
</style>
