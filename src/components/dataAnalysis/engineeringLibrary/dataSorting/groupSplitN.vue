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
            <div class="download" @click="handleDownload">
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
            <commonSubTitle text="对照组编辑">
            </commonSubTitle>
          </div>
          <div class="paramsF">
            <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="rules"
              label-width="0"
            >
              <el-form-item label="" prop="newMetricName">
                <div class="paramsItem">
                  <div class="label">对照组名称</div>
                  <el-input class="paramsInput" maxlength="60" v-model.trim="ruleForm.newMetricName"></el-input>
                </div>
              </el-form-item>
              <el-form-item label="" prop="codeType">
                <div class="paramsItem">
                  <div class="label">对照组编码类型</div>
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
              <el-form-item label="" prop="type">
                <div class="paramsItem">
                  <div class="label">自动随机分组方法</div>
                  <el-select
                    v-model="ruleForm.type"
                    placeholder="请选择一项"
                    class="paramsSelect"
                  >
                    <el-option
                      v-for="item in groupSplitOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
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
            生成并保存
          </el-button> -->
          <loading-btn
            type="primary"
            @handleSubmit="handleSure"
            ref='loadingBtnDom'
          >
            生成并保存
          </loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>

</template>
<script setup>
import { onMounted, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { histogramChartBasicOption, verticalBarChartBasicOption } from '../common/echartsConfig.js'
import { groupSplitOptions } from '../../utils/commonData.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { nowDate } from '@/utils/utils.js'
import { getAllVariables, groupSplitN, getChartData } from '@/api/api_dataAnalysis.js'
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
const handleChange = (obj, isInitiative) => {
  if (!isInitiative && props.jumpData && reconciliationFlag.value) {
    const result = lodash.get(props.jumpData, 'params')
    const initParams = JSON.parse(result)
    ruleForm.value.newMetricName = initParams.new_metric_name
    ruleForm.value.codeType = initParams.cut_type
    ruleForm.value.type = initParams.type
    currentVar.value = initParams.currentVar
    metricName.value = currentVar.value.label
    reconciliationFlag.value = false
  } else {
    ruleFormRef.value.resetFields()
    currentVar.value = obj
    metricName.value = obj.label
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
    label: '数字',
    value: 'number'
  },
  {
    label: '字符串',
    value: 'str'
  }
])
const metricName = ref('')
const ruleForm = ref({
  newMetricName: '',
  codeType: '',
  type: ''
})
const rules = reactive({
  newMetricName: [
    { required: true, message: '请填写', trigger: 'blur' },
    { max: 60, message: '最长60字符', trigger: 'blur' }
  ],
  codeType: { required: true, message: '请选择', trigger: 'change' },
  type: { required: true, message: '请选择', trigger: 'change' }
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
      const params = {
        cut_type: ruleForm.value.codeType,
        new_metric_name: ruleForm.value.newMetricName,
        ori_metric_name: metricName.value,
        type: ruleForm.value.type,
        colNumber: currentVar.value.colNumber,
        currentVar: currentVar.value,
        field: [
          {
            metric: currentVar.value.label,
            metric_type: currentVar.value.dataProperty
          }
        ]
      }
      groupSplitN({
        bigGroup: '数据整理',
        smallGroup: '对照组切分',
        colId: currentVar.value.colId,
        dataOperateId: dataOperateId.value,
        params
      }).then(res => {
        if (res.code === 10000) {
          ElMessage.success('操作成功')
          dataOperateId.value = res.data.dataOperateId
          // getChartDataFn()
          ruleFormRef.value.resetFields()
          getDataList(res.data.colNumber)
          emits('updateDataOperateId', res.data.dataOperateId)
        }
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
    const initParams = JSON.parse(result)
    dataOperateId.value = props.jumpData?.pid
    colNumber.value = initParams.colNumber
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
