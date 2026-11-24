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
          <el-scrollbar >
            <div class="subTitleContainer">
              <commonSubTitle text="变量编辑">
              </commonSubTitle>
            </div>
            <div class="paramsF">
              <el-form
                ref="ruleFormRef"
                :model="ruleForm"
                :rules="rules"
                label-width="0"
              >
                <el-form-item label="" prop="transformationMethod">
                  <div class="paramsItem">
                    <div class="label">变换方法</div>
                    <el-select
                      v-model="ruleForm.transformationMethod"
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
                <el-form-item label="" prop="independentVar" v-if="ruleForm.transformationMethod==='lag'||ruleForm.transformationMethod==='Autoregression'">
                  <div class="paramsItem">
                    <div class="label">自变量</div>
                    <el-select
                      class="mulSelect"
                      v-model="ruleForm.independentVar"
                      multiple
                      clearable
                      collapse-tags
                      :fit-input-width="true"
                      collapse-tags-tooltip
                      placeholder="请选择一项"
                    >
                      <template v-for="item in independentVarList"
                                :key="item.value">
                        <el-option
                          v-if="item.colNumber!==currentVar.colNumber"
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
                <el-form-item label="" prop="maximumLagOrder" v-if="ruleForm.transformationMethod==='lag'">
                  <div class="paramsItem">
                    <div class="label">最大滞后阶数</div>
                    <el-input-number
                      v-no-e
                      class="paramsInput"
                      v-model="ruleForm.maximumLagOrder"
                      :controls="false"
                      :max="5"
                      :min="1"
                      :precision="0"
                      placeholder="请填写内容">
                    </el-input-number>
                  </div>
                </el-form-item>
                <el-form-item label="" prop="arLags" v-if="ruleForm.transformationMethod==='Autoregression'">
                  <div class="paramsItem">
                    <div class="label">自回归阶数(p)</div>
                    <el-input-number
                      v-no-e
                      class="paramsInput"
                      v-model="ruleForm.arLags"
                      :controls="false"
                      :max="5"
                      :min="1"
                      :precision="0"
                      placeholder="请填写内容">
                    </el-input-number>
                  </div>
                </el-form-item>
                <el-form-item label="" prop="distributedLagOrder" v-if="ruleForm.transformationMethod==='Autoregression'">
                  <div class="paramsItem">
                    <div class="label">分布滞后阶数(q)</div>
                    <el-input-number
                      v-no-e
                      class="paramsInput"
                      v-model="ruleForm.distributedLagOrder"
                      :controls="false"
                      :max="5"
                      :min="1"
                      :precision="0"
                      placeholder="请填写内容">
                    </el-input-number>
                  </div>
                </el-form-item>
                <el-form-item label="" prop="model" v-if="ruleForm.transformationMethod==='lag'||ruleForm.transformationMethod==='Autoregression'">
                  <div class="paramsItem">
                    <div class="label">模型</div>
                    <el-select
                      v-model="ruleForm.model"
                      placeholder="请选择一项"
                      class="paramsSelect"
                    >
                      <el-option
                        v-for="item in modelList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </div>
                </el-form-item>
                <el-form-item label="" prop="orderOfLag" v-if="ruleForm.transformationMethod==='Vector Autoregression'">
                  <div class="paramsItem">
                    <div class="label">滞后阶数(q)</div>
                    <el-input-number
                      v-no-e
                      class="paramsInput"
                      v-model="ruleForm.orderOfLag"
                      :controls="false"
                      :max="5"
                      :min="1"
                      :precision="0"
                      placeholder="请填写内容">
                    </el-input-number>
                  </div>
                </el-form-item>

                <el-form-item label="" prop="method" v-if="ruleForm.transformationMethod==='Vector Autoregression'">
                  <div class="paramsItem">
                    <div class="label">方法</div>
                    <el-select
                      class="mulSelect"
                      v-model="ruleForm.method"
                      :fit-input-width="true"
                      placeholder="请选择一项"
                    >
                      <template v-for="item in methodList"
                                :key="item.value">
                        <el-option
                          :label="item.label"
                          :value="item.value"
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
                <el-form-item label="">
                  <el-button type="primary" @click="handleTrain">
                    训&nbsp;练
                  </el-button>
                </el-form-item>
                <el-form-item label="" v-if="isShowTable">
                  <dynamicTable
                    :class="tableObj.tableClassName"
                    :className="tableObj.tableClassName"
                    :border="true"
                    :table-data="tableObj.tableData"
                    :table-header="tableObj.tableHeader"
                    :needFlexColumnWidth="tableObj.needFlexColumnWidth"
                    :columnMerge="tableObj.columnMerge"
                    :columnMergeArr="tableObj.columnMergeArr"
                    :columnIndexArr="tableObj.columnIndexArr"
                    :endMergeRowIndex="tableObj.endMergeRowIndex"
                    :lastRowNeedMerge="tableObj.lastRowNeedMerge"
                    :mergeTr="tableObj.mergeTr">
                  </dynamicTable>
                </el-form-item>
              </el-form>
            </div>
          </el-scrollbar>
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
import dynamicTable from '@/components/dataAnalysis/common/dynamicTable2.vue'
import { histogramChartBasicOption, verticalBarChartBasicOption } from '../common/echartsConfig.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { nowDate } from '@/utils/utils.js'
import { getAllVariables, getChartData, lagAdjustTrainFn, lagAdjustFn } from '@/api/api_dataAnalysis.js'
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
const modelList = ref([
  {
    label: '普通最小二乘法模型（OLS）',
    value: 'OLS'
  }
])
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
const independentVarList = computed(() => {
  return dataList.value.filter(item => (item.dataProperty === 1))
})
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
// const handleSwitch = () => {
//   console.log('切换')
//   isBatch.value = !isBatch.value
// }
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
    label: '分布滞后模型',
    value: 'lag'
  },
  {
    label: '自回归分布滞后模型',
    value: 'Autoregression'
  }
  // {
  //   label: '向量自回归模型',
  //   value: 'Vector Autoregression'
  // }
])
const methodList = ref([
  {
    label: '广义矩估计（GMM）',
    value: 'GMM'
  },
  {
    label: '极大似然估计（MLE）',
    value: 'MLE'
  },
  {
    label: '贝叶斯估计',
    value: 'BAYESIAN'
  }
])
const metricName = ref('')
const ruleForm = ref({
  newMetricName: '',
  transformationMethod: '',
  dependentVar: '',
  independentVar: [],
  model: '',
  maximumLagOrder: null,
  arLags: null,
  distributedLagOrder: null,
  orderOfLag: null,
  method: ''
})
const rules = reactive({
  newMetricName: [
    { required: true, message: '请填写', trigger: 'blur' },
    { max: 60, message: '最长60字符', trigger: 'blur' }
  ],
  transformationMethod: { required: true, message: '请选择', trigger: 'change' },
  dependentVar: { required: true, message: '请选择基准时间', trigger: 'change' },
  weighted: { required: true, message: '请填写权重', trigger: 'blur' },
  independentVar: { required: true, message: '请选择自变量', trigger: 'change' },
  maximumLagOrder: { required: true, message: '请填写最大滞后阶数', trigger: 'blur' },
  arLags: { required: true, message: '请填写自回归阶数', trigger: 'blur' },
  distributedLagOrder: { required: true, message: '请填写分布滞后阶数', trigger: 'blur' },
  orderOfLag: { required: true, message: '请填写滞后阶数', trigger: 'blur' },
  model: { required: true, message: '请选择模型', trigger: 'blur' },
  method: { required: true, message: '请选择方法', trigger: 'blur' }
})
const ruleFormRef = ref(null)
const variableSelectionDom = ref(null)
const colNumber = ref('')
const { selectColumn } = props.titleObj
if (selectColumn) {
  colNumber.value = selectColumn.colNumber
}
const tableObj = ref({
  tableHeader: [
    {
      label: '模型检验统计量',
      prop: '',
      children: [
        {
          label: '',
          prop: 'name'
        },
        {
          label: '系数估计值',
          prop: 'beta'
        },
        {
          label: '标准误差',
          prop: 'std'
        },
        {
          label: 't值',
          prop: 't'
        },
        {
          label: 'p值',
          prop: 'p'
        }
      ]
    }
  ],
  tableData: [],
  tableClassName: 'customTable',
  needFlexColumnWidth: true
})
const handleParams = () => {
  // 奇葩的参数组合,凑齐就行了,别纠结
  const colIdList = lodash.cloneDeep(ruleForm.value.independentVar) || []
  colIdList.push(currentVar.value.colId)
  const independentVarArr = []
  ruleForm.value.independentVar.forEach(item => {
    const index = lodash.findIndex(dataList.value, { colId: item })
    if (index >= 0) {
      independentVarArr.push(dataList.value[index].label)
    }
  })
  const params = {
    arLags: ruleForm.value.arLags,
    colIdList,
    dataOperateId: dataOperateId.value,
    dependentVar: currentVar.value.label,
    independentVar: independentVarArr,
    drLag: ruleForm.value.transformationMethod === 'lag' ? ruleForm.value.maximumLagOrder : (ruleForm.value.transformationMethod === 'Autoregression' ? ruleForm.value.distributedLagOrder : ruleForm.value.orderOfLag),
    modelName: ruleForm.value.transformationMethod !== 'Vector Autoregression' ? ruleForm.value.model : ruleForm.value.method,
    fieldList: [
      {
        metric: currentVar.value.label,
        metricType: currentVar.value.dataProperty
      }
    ],
    inputConditions: {
      ruleForm: ruleForm.value,
      currentVar: currentVar.value
    },
    transformationMethod: ruleForm.value.transformationMethod
  }
  return params
}
const isShowTable = ref(false)
const handleTrain = () => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      const params = handleParams()
      lagAdjustTrainFn(params).then(res => {
        if (res.code === 10000) {
          isShowTable.value = true
          tableObj.value = {
            tableHeader: [
              {
                label: '模型检验统计量',
                prop: '',
                children: [
                  {
                    label: '',
                    prop: 'name'
                  },
                  {
                    label: '系数估计值',
                    prop: 'beta'
                  },
                  {
                    label: '标准误差',
                    prop: 'std'
                  },
                  {
                    label: 't值',
                    prop: 't'
                  },
                  {
                    label: 'p值',
                    prop: 'p'
                  }
                ]
              }
            ],
            tableData: lodash.get(res, 'data.result.table_res', []).reverse(),
            tableClassName: 'customTable',
            needFlexColumnWidth: true
          }
        } else {
          isShowTable.value = false
        }
      })
    }
  })
}
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
        const params = handleParams()
        lagAdjustFn(params).then(res => {
          console.log('滞后调整结果', res)
          if (res.code === 10000) {
            ElMessage.success('操作成功')
            dataOperateId.value = res.data.dataOperateId
            ruleFormRef.value.resetFields()
            getDataList(res.data.colNumber)
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
        :deep(.el-input-number .el-input__inner) {
          text-align: left;
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
.treeLabel {
  overflow: hidden; /* 隐藏溢出内容 */
  flex: 1;
  line-height: 20px;
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
}
:deep(.surroundingTableBorder) {
  .el-table__header,
  .el-table__body {
    min-width: 100%;
  }
  .el-table__header {
    height: auto;
  }
  .el-table__body tr>td:nth-child(1) .cell,
  .el-table__header thead tr th .cell {
    font-weight: 600;
    font-size: 12px;
    color: var(--theme-text);
  }
  .el-table__body tr>td.hover-cell {
    background-color: inherit;
  }
  .el-table__body tr:hover > td {
    background-color: inherit;
  }
  .el-table__body tr.hover-row>td.el-table__cell {
    background-color: inherit;
  }
  .el-table__cell {
    padding: 7px 0;
    .cell {
      min-height: 20px !important;
      line-height: 20px !important;
    }
  }
  th,
  td {
    color: var(--theme-text);
    white-space: nowrap;
    .cell {
      justify-content: center;
      padding: 0;
    }
  }
  thead {
    tr th {
      background-color: var(--theme-card) !important;
      .cell {
        font-weight: 600;
      }
    }

    & > tr:nth-child(1) {
      th {
        background: rgba(54, 112, 248, 0.05) !important;
        .cell {
          text-align: center;
          font-weight: 600;
          color: var(--theme-primary);
        }
      }
    }
  }

  th,
  td {
    text-align: center;
  }

  tr {
    color: #070707;
  }

  &::before {
    bottom: initial;
  }
}
.customTable {
  .el-table__body {
    tr {
      td:nth-child(1) {
        .cell {
          font-weight: 600;
          color: var(--theme-primary);
        }
      }
    }
  }
}

</style>
