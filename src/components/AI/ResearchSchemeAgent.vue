<template>
  <div class="page-div" v-show="!showPlan">
    <el-scrollbar>
      <div class="main">
        <universalHead :logo="aiLogo" placeholder="请填写您的研究题目 (建议您的研究题目包含受试者、干预措施和目的）" @search="searchText" ref="universalHeadRef" @handleRequest="handleSubmit"></universalHead>
        <div class="other-div">
          <div class="btn-container">
            <div v-for="item in researchTypes" :key="item.id" class="btn-item flexCenter" :class="{'active': item.id === formData.way}" @click="handleClickWay(item)">{{item.name}}</div>
          </div>
          <div class="noticeContaienr" v-if="formData?.way===2">
            <span>本研究需通过医院伦理委员会/动物伦理委员会审批</span>
          </div>
          <div class="noticeContaienr" v-if="formData?.way===6">
            <span>本研究需在临床试验注册平台注册（如ClinicalTrials.gov中国临床试验注册中心） </span>
            <span>本研究需要通过医院伦理委员会审批</span>
          </div>

          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            :class="{specialForm:formData.way===7}"
            label-width="auto"
            :label-position="formData.way===7?'left':undefined"
          >
            <template v-for="searchItem in SEARCHLIST" :key="searchItem">
              <el-form-item :label="searchItem.label" :prop="searchItem.prop" v-if="!searchItem.type.includes('CUSTOM')">
                <template v-if="searchItem.type==='RADIO'">
                  <el-radio-group v-model="formData[searchItem.prop]">
                    <el-radio :value="v" v-for="v in searchItem.Enums" :key="v" @change="handleRadioChange">{{v}}</el-radio>
                  </el-radio-group>
                </template>
                <template v-if="searchItem.type==='INPUT'">
                  <el-input
                    class="otherAnimal"
                    v-model="formData[searchItem.prop]"
                    maxlength="50"
                    show-word-limit
                    :placeholder="searchItem.placeholder||'请填写'"></el-input>
                </template>
                <template v-if="searchItem.type==='DEFAULT'">
                  <div>{{ formData.experimentalProcedures }}</div>
                </template>
              </el-form-item>
              <template v-if="searchItem.type.includes('CUSTOM')">
                <div class="customContainer" v-if="searchItem.type=='CUSTOM1'&&formData.way===3&&formData?.researchPurpose==='自定义'">
                  <el-form-item label="自定义：" prop="customValue">
                    <el-input
                      class="otherAnimal"
                      v-model="formData.customValue"
                      maxlength="50"
                      show-word-limit
                      placeholder="请填写内容"></el-input>
                  </el-form-item>
                </div>
                <div class="customContainer" v-if="searchItem.type=='CUSTOM2'&&formData.way===4&&formData?.researchPurpose==='自定义'">
                  <el-form-item label="自定义：" prop="customValue" >
                    <el-input
                      class="otherAnimal"
                      v-model="formData.customValue"
                      maxlength="50"
                      show-word-limit
                      placeholder="请填写内容"></el-input>
                  </el-form-item>
                </div>
                <div class="customContainer" v-if="searchItem.type=='CUSTOM3'&&formData.way===4&&formData?.keyParams==='随访时间'">
                  <el-form-item label="预估时间：">
                    <el-date-picker
                      v-model="formData.time"
                      type="daterange"
                      range-separator="-"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="YYYY-MM-DD"
                    />

                  </el-form-item>
                </div>
                <div class="customContainer" v-if="searchItem.type=='CUSTOM3'&&formData.way===4&&formData?.keyParams==='失访率控制'">
                  <el-form-item label="失访率：" prop="lossRate" >
                    <div style="display: flex; align-items: center;">
                      <el-input
                        class="otherAnimal"
                        v-model="formData.lossRate"
                        maxlength="50"
                        show-word-limit
                        placeholder="请填写内容"></el-input>
                      <div class="noticeText">*建议失访率低于20%</div>
                    </div>
                  </el-form-item>
                </div>
                <div class="customContainer" v-if="searchItem.type=='CUSTOM4'&&formData.way===5&&formData?.researchPurpose==='自定义'">
                  <el-form-item label="自定义：" prop="customValue" >
                    <el-input
                      class="otherAnimal"
                      v-model="formData.customValue"
                      maxlength="50"
                      show-word-limit
                      placeholder="请填写内容"></el-input>
                  </el-form-item>
                </div>
                <div class="customContainer CUSTOM5" v-if="searchItem.type=='CUSTOM5'&&formData.way===5&&formData?.matchingDesign==='是'">
                  <el-form-item label="年龄：" prop="age" >
                    <!-- @input="handleValueFomatter" -->
                    <el-input
                      v-model="formData.age"
                      placeholder="请填写内容"
                      maxlength="50"
                      show-word-limit
                    />
                  </el-form-item>
                  <el-form-item label="入院时间：" prop="entryTime" >
                    <el-date-picker
                      v-model="formData.entryTime"
                      type="daterange"
                      range-separator="-"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      value-format="YYYY-MM-DD"
                    />
                  <!-- <el-input
                    class="otherAnimal"
                    v-model="formData.entryTime"
                    maxlength="50"
                    show-word-limit
                    placeholder="请填写内容"></el-input> -->
                  </el-form-item>
                  <el-form-item label="性别：" prop="gender" >
                    <el-select v-model="formData.gender" placeholder="请选择一项">
                      <el-option label="男" value="男" />
                      <el-option label="女" value="女" />
                    </el-select>
                  </el-form-item>
                </div>
              </template>

            </template>
          </el-form>
          <div class="outline-div" v-if="formData?.experimentalProcedures === '自定义'">
            <div class="content-header">
              <img :src="aiLiter5" alt="">
              <span class="flex1">请编辑该实验步骤：</span>
            </div>
            <customOutline ref="customOutlineRef" v-model="aiLiteratureReviewIntelligentAgentsData"></customOutline>
          </div>
        </div>

        <div class="btn-div">
          <el-button class="generate-btn" type="primary" @click="handleSubmit" :disabled="!formData.title?.trim()">
            <i class="iconfont icon-yijianbianji" v-if="!btnLoading"></i>
            <Loading :size="16" color="#fff" v-else/>
            生成研究方案
          </el-button>
        </div>
        <div class="example-div">
          <header>
            <img src="@/assets/title-example.png" />
          </header>
          <ul style="z-index: 1;">
            <li v-for="(item, index) in example" :key="'example-' + index" @click="handleClick(item)">{{index + 1}}.{{item}}</li>
          </ul>
        </div>
      </div>
    </el-scrollbar>
  </div>
  <researchProgramme :dialogId="dialogId" :activeSessionInfo="activeSessionInfo" :query="formData.title?.trim()" :schemeId="schemeId" v-if="showPlan"/>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import aiLogo from '@/assets/AI-logo3.png'
import aiLiter5 from '@/assets/aiLiter5.png'
import universalHead from '@/components/AI/universalHead.vue'
import researchProgramme from '@/components/AI/researchProgramme.vue'
// eslint-disable-next-line no-unused-vars
import { researchTypes } from '@/components/AI/js/enum.js'
import { generateResearchScheme } from '@/api/api_agent.js'
import customOutline from '@/components/AI/customOutline.vue'
import { aiLiteratureDataString } from '@/components/AI/js/data.js'
import { ElMessage } from 'element-plus'
defineOptions({
  name: 'ResearchSchemeAgent',
  inheritAttrs: false
})
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  dialogId: {
    type: String,
    default: ''
  },
  activeSessionInfo: {
    default: () => {
      return {}
    }
  }
})
// 监听props.dialogId
// watch(() => props.dialogId, (newVal) => {
//   if (newVal) {
//     schemeId.value = newVal
//     init()
//   } else {
//     schemeId.value = ''
//     showPlan.value = false
//   }
// })
const emits = defineEmits(['handleGenerate', 'handleRefreshDialogList'])
const customOutlineRef = ref(null)
const aiLiteratureReviewIntelligentAgentsData = ref([]) // 文献综述数据
const formData = ref({
  title: '',
  // animal: 'SD大鼠',
  // otherAnimal: '',
  // step: 1,
  way: 1
  // goal: '病因假设/预后预测',
  // type: '前瞻性',
  // random: '简单随机', // 随机方法
  // blind: '单盲', // 盲法
  // language: '中文' // 语言
})
const universalHeadRef = ref(null)
// eslint-disable-next-line no-unused-vars
const handleValueFomatter = () => {
  formData.value.age = formData.value.age.replace(/[^\d]/g, '')
}
onMounted(() => {
  formData.value.title = props.text.title
  const objWay = researchTypes.value.find(item => item.name === props.text.tag)
  if (objWay) {
    handleClickWay(objWay)
    // formData.value.way = objWay.id
    // SEARCHLIST.value = objWay.searchList
  }
  universalHeadRef.value.setSearchText(formData.value.title)
})
const rules = reactive({
  researchSystem: { required: true, message: '请选择', trigger: 'change' },
  interventionMeasures: { required: true, message: '请选择', trigger: 'change' },
  detectionIndex: { required: true, message: '请选择', trigger: 'change' },
  experimentalProcedures: { required: true, message: '请选择', trigger: 'change' },
  experimentalAnimals: { required: true, message: '请填写', trigger: 'blur' },
  diseaseModel: { required: true, message: '请选择', trigger: 'change' },
  researchPurpose: { required: true, message: '请选择', trigger: 'change' },
  samplingMethod: { required: true, message: '请选择', trigger: 'change' },
  customValue: { required: true, message: '请填写', trigger: 'blur' },
  dataType: { required: true, message: '请选择', trigger: 'change' },
  keyParams: { required: true, message: '请选择', trigger: 'change' },
  lossRate: { required: true, message: '请填写', trigger: 'blur' },
  age: { required: true, message: '请填写', trigger: 'blur' },
  entryTime: { required: true, message: '请选择', trigger: 'blur' },
  gender: { required: true, message: '请选择', trigger: 'change' },
  randomMethod: { required: true, message: '请选择', trigger: 'change' },
  blindSelection: { required: true, message: '请选择', trigger: 'change' },
  multicenter: { required: true, message: '请选择', trigger: 'change' },
  matchingDesign: { required: true, message: '请选择', trigger: 'change' },
  source: { required: true, message: '请选择', trigger: 'change' },
  P: { required: true, message: '请填写', trigger: 'blur' },
  I: { required: true, message: '请填写', trigger: 'blur' },
  C: { required: true, message: '请填写', trigger: 'blur' },
  O: { required: true, message: '请填写', trigger: 'blur' },
  S: { required: true, message: '请填写', trigger: 'blur' },
  goal: [
    { required: true, message: '请选择您的研究目的', trigger: 'change' }
  ],
  type: [
    { required: true, message: '请选择您的研究类型', trigger: 'change' }
  ]
})

const formRef = ref(null)
const showPlan = ref(false)
const schemeId = ref(props.dialogId)
const btnLoading = ref(false)
const handleSubmit = async () => {
  if (btnLoading.value) return
  console.log(formData.value)
  // 必填项校验
  const validate = await formRef.value.validate()
  if (!validate) {
    return false
  }
  // eslint-disable-next-line no-unreachable
  const params = {
    parameter: '',
    topic: formData.value.title?.trim()
  }
  if (formData.value.way === 1) {
    if (customOutlineRef.value?.isCheckTitle) {
      ElMessage.error('请填写完整的实验步骤')
      return
    }
    params.parameter = `${curActiveWay.value.name}-研究体系:${formData.value.researchSystem}-干预措施:${formData.value.interventionMeasures}-检测指标:${formData.value.detectionIndex}`
    params.step = aiLiteratureDataString([...aiLiteratureReviewIntelligentAgentsData.value])
  } else if (formData.value.way === 2) {
    if (customOutlineRef.value?.isCheckTitle) {
      ElMessage.error('请填写完整的实验步骤')
      return
    }
    params.parameter = `${curActiveWay.value.name}-实验动物:${formData.value.experimentalAnimals}-疾病模型:${formData.value.diseaseModel}-干预措施:${formData.value.interventionMeasures}-观察指标:${formData.value.detectionIndex}`
    params.step = aiLiteratureDataString([...aiLiteratureReviewIntelligentAgentsData.value])
  } else if (formData.value.way === 3) {
    params.parameter = `${curActiveWay.value.name}-研究目的:${formData.value.researchPurpose === '自定义' ? `${formData.value.customValue}` : formData.value.researchPurpose}-抽样方法:${formData.value.samplingMethod}`
  } else if (formData.value.way === 4) {
    params.parameter = `${curActiveWay.value.name}-研究目的:${formData.value.researchPurpose === '自定义' ? `${formData.value.customValue}` : formData.value.researchPurpose}-数据类型:${formData.value.dataType}`
    if (formData.value.keyParams === '随访时间' && formData.value.time) {
      params.parameter += `-${formData.value.keyParams}:${formData.value.time.join('至')}`
    } else if (formData.value.keyParams === '失访率控制') {
      params.parameter += `-${formData.value.keyParams}:${formData.value.lossRate}`
    }
  } else if (formData.value.way === 5) {
    params.parameter = `${curActiveWay.value.name}-研究目的:${formData.value.researchPurpose === '自定义' ? `${formData.value.customValue}` : formData.value.researchPurpose}`
    if (formData.value.matchingDesign === '是') {
      params.parameter += `-匹配设计:年龄${formData.value.age},入院时间${formData.value.entryTime.join('至')},性别${formData.value.gender}`
    }
    params.parameter += `-${formData.value.source}`
  } else if (formData.value.way === 6) {
    params.parameter = `${curActiveWay.value.name}-研究目的:${formData.value.researchPurpose}-随机方式:${formData.value.randomMethod}-盲法选择:${formData.value.blindSelection}-多中心研究:${formData.value.multicenter}`
  } else if (formData.value.way === 7) {
    params.parameter = `${curActiveWay.value.name}-研究对象:${formData.value.P}-干预措施:${formData.value.I}-对照措施:${formData.value.C}-结局指标:${formData.value.O}-研究类型:${formData.value.S}]`
  }
  console.log(params)
  btnLoading.value = true
  const { code, data } = await generateResearchScheme(params)
  if (code === 10000) {
    console.log(code, data)
    schemeId.value = data
    // 刷新左侧会话记录，并定位到当前会话
    emits('handleRefreshDialogList', data)
    showPlan.value = true
  }
  btnLoading.value = false
}
const example = ref([])
example.value = researchTypes.value.find(item => item.id === formData.value.way)?.list || []
const searchText = (text) => {
  formData.value.title = text
}
const SEARCHLIST = ref([])
const curActiveWay = ref(null)
// 切换研究类型
const handleClickWay = (item) => {
  curActiveWay.value = item
  SEARCHLIST.value = item.searchList
  formData.value = {
    title: formData.value.title,
    way: item.id,
    ...item.defaultValue
  }
  example.value = item.list
  aiLiteratureReviewIntelligentAgentsData.value = []
}
handleClickWay(researchTypes.value[3])
const handleRadioChange = (val) => {
  console.log('值变化', val)
  console.log('啥', formData.value)
}
const handleClick = (item) => {
  formData.value.title = item
  universalHeadRef.value.setSearchText(formData.value.title)
}

const init = () => {
  if (props.dialogId) {
    showPlan.value = true
  }
}
init()
</script>
<style scoped lang="scss">
.page-div {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  width: 100%;
  padding-bottom: 24px;
  background: url('@/assets/aiBg.png') no-repeat;
  background-size: 100% 100%;
  .el-scrollbar {
    width: 100%;
  }
  .main {
    width: 904px;
    margin: 0 auto;
    :deep(.logo) {
      width: 361px;
    }
    :deep(.aiLterContainer) {
      .main {
        width: 904px;
      }
      .header-box {
        img {
          margin-top: 60px;
          margin-bottom: 50px;
        }
      }
    }
    .other-div {
      box-sizing: border-box;
      margin-top: 16px;
      padding: 24px;
      border-radius: 16px;
      background-color: var(--theme-card);
      .btn-container {
        display: flex;
        justify-content: space-between;
        font-size: 16px;
        .btn-item {
          display: flex;
          align-items: center;
          box-sizing: border-box;
          width: auto;
          height: 37px;
          padding: 0 12px;
          border: 1px solid #f4f4f4;
          border-radius: 2px;
          background-color: var(--theme-fill);
          cursor: pointer;
          font-weight: 400;
          font-size: 18px;
          color: var(--theme-text);
          word-break: keep-all;
          &.active {
            border: 1px solid var(--theme-primary);
            background-color: var(--theme-primary-soft);
            font-weight: 600;
            color: var(--theme-primary);
          }
        }
      }
      :deep(.el-form) {
        margin-top: 18px;
        .el-form-item {
          display: flex;
          align-items: center;
          height: 42px;
          margin-bottom: 8px;
          .el-input__wrapper,
          .el-select__wrapper {
            height: 42px;
          }
          .el-input__inner,
          .el-select__wrapper {
            font-size: 18px;
          }
          &:last-child {
            margin-bottom: 0;
          }
          .el-form-item__label {
            font-weight: 600;
            font-size: 18px;
          }
          .el-radio__label {
            padding-left: 8px;
            font-size: 18px;
          }
          // .otherAnimal {
          //   // margin-top: 8px;
          // }
        }
      }
      .outline-div {
        box-sizing: border-box;
        min-height: 200px;
        margin-top: 10px;
        padding: 18px 24px 18px 22px;
        background: rgba(244, 244, 244, 0.6);
        .content-header {
          display: flex;
          align-items: center;
          .flex1 {
            flex: 1;
            margin-left: 10px;
            font-weight: 700;
            font-size: 18px;
            color: var(--theme-primary);
          }
          img {
            width: 24px;
            height: 24px;
          }
        }
      }
    }

    .btn-div {
      display: flex;
      justify-content: center;
      .generate-btn {
        width: 249px;
        height: 51px;
        margin: 40px auto 0 auto;
        border-radius: 51px;
        background: linear-gradient(111deg, #605cfb 0%, #4594f9 100%);
        font-weight: 600;
        font-size: 20px;
        :deep(.loading) {
          margin-right: 12px;
        }
        .iconfont {
          margin-right: 12px;
          font-size: 18px;
        }
        &.is-disabled {
          background: linear-gradient(111deg, rgba(96, 92, 251, 0.5) 0%, rgba(69, 148, 249, 0.5) 100%);
          cursor: not-allowed;
        }
      }
    }
    .example-div {
      position: relative;
      box-sizing: border-box;
      margin-top: 39px;
      padding: 24px 28px;
      border: 1px solid #fff;
      border-radius: 16px;
      background: linear-gradient(180deg, rgba(54, 112, 248, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
      header {
        img {
          width: 96px;
        }
      }
      ul {
        z-index: 2;
        margin-top: 15px;
        font-size: 16px;
        li {
          cursor: pointer;
          line-height: 30px;
          font-size: 20px;
          color: #656566;
          &:hover {
            color: var(--theme-primary);
          }
        }
      }
    }
  }
}
.customContainer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 12px;
  padding: 16px;
  background: rgba(244, 244, 244, 0.6);
  :deep(.el-range-input) {
    font-size: 18px;
  }
  &.CUSTOM5 {
    :deep(.el-form-item) {
      box-sizing: border-box;
      width: 50%;
      margin-bottom: 24px !important;
      padding-right: 47px;
      &:nth-of-type(2n) {
        padding-right: 0;
      }
      &:nth-last-of-type(1) {
        margin-bottom: 0 !important;
      }
    }
  }

  .noticeText {
    margin-left: 12px;
    line-height: 17px;
    font-weight: 400;
    font-size: 12px;
    color: #ff4e4e;
    white-space: nowrap;
  }
}
:deep(.el-form-item__label-wrap) {
  margin-left: 0 !important;
}
.specialForm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  .el-form-item {
    box-sizing: border-box;
    width: calc(50% + 22px);
    margin-bottom: 16px !important;
    padding-right: 44px;
    &:nth-of-type(2n) {
      width: calc(50% - 22px);
      padding-right: 0;
    }
  }
}
.noticeContaienr {
  box-sizing: border-box;
  width: 100%;
  margin-top: 18px;
  padding: 10px  32px;
  border: 1px solid rgba(245, 159, 12, 0.5);
  border-radius: 2px;
  background: rgba(245, 159, 12, 0.05);
  span {
    display: block;
    position: relative;
    line-height: 20px;
    font-weight: 400;
    font-size: 18px;
    color: var(--theme-text);
    &::before {
      position: absolute;
      left: -12px;
      top: 50%;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #f59f0c;
      content: '';
      transform: translateY(-50%);
    }
    &:nth-of-type(2) {
      margin-top: 8px;
    }
  }
}
</style>
<style lang="scss">
.el-input__count-inner {
  font-size: 16px;
}
 </style>
