<template>
  <div class="data-cleansing AI">
    <div class="content">
      <div class="main leftPanel">
        <div class="subTitleContainer">
          <commonSubTitle text="选择变量">
          </commonSubTitle>
        </div>
        <div class="variableSelectionContainer">
          <variableSelection
            ref="variableSelectionDom"
            dataType="2"
            :colNumber="colNumber"
            :titleObj="titleObj"
            @handleChange="handleChange"
            :initDataList="dataList"
            showToolTip
          >
          </variableSelection>
        </div>
        <div class="subTitleContainer chartsSubtitle">
          <commonSubTitle text="数据视图">
          </commonSubTitle>
          <div class="download" @click="handleDownload" v-if="isShowCharts">
            <i class="iconfont icon-daochu2"></i>
            <span>下载</span>
          </div>
        </div>
        <div class="chartsContainer" id="chartBox">
          <commonEchartsTitle :xAxisName="xAxisName" :yAxisName="yAxisName" v-if="isShowCharts">
            <common-echarts ref="echarsDom" :showExtension="true" :option="echartsOptions"></common-echarts>
          </commonEchartsTitle>
          <echartsEmpty v-else></echartsEmpty>
        </div>
      </div>
      <div class="line"></div>
      <div class="paramsContainer">
        <div class="subTitleContainer">
          <commonSubTitle text="抽样编辑">
          </commonSubTitle>
        </div>
        <div class="paramsF">
          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="rules"
            label-width="0"
          >
            <el-form-item label="" prop="samplingType">
              <div class="paramsItem">
                <div class="label">
                  <span>抽样方法</span>
                  <el-tooltip>
                    <span>
                      <i class="iconfont icon-querentishi introductionIcon"></i>
                    </span>
                    <template #content>
                      <div class="toolTipContent">
                        {{ methodIntroduction }}
                      </div>
                    </template>
                  </el-tooltip>
                </div>
                <el-select
                  v-model="ruleForm.samplingType"
                  placeholder="请选择一项"
                  @change="handleChangeMethond"
                  class="paramsSelect"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </div>
            </el-form-item>
            <el-form-item label="" prop="newMetricName" v-if="ruleForm.samplingType===1">
              <div class="paramsItem">
                <div class="label">分层变量</div>
                <el-input class="paramsInput" maxlength="60" disabled v-model.trim="ruleForm.newMetricName"></el-input>
              </div>
            </el-form-item>
            <el-form-item label="" prop="sampleQuantity" v-if="ruleForm.samplingType===1">
              <div class="paramsItem">
                <div class="label">分层类别数量</div>
                <div class="samplingRatio">
                  <el-input-number
                    v-no-e
                    :disabled="currentVar.dataProperty!==1"
                    class="paramsInput"
                    :max="maxQuantity"
                    :min="1"
                    :precision="0"
                    placeholder="请填写内容"
                    v-model.trim="ruleForm.sampleQuantity"
                  >
                  </el-input-number>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="" prop="samplingRatio" v-if="ruleForm.samplingType===1||ruleForm.samplingType===3">
              <div class="paramsItem">
                <div class="label">抽样比例</div>
                <div class="samplingRatio">
                  <el-input-number
                    v-no-e
                    class="paramsInput samplingRatioInput"
                    :max="100"
                    :min="0"
                    :precision="0"
                    placeholder="请填写内容"
                    :controls="false"
                    v-model.trim="ruleForm.samplingRatio"
                  >
                  </el-input-number>
                  <span>%</span>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="" prop="newMetricName" v-if="ruleForm.samplingType===2">
              <div class="paramsItem">
                <div class="label">群组依据变量</div>
                <el-input class="paramsInput" maxlength="60" disabled v-model.trim="ruleForm.newMetricName"></el-input>
              </div>
            </el-form-item>
            <el-form-item label="" prop="numberOfGroups" v-if="ruleForm.samplingType===2">
              <div class="paramsItem">
                <div class="label">群组数量</div>
                <div class="samplingRatio">
                  <el-input-number
                    v-no-e
                    :disabled="currentVar.dataProperty!==1"
                    class="paramsInput"
                    :max="maxQuantity"
                    :min="1"
                    :precision="0"
                    placeholder="请填写内容"
                    v-model.trim="ruleForm.numberOfGroups"
                  >
                  </el-input-number>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="" prop="numberOfSampleGroups" v-if="ruleForm.samplingType===2">
              <div class="paramsItem">
                <div class="label">抽样群数（小于等于输入的群组数量）</div>
                <div class="samplingRatio">
                  <el-input-number
                    v-no-e
                    class="paramsInput"
                    :max="ruleForm.numberOfGroups||1"
                    :min="1"
                    :precision="0"
                    placeholder="请填写内容"
                    v-model.trim="ruleForm.numberOfSampleGroups"
                  >
                  </el-input-number>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <!-- <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取&nbsp;消</el-button>
          <loading-btn
            type="primary"
            @handleSubmit="handleSure"
            ref='loadingBtnDom'
          >
            确&nbsp;定
          </loading-btn>
        </div>
      </template> -->
  </div>

</template>
<script setup>
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import variableSelection from '@/components/dataAnalysis/engineeringLibrary/common/variableSelection.vue'
import commonEchartsTitle from '@/components/dataAnalysis/engineeringLibrary/common/commonEchartsTitle.vue'
import echartsEmpty from '@/components/dataAnalysis/engineeringLibrary/common/echartsEmpty.vue'
import { histogramChartBasicOption, verticalBarChartBasicOption } from '@/components/dataAnalysis/engineeringLibrary/common/echartsConfig.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { nowDate } from '@/utils/utils.js'
import { getAllVariables, getChartData, proportionalSamplingFn } from '@/api/api_dataAnalysis.js'
import lodash from 'lodash'

const emits = defineEmits(['handleClose', 'updateDataOperateId'])

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
  },
  jumpData: {
    type: [Object, String],
    default: () => {
      return ''
    }
  }
})
// 需要传入的数据
const dataList = ref([])
const getDataList = (val) => {
  getAllVariables({ id: dataOperateId.value }).then(v => {
    dataList.value = v.data || []
    if (val) {
      colNumber.value = val
    }
  })
}
const dataOperateId = ref('')
const currentVar = ref({})
const reconciliationFlag = ref(false)
const handleChange = (obj, isInitiative) => {
  if (!isInitiative && props.jumpData && reconciliationFlag.value) {
    const result = lodash.get(props.jumpData, 'params')
    const { inputConditions } = JSON.parse(result)
    currentVar.value = inputConditions.currentVar
    metricName.value = currentVar.value.label
    delete inputConditions.currentVar
    ruleForm.value = { ...inputConditions }
  } else {
    ruleFormRef.value.resetFields()
    currentVar.value = obj
    metricName.value = obj.label
    ruleForm.value.samplingType = 1
    handleChangeMethond(ruleForm.value.samplingType)
    ruleForm.value.newMetricName = obj.label
  }
  getChartDataFn()
}
const echarsDom = ref(null)
const handleName = () => {
  // 工程名称_变量名_数据视图_年月日时分秒
  return `${props.engineeringInfo?.name}_${props.titleObj.name}_${metricName.value}_${nowDate(new Date())}`
}
const handleDownload = () => {
  const el = document.getElementById('chartBox')
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
const options = ref([
  {
    label: '分层抽样',
    value: 1,
    introduction: '分层抽样是一种精确且广泛应用的抽样方法，用于从总体中抽取样本以保证样本具有代表性与简单随机抽样不同，分层抽样在抽样前将总体划分为多个子群体(称为分层)，然后在每个子群体内分别抽取样本。这种方法尤其适用于总体具有显著内部差异的情况。'
  },
  {
    label: '整群抽样',
    value: 2,
    introduction: '整群抽样是一种常用的概率抽样方法，主要适用于总体规模较大且难以直接获取所有个体信息的研究场景。其核心逻辑是将总体按照某种特定标准划分为若干个“群组”，然后随机抽取部分群组作为样本，并对选中群组内的个体进行数据收集和分析，以推断总体特征。整群抽样的抽样单位是群组，而非单个个体，这显著降低了抽样成本和实施难度。'
  },
  {
    label: '简单随机抽样',
    value: 3,
    introduction: '简单随机抽样是一种基础且常用的抽样方法。在这种方法中，总体中的每个个体或元素都有相等的概率被选中，从而确保样本的随机性和代表性。这种方法广泛应用于调查研究和统计推断中，能够避免抽样偏差，提供对总体特征的无偏估计。'
  }
])
const methodIntroduction = ref('')
const handleChangeMethond = (val) => {
  const index = lodash.findIndex(options.value, { value: val })
  if (index > -1) {
    const obj = options.value[index]
    methodIntroduction.value = obj.introduction
  }
  if (!currentVar.value.dataProperty) {
    ruleForm.value.numberOfGroups = maxQuantity.value
  }
  ruleForm.value.samplingRatio = null
}
const metricName = ref('')
const ruleForm = ref({
  newMetricName: '',
  samplingType: '',
  type: '',
  samplingRatio: null,
  numberOfGroups: null,
  numberOfSampleGroups: null
})
const handleNumberOfSampleGroups = (rule, value, callback) => {
  if (ruleForm.value.numberOfGroups) {
    if (ruleForm.value.numberOfGroups >= ruleForm.value.numberOfSampleGroups) {
      callback()
    } else {
      callback(new Error('抽样群数应小于等于输入的群组数量'))
    }
  } else {
    callback()
  }
}
const rules = reactive({
  newMetricName: [
    { required: true, message: '请填写', trigger: 'blur' },
    { max: 60, message: '最长60字符', trigger: 'blur' }
  ],
  samplingType: { required: true, message: '请选择', trigger: 'change' },
  type: { required: true, message: '请选择', trigger: 'change' },
  sampleQuantity: { required: true, message: '请填写抽样类别数量', trigger: 'blur' },
  samplingRatio: { required: true, message: '请填写抽样比例', trigger: 'blur' },
  numberOfGroups: { required: true, message: '请填写群组数量', trigger: 'blur' },
  numberOfSampleGroups: [
    { required: true, message: '请填写抽样群数', trigger: 'blur' },
    { validator: handleNumberOfSampleGroups, trigger: 'blur' }
  ]
})
const ruleFormRef = ref(null)
const variableSelectionDom = ref(null)
const colNumber = ref('')
const { selectColumn } = props.titleObj
if (selectColumn) {
  colNumber.value = selectColumn.colNumber
}
const loadingBtnDom = ref()
const handleSure = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      ElMessageBox.confirm(`抽样结果将直接作用到当前数据集上`, '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        proportionalSamplingFn({
          // bigGroup: '数据整理',
          // smallGroup: '对照组切分',
          // colId: currentVar.value.colId,
          // dataOperateId: dataOperateId.value,
          // params
          colId: currentVar.value.colId,
          inputConditions: {
            ...ruleForm.value,
            currentVar: currentVar.value
          },
          operateId: dataOperateId.value,
          samplingType: ruleForm.value.samplingType,
          samplingRatio: ruleForm.value.samplingRatio,
          samplingGroupNum: ruleForm.value.numberOfSampleGroups,
          sumGroupNum: ruleForm.value.samplingType === 1 ? ruleForm.value.sampleQuantity : ruleForm.value.numberOfGroups
        }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('操作成功')
            dataOperateId.value = res.data.dataOperateId
            // getChartDataFn()
            ruleFormRef.value.resetFields()
            getDataList(currentVar.value.colNumber)
            emits('updateDataOperateId', res.data.dataOperateId)
          }
        })
      }).catch(() => {
        loadingBtnDom.value.handleLoading()
      })
    } else {
      loadingBtnDom.value.handleLoading()
    }
  })
}

const echartsOptions = ref({})
const xAxisName = ref('')
const yAxisName = ref('')
const isShowCharts = ref(false)
const maxQuantity = ref(1)
const getChartDataFn = () => {
  getChartData({
    colId: currentVar.value.colId,
    operateId: dataOperateId.value,
    params: []
  }).then(res => {
    if (res.code !== 10000) {
      isShowCharts.value = false
      return
    }
    isShowCharts.value = true
    xAxisName.value = metricName.value
    yAxisName.value = '样本量'
    if (!currentVar.value.dataProperty) {
      const data = lodash.get(res, 'data.view.barData', [])
      const xAxisData = []
      const yAxisData = []
      data.forEach(item => {
        xAxisData.push(item.name)
        yAxisData.push(item.value)
      })
      echartsOptions.value = verticalBarChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: currentVar.value.dataProperty
        }
      )
      maxQuantity.value = lodash.get(res, 'data.view.typeCount', 1)
      ruleForm.value.sampleQuantity = lodash.get(res, 'data.view.typeCount', '')
    } else {
      maxQuantity.value = lodash.get(res, 'data.totalNum', 1)
      echartsOptions.value = histogramChartBasicOption(
        {
          xAxisData: lodash.get(res, 'data.view.groupData.xaxis', []),
          yAxisData: lodash.get(res, 'data.view.groupData.yaxis', []),
          type: currentVar.value.dataProperty
        }
      )
    }
  })
}
onMounted(() => {
  if (props.jumpData) {
    reconciliationFlag.value = true
    const result = lodash.get(props.jumpData, 'params')
    const { inputConditions } = JSON.parse(result)
    dataOperateId.value = props.jumpData?.pid
    colNumber.value = inputConditions.currentVar.colNumber
  } else {
    dataOperateId.value = props.engineeringInfo?.dataOperateId
  }
  getDataList()
})
defineExpose({
  handleSure
})
</script>
<style scoped lang="scss">
@use '@/style/element/analysisCommon.scss';
.data-cleansing {
  :deep(.el-overlay-dialog) {
    .el-dialog {
      display: flex;
      flex-direction: column;
      height: 691px;
    }
  }
}
:deep(.commonSubTitle .commonSubTitleText) {
  line-height: 20px;
  font-size: 14px;
}
.description {
  height: 94px;
  :deep(textarea) {
    height: 94px;
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
  max-width: 370px;
}
.variableSelectionContainer {
  overflow: hidden;
  flex: 1;
  // width: 630px;
  height: 0;
  .dataNameContent {
    max-width: 500px !important;
  }
}
.titleContainer {
  display: flex;
  align-items: center;
}
.headerIcon {
  margin-left: 8px;
  color: var(--theme-text-3);
}
.content {
  display: flex;
  height: 100%;
  .main {
    display: flex;
    flex-direction: column;
    .subTitleContainer {
      margin-top: 16px;
      &:nth-of-type(1) {
        margin-top: 0;
      }
      &.chartsSubtitle {
        margin-bottom: 12px;
      }
      .download {
        flex: 1;
        cursor: pointer;
        text-align: right;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-primary);
        .iconfont {
          margin-right: 8px;
          font-size: 13px;
        }
      }
    }
    .chartsContainer {
      // width: 630px;
      height: 215px;
    }
  }
  .line {
    width: 0;
    margin: 0 24px;
    border-left: 1px solid #e8e8e8;
  }
  .paramsContainer {
    flex: 1;
    .paramsF {
      box-sizing: border-box;
      // width: 309px;
      // padding: 16px;
      // border: 1px solid #e8e8e8;
      border-radius: 2px;
      :deep(.el-form-item) {
        margin-bottom: 16px;
        &:nth-last-of-type(1) {
          margin-bottom: 0;
        }
      }
      .paramsItem {
        display: flex;
        flex-direction: column;
        width: 100%;
        .label {
          display: flex;
          align-items: center;
          width: auto;
          margin-bottom: 16px;
          line-height: 14px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
          // word-break: keep-all;
          .introductionIcon {
            margin-left: 5px;
            font-size: 12px;
            color: var(--theme-text-3);
          }
        }
        .samplingRatio {
          display: flex;
          align-items: center;
          span {
            margin-left: 5px;
            line-height: 14px;
            font-weight: 400;
            font-size: 14px;
            color: var(--theme-text);
          }
          :deep(.samplingRatioInput.el-input-number .el-input__inner) {
            text-align: left;
          }
        }
        .paramsSelect,
        .paramsInput {
          flex: 1;
        }
      }
    }
  }
  .subTitleContainer {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
}
.paramsF {
  overflow: hidden;
  border-radius: 2px;
}
</style>
