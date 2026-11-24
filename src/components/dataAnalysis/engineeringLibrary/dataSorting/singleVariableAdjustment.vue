<template>
  <div class="data-cleansing">
    <el-dialog
      v-model="dialogVisible"
      :width="pxToRem(1035)"
      destroy-on-close
      :before-close="handleClose"
    >
      <template #header>
        <el-tooltip
          class="box-item"
          effect="dark"
          placement="bottom-start"
        >
          <div class="titleContainer">
            <span>{{titleObj.name}}</span>
            <i class="iconfont icon-querentishi headerIcon"></i>
          </div>
          <template #content>
            <div class="toolTipContent">
              {{ titleObj.explain }}
            </div>
          </template>
        </el-tooltip>
      </template>
      <div class="content">
        <div class="main">
          <div class="subTitleContainer mainHeader">
            <commonSubTitle text="选择变量">
            </commonSubTitle>
            <!-- <div @click="handleSwitch" class="switchContainer">
              <i class="iconfont icon-piliang"></i>
              <span>{{ !isBatch?'批量处理':'退出批量处理' }}</span>
            </div> -->
          </div>
          <div class="variableSelectionContainer">
            <variableSelection
              ref="variableSelectionDom"
              dataType="1"
              :isBatch="isBatch"
              :colNumber="colNumber"
              :titleObj="titleObj"
              @handleChange="handleChange"
              :initDataList="dataList"
              showToolTip
            >
            </variableSelection>
          </div>
          <div class="subTitleContainer chartsSubtitle" v-if="!isBatch">
            <commonSubTitle text="数据视图">
            </commonSubTitle>
            <div class="download" @click="handleDownload" v-if="isShowCharts">
              <i class="iconfont icon-daochu2"></i>
              <span>下载</span>
            </div>
          </div>
          <div class="chartsContainer" id="chartBox" v-if="!isBatch">
            <commonEchartsTitle :xAxisName="xAxisName" :yAxisName="yAxisName" v-if="isShowCharts">
              <common-echarts ref="echarsDom" :showExtension="true" :option="echartsOptions"></common-echarts>
            </commonEchartsTitle>
            <echartsEmpty v-else></echartsEmpty>
          </div>
        </div>
        <div class="line"></div>
        <div class="paramsContainer">
          <div class="subTitleContainer">
            <commonSubTitle text="单变量编辑">
            </commonSubTitle>
          </div>
          <div class="paramsF">
            <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="rules"
              label-width="0"
            >
              <el-form-item label="" prop="codeType">
                <div class="paramsItem">
                  <div class="label">变换方法</div>
                  <el-select
                    v-model="ruleForm.codeType"
                    placeholder="请选择一项"
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
              <!-- <el-form-item label="" prop="weighted" v-if="ruleForm.codeType===2">
                <div class="paramsItem">
                  <div class="label">加权</div>
                  <el-input-number
                      v-no-e
                    class="paramsInput"
                    v-model="ruleForm.weighted"
                    :controls="false"
                    :max="1"
                    :min="0.001"
                    :precision="3"
                    placeholder="请填写内容">
                  </el-input-number>
                </div>
              </el-form-item> -->
              <el-form-item label="" prop="referenceTimeColId">
                <div class="paramsItem">
                  <div class="label">基准时间</div>
                  <el-select
                    class="paramsSelect"
                    v-model="ruleForm.referenceTimeColId"
                    :fit-input-width="true"
                    placeholder="请选择一项"
                  >
                    <template v-for="item in timeGroupList"
                              :key="item.value">
                      <el-option
                        :label="item.label"
                        :value="item.colId"
                      >
                        <div style="width: 100%;" v-show-tip>
                          <el-tooltip
                            class="box-item"
                            effect="dark"
                            :content="item.label"
                            placement="bottom"
                            :open-delay="400"
                            :enterable="false"
                            :hide-after="0"
                          >
                            <div class="treeLabel" style="max-width: 100%;">{{item.label}}</div>
                          </el-tooltip>
                        </div>
                      </el-option>
                    </template>
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取&nbsp;消</el-button>
          <!-- <el-button type="primary" @click="handleSure">
            确&nbsp;定
          </el-button> -->
          <loading-btn
            type="primary"
            @handleSubmit="handleSure"
            ref='loadingBtnDom'
          >
            确&nbsp;定
          </loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>

</template>
<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { histogramChartBasicOption, verticalBarChartBasicOption } from '../common/echartsConfig.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { nowDate } from '@/utils/utils.js'
import { getAllVariables, getChartData, singleVariableAdjustmentFn } from '@/api/api_dataAnalysis.js'
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
const dialogVisible = ref(true)
const handleClose = (done) => {
  emits('handleClose')
  if (done) {
    done()
  }
}
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
const isBatch = ref(false) // 是否多选
const handleChange = (obj, isInitiative) => {
  if (!isInitiative && props.jumpData && reconciliationFlag.value) {
    const result = lodash.get(props.jumpData, 'params')
    const initParams = JSON.parse(result)
    ruleForm.value = lodash.get(initParams, 'inputConditions.ruleForm')
    reconciliationFlag.value = false
  } else {
    ruleFormRef.value.resetFields()
    currentVar.value = obj
    metricName.value = obj.label
    ruleForm.value.newMetricName = obj.label
  }
  getChartDataFn()
}
// eslint-disable-next-line no-unused-vars
const handleSwitch = () => {
  console.log('切换')
  isBatch.value = !isBatch.value
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
    label: '简单相加聚合',
    value: 1
  }
  // {
  //   label: '加权相加聚合',
  //   value: 2
  // },
  // {
  //   label: '中位数聚合',
  //   value: 3
  // },
  // {
  //   label: '众数聚合',
  //   value: 4
  // },
  // {
  //   label: '移动平均聚合',
  //   value: 5
  // },
  // {
  //   label: '分位数聚合',
  //   value: 6
  // }
])
const metricName = ref('')
const ruleForm = ref({
  newMetricName: '',
  codeType: '',
  referenceTimeColId: '',
  weighted: ''
})
const rules = reactive({
  newMetricName: [
    { required: true, message: '请填写', trigger: 'blur' },
    { max: 60, message: '最长60字符', trigger: 'blur' }
  ],
  codeType: { required: true, message: '请选择', trigger: 'change' },
  referenceTimeColId: { required: true, message: '请选择基准时间', trigger: 'change' },
  weighted: { required: true, message: '请填写权重', trigger: 'blur' }
})
const ruleFormRef = ref(null)
const variableSelectionDom = ref(null)
const colNumber = ref('')
const { selectColumn } = props.titleObj
if (selectColumn) {
  colNumber.value = selectColumn.colNumber
}
const timeGroupList = computed(() => {
  return dataList.value.filter(item => (item.codomainType === 5 || item.codomainType === 6))
})
// ref([
//   {
//     label: '时间变量1',
//     value: 1
//   },
//   {
//     label: '时间变量2',
//     value: 2
//   }
// ])
const loadingBtnDom = ref()
const handleSure = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      ElMessageBox.confirm(`单变量调整结果将直接作用到当前数据集上`, '提示', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        console.log('进行数据请求')
        const params = {
          colId: currentVar.value.colId,
          inputConditions: {
            ruleForm: ruleForm.value,
            currentVar: currentVar.value
          },
          operateId: dataOperateId.value,
          referenceTimeColId: ruleForm.value.referenceTimeColId
        }
        singleVariableAdjustmentFn(params).then(res => {
          if (res.code === 10000) {
            ElMessage.success('操作成功')
            dataOperateId.value = res.data.dataOperateId
            ruleFormRef.value.resetFields()
            getDataList(currentVar.value.colNumber)
            emits('updateDataOperateId', res.data.dataOperateId)
          } else {
            console.log('失败')
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
    } else {
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
    // eslint-disable-next-line no-unused-vars
    const initParams = JSON.parse(result)
    dataOperateId.value = props.jumpData?.pid
    currentVar.value = lodash.get(initParams, 'inputConditions.currentVar')
    colNumber.value = currentVar.value.colNumber
  } else {
    dataOperateId.value = props.engineeringInfo?.dataOperateId
  }
  getDataList()
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
  width: 630px;
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
    .mainHeader {
      display: flex;
      align-items: center;
      .switchContainer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex: 1;
        cursor: pointer;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-primary);
        .iconfont {
          margin-right: 8px;
          font-size: 14px;
        }
      }
    }
    .chartsContainer {
      width: 630px;
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
      width: 309px;
      padding: 16px;
      border: 1px solid #e8e8e8;
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
          margin-bottom: 16px;
          line-height: 14px;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
          word-break: keep-all;
        }
        .paramsSelect,
        .paramsInput {
          flex: 1;
          width: 100%;
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
