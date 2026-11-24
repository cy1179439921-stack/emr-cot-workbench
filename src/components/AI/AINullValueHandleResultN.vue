<template>
  <div class="data-cleansing">
    <div class="mainContainer">
      <div class="leftPanel">
        <div class="title marginT0">
          <p>
            <span></span>
            <span>选择变量</span>
          </p>
          <p @click="allBtn">
            <i class="iconfont icon-piliang"></i>
            <span> {{isSingleVarible ? '批量处理' : '退出批量处理'}}</span>
          </p>
        </div>
        <div class="description choiceVariables">
          <div class="variableSelectionContainer">
            <variableSelection
              ref="variableSelectionRef"
              dataType="2"
              :filteredList="filteredList"
              :titleObj="titleObj"
              :colNumber="colNumber"
              @handleChange="handleChange"
              :defaultArr="currentList"
              :initDataList="dataList"
              :showTag="true"
              :isBatch="!isSingleVarible"
              :disabledTypeArr="[0,2]"
              sourceType="空值处理"
              showToolTip
            >
            </variableSelection>
          </div>
          <div class="chartContainer" v-if="isSingleVarible">
            <div class="title">
              <p>
                <span></span>
                <span>数据视图</span>
              </p>
              <p @click="downloadGraph" v-if="isShowCharts">
                <i class="iconfont icon-daochu2"></i>
                <span>下载</span>
              </p>
            </div>
            <div class="chartBox" id="echartBox">
              <commonEchartsTitle :xAxisName="xAxisName" :yAxisName="yAxisName" v-if="isShowCharts">
                <common-echarts ref="echarsDom" :showExtension="true" :option="echartsOptions"></common-echarts>
              </commonEchartsTitle>
              <echartsEmpty v-else></echartsEmpty>
            </div>
          </div>
        </div>
      </div>
      <div class="rightPanel">
        <div class="dataInfoContainer">
          <div class="title" v-if="metricName && isSingleVarible" style="margin-top: 0;">
            <p>
              <span></span>
              <span>变量空值信息</span>
            </p>
          </div>
          <div class="dataInfoBox">
            <div class="tableContainer"
                 v-if="metricName && isSingleVarible">
              <el-table
                :border="true"
                :data="dataInfo"
                align="center"
              >
                <el-table-column
                  prop="nullNum"
                  label="空值数量"
                  :min-width="pxToRem(80)"
                >
                </el-table-column>
                <el-table-column
                  prop="totalNum"
                  label="全部数量"
                  :min-width="pxToRem(80)"
                >
                </el-table-column>
                <el-table-column
                  prop="nullProportion"
                  label="当前空值比例"
                  :min-width="pxToRem(116)"
                >
                </el-table-column>
              </el-table>
            </div>
            <!-- <div class="title" v-if="(metricName && countNan != 0 && nullFlag === 1) || !isSingleVarible"> -->
            <div class="title marginT16" v-if="(metricName && countNan != 0 && nullFlag === 1) || !isSingleVarible">
              <p>
                <span></span>
                <span>变量空值处理方法</span>
              </p>
            </div>
            <el-form
              v-if="(metricName && countNan != 0 && nullFlag === 1) || !isSingleVarible"
              ref="ruleForm"
              :model="formData"
              :rules="rules"
              :class="isSingleVarible ? '' : 'demo-ruleForm'">
              <el-form-item label="处理方法" prop="operateMethod">
                <el-select
                  v-model="formData.operateMethod"
                  placeholder="请选择一项"
                  @change="changePaddingMethod"
                >
                  <el-option
                    v-for="item in optionsMap[isSingleVarible ? dateType :'1' ]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="填充方法"
                prop="paddingMethod"
                v-if="['statisticsFill', 'ruleFill'].includes(formData.operateMethod)"
              >
                <el-select
                  v-model="formData.paddingMethod"
                  placeholder="请选择一项"
                >
                  <el-option
                    v-for="item in paddingOptionsMap[formData.operateMethod]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="填充数值"
                prop="paddingNumber"
                oninput="value=value.replace(/[^\d.]/g,'')"
                v-if="formData.paddingMethod === 'custom' && formData.operateMethod === 'ruleFill'"
              >
                <el-input
                  type="number"
                  v-model.trim="formData.paddingNumber"
                  placeholder="请填写内容"
                ></el-input>
              </el-form-item>
              <el-collapse v-if="['returnFill'].includes(formData.operateMethod) && !isSingleVarible">
                <el-collapse-item
                  title="因变量"
                  name="1"
                >
                  <span
                    v-for="item in currentList"
                    :key="item"
                  >{{ item }},</span
                  >
                </el-collapse-item>
              </el-collapse>
              <el-form-item
                label="自变量（无缺失）"
                prop="independentVariable"
                v-if="['returnFill'].includes(formData.operateMethod)"
                key="iii"
              >
                <el-select
                  v-model="formData.independentVariable"
                  placeholder="请选择一项"
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  :fit-input-width="true"
                >
                  <el-checkbox-group v-model="formData.independentVariable">
                    <div
                      v-for="(item, index) in argumentFill"
                      :key="index"
                    >
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
                    </div>
                  </el-checkbox-group>
                </el-select>
              </el-form-item>
              <el-form-item
                label="选择已有变量填充"
                prop="paddingMethod"
                v-if="(formData.operateMethod === 'fill')"
              >
                <el-select
                  v-model="formData.paddingMethod"
                  placeholder="请选择一项"
                >
                  <el-option
                    v-for="item in qualitativePaddingOptios"
                    :key="item"
                    :label="item"
                    :value="item"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <!-- <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取 消</el-button>
          <loading-btn
            type="primary"
            v-if="isSingleVarible"
            :disabled="!currentVisibleObj.nullFlag"
            @handleSubmit="handleSure(ruleForm)"
            ref='loadingBtnDom1'
          >
            保 存
          </loading-btn>
          <loading-btn
            type="primary"
            v-if="!isSingleVarible"
            :disabled="!currentList?.length"
            @handleSubmit="handleSure(ruleForm)"
            ref='loadingBtnDom2'
          >
            批量保存
          </loading-btn>
        </div>
      </template> -->
  </div>
</template>

<script setup>
defineOptions({
  name: 'nullValueHandleResultN'
})
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import variableSelection from '@/components/dataAnalysis/engineeringLibrary/common/variableSelection.vue'
import commonEchartsTitle from '@/components/dataAnalysis/engineeringLibrary/common/commonEchartsTitle.vue'
import echartsEmpty from '@/components/dataAnalysis/engineeringLibrary/common/echartsEmpty.vue'
import { useDataFilterHook } from '@/hooks/dataFilterHook.js'
import { verticalBarChartBasicOption, histogramChartBasicOption } from '@/components/dataAnalysis/engineeringLibrary/common/echartsConfig.js'
import { getAllVariables, getChartData, getNullValueInfo, saveNullValueInfo } from '@/api/api_dataAnalysis'
import { nowDate } from '@/utils/utils.js'
import lodash, { isArray } from 'lodash'
import html2canvas from 'html2canvas'
import fileDownload from 'js-file-download'
const emits = defineEmits(['updateList', 'handleClose', 'clearJumpData'])
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
const rules = reactive({
  operateMethod: [
    { required: true, message: '请选择处理方法', trigger: 'change' }
  ],
  paddingMethod: [
    { required: true, message: '请选择填充方法', trigger: 'change' }
  ],
  paddingNumber: [
    { required: true, message: '请填写填充数值', trigger: 'blur' }
  ],
  independentVariable: [
    { required: true, message: '请选择自变量', trigger: 'change' }
  ],
  qualitativePadding: [
    { required: true, message: '请选择已有变量填充', trigger: 'change' }
  ]
})
const echarsDom = ref(null)
const colNumber = ref('')
const variableSelectionRef = ref(null)
const dataOperateIdValue = ref(props.engineeringInfo.dataOperateId)
const echartsData = ref([])
const dateType = ref('')
const isSingleVarible = ref(true)
const nullFlag = ref(0)
const metricName = ref('')
const currentVisibleObj = ref({})
const currentList = ref([])
const xAxisName = ref('')
const yAxisName = ref('')
const selectedViewIndex = ref(null)
const countNan = ref(0)
const argumentFill = ref([])
const qualitativePaddingOptios = ref([])
const viewList = ref([])
const paddingOptionsMap = ref({
  statisticsFill: [
    { value: 'fill_with_mean', label: '均值填充' },
    { value: 'fill_with_median', label: '中位数填充' },
    { value: 'fill_with_3sigma', label: '三倍标准差填充' },
    { value: 'fill_with_3sigma_negative', label: '负三倍标准差填充' },
    { value: 'fill_with_mode', label: '众数填充' },
    { value: 'fill_with_0', label: '0值填充' }
  ],
  ruleFill: [
    { value: 'custom', label: '固定值填充' },
    { value: 'previous', label: '空值前边值填充' },
    { value: 'next', label: '空值后边值填充' }
  ],
  returnFill: [
    { value: '1', label: 'Checkbox1' },
    { value: '2', label: 'Checkbox2' },
    { value: '3', label: 'Checkbox3Checkbox3Checkbox3' }
  ]
})
const optionsMap = ref({
  1: [
    { value: 'statisticsFill', label: '统计量填充' },
    { value: 'ruleFill', label: '规则填充' },
    { value: 'returnFill', label: '回归填充' },
    { value: 'multipleImputation', label: '多重插补' },
    { value: 'randomForestFill', label: '随机森林填充' },
    { value: 'delete', label: '删除空值所在行' },
    { value: 'SpecialDelete', label: '删除缺失值所在变量' }
  ],
  0: [
    { value: 'fill', label: '填充' },
    { value: 'delete', label: '删除空值所在行' },
    { value: 'SpecialDelete', label: '删除缺失值所在变量' }
  ]
})

const typeToViewList = {
  0: [
    { name: '柱状图', icon: 'iconfont icon-releatu-01', type: 'verticalBarChartBasicOption' }
  ],
  1: [
    { name: '直方图', icon: 'iconfont icon-zhuzhuangtu', type: 'barCategoryGap' }
  ]
}
const formData = ref({
  operateMethod: '',
  paddingMethod: '',
  paddingNumber: '',
  independentVariable: [],
  qualitativePadding: ''
  // tagList: ''
})
const isReconciliation = ref(false)
if (props.jumpData) {
  const result = lodash.get(props.jumpData, 'params')
  const initParams = JSON.parse(result)
  dataOperateIdValue.value = props.jumpData?.pid
  isSingleVarible.value = lodash.get(initParams, 'input_conditions.isSingleVarible')
  formData.value = lodash.cloneDeep(lodash.get(initParams, 'input_conditions.formData'))
  if (isSingleVarible.value) {
    currentVisibleObj.value = lodash.get(initParams, 'input_conditions.currentVisibleObj', {})
    colNumber.value = currentVisibleObj.value.colNumber
  } else {
    isReconciliation.value = true
    currentList.value = lodash.get(initParams, 'input_conditions.currentList', [])
  }
}

const {
  echartsOptions,
  filteredList
} = useDataFilterHook()
const dataInfo = ref([])
// 需要传入的数据
const dataList = ref([])
const isShowCharts = ref(false)
const getDataVisibleFn = () => {
  const params = {
    colId: currentVisibleObj.value.colId,
    operateId: dataOperateIdValue.value
  }
  getChartData(params).then(res => {
    if (res.code !== 10000) {
      isShowCharts.value = false
      return
    }
    isShowCharts.value = true
    echartsData.value = lodash.get(res, 'data.view') || []

    updateViewList()
  })
}

const updateViewList = () => {
  viewList.value = typeToViewList[dateType.value] || []
  selectedViewIndex.value = 0
  if (viewList.value.length > 0) {
    handleViewChange(viewList.value[0], 0)
  }
}

const getNullValueInfoFn = () => {
  qualitativePaddingOptios.value = []
  return new Promise((resolve) => {
    const params = {
      colId: currentVisibleObj.value.colId,
      dataOperateId: dataOperateIdValue.value
    }
    getNullValueInfo(params).then(res => {
      if (res.code === 10000) {
        res.data.nullProportion = ((res.data.nullProportion || 0) * 100).toFixed(2) + '%'
        dataInfo.value = [res.data]
        countNan.value = 1
      } else {
        countNan.value = 0
        dataInfo.value = []
      }
      // countNan.value = res.data.nullNum
      qualitativePaddingOptios.value = res.data?.alreadyExistsValueList || []
      resolve()
    })
  })
}

const handleAxisName = (chartsType) => {
  if (['linesChartsOption', 'scatterChartsOption'].includes(chartsType)) {
    xAxisName.value = '索引项'
    yAxisName.value = metricName.value
  } else {
    xAxisName.value = metricName.value
    yAxisName.value = '样本量'
  }
}

const handleViewChange = (item, index) => {
  selectedViewIndex.value = index
  handleAxisName()
  const xAxisData = []
  const yAxisData = []
  // formData.value.tagList = ''
  switch (item.type) {
    case 'verticalBarChartBasicOption':
      echartsData.value.barData.forEach(item => {
        xAxisData.push(item.name)
        yAxisData.push(item.value)
      })
      echartsOptions.value = verticalBarChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: dateType.value
        }
      )
      // formData.value.tagList = echartsData.value.m
      break
    case 'barCategoryGap':
      echartsData.value.groupData.xaxis.forEach(item => {
        xAxisData.push(item)
      })
      echartsData.value.groupData.yaxis.forEach(item => {
        yAxisData.push(item)
      })
      echartsOptions.value = histogramChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: dateType.value
        }
      )
      // formData.value.dataType = echartsData.value.dataType === 0 ? 'int' : 'float'
      break
  }
}

const handleChange = async (obj, isInitiative) => {
  if (props.jumpData && !isInitiative && isSingleVarible.value) {
    dateType.value = currentVisibleObj.value.dataProperty
    metricName.value = currentVisibleObj.value.label
    if (!currentVisibleObj.value.nullFlag) {
      nullFlag.value = 0
    } else {
      nullFlag.value = 1
    }
    getDataVisibleFn()
    getNullValueInfoFn()
    return
  } else if (!isSingleVarible.value && !isArray(obj) && !isInitiative) {
    currentVisibleObj.value = obj
    dateType.value = obj.dataProperty
    colNumber.value = obj.colNumber
    metricName.value = obj.label
    if (!obj.nullFlag) {
      nullFlag.value = 0
    } else {
      nullFlag.value = 1
    }
    getDataVisibleFn()
    // updateViewList()
    getNullValueInfoFn()
    return
  }
  if (props.jumpData && !isSingleVarible.value && isReconciliation.value) {
    if (!isArray(obj)) {
      return
    }
    isReconciliation.value = false
    return
  }

  if (isSingleVarible.value && !isArray(obj)) {
    currentVisibleObj.value = obj
  } else if (!isSingleVarible.value && isArray(obj)) {
    currentList.value = obj
  }

  if ('dataProperty' in obj) {
    dateType.value = obj.dataProperty
    colNumber.value = obj.colNumber
    metricName.value = obj.label
    if (!obj.nullFlag) {
      nullFlag.value = 0
    } else {
      nullFlag.value = 1
    }
    getDataVisibleFn()
    getNullValueInfoFn()
    formData.value.operateMethod = ''
    formData.value.paddingMethod = ''
    formData.value.paddingNumber = ''
    formData.value.qualitativePadding = ''
    ruleForm.value?.clearValidate()
  }
}

const ruleForm = ref(null)
const loadingBtnDom1 = ref()
const loadingBtnDom2 = ref()
// eslint-disable-next-line no-unused-vars
const handleSure = async(formEl) => {
  if (!ruleForm.value) {
    ElMessage.error('请选择处理方法')
    return
  }
  await ruleForm.value.validate(async(valid, fields) => {
    if (valid) {
      const type = formData.value.operateMethod
      let ConfirmType = ''
      if (['delete', 'SpecialDelete'].includes(type)) {
        ConfirmType = '删除'
      } else if (type === 'multipleImputation') {
        ConfirmType = '多重插补'
      } else {
        ConfirmType = '填充'
      }
      ElMessageBox.confirm(
        `${ConfirmType}将直接作用到当前数据集上`,
        `${ConfirmType}`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          type: 'warning'
        }
      )
        .then(async () => {
          const paramsValue = {
            colIdList: [currentVisibleObj.value.colId],
            dataOperateId: dataOperateIdValue.value,
            bigGroup: '数据整理',
            smallGroup: '空值处理',
            params: {
              process_method: formData.value.operateMethod,
              paddingNumber: formData.value.paddingNumber,
              independent_variable: formData.value.independentVariable,
              method: formData.value.paddingMethod,
              qualitativePadding: formData.value.qualitativePadding,
              field: [{ metric: metricName.value, metric_type: dateType.value }]
            }
          }

          if (isSingleVarible.value) {
            paramsValue.params.metric_name = metricName.value
          } else {
            const metricList = []
            const colIdArr = []
            dataList.value.forEach(item => {
              if (currentList.value.includes(item.label)) {
                metricList.push({
                  metric: item.label,
                  metric_type: item.dataProperty
                })
                colIdArr.push(item.colId)
              }
            })
            paramsValue.params.metric_list = metricList.map(item => item.metric)
            paramsValue.params.field = metricList
            paramsValue.colIdList = colIdArr
          }
          paramsValue.params.input_conditions = {
            isSingleVarible: isSingleVarible.value,
            currentList: currentList.value,
            currentVisibleObj: currentVisibleObj.value,
            formData: formData.value
          }
          saveNullValueInfo(paramsValue).then(res => {
            console.log('res', res)
            if (res.code === 10000) {
              emits('clearJumpData')
              ElMessage.success('操作成功')
              dataOperateIdValue.value = res.data.dataOperateId

              if (lodash.get(res.data, 'colNumberList[0]')) {
                getListData(lodash.get(res.data, 'colNumberList[0]'))
              } else {
                getListData(lodash.get(dataList.value, '[0].colNumber', ''), false)
              }

              variableSelectionRef.value?.clearSelection()
              currentList.value = []
              // 重新获取变量信息
              getNullValueInfoFn()
              emits('updateList', dataList.value)
            }
          })
          // emits('updateList', dataList.value)
          // handleClose()
        })
        .catch(() => {
          loadingBtnDom1.value?.handleLoading()
          loadingBtnDom2.value?.handleLoading()
        })
    } else {
      loadingBtnDom1.value?.handleLoading()
      loadingBtnDom2.value?.handleLoading()
    }
    emits('updateList', dataList.value)
  })
}

const handleName = () => {
  return `${props.engineeringInfo?.name}_空值处理_${metricName.value}_${nowDate(new Date())}`
}

const downloadGraph = (type) => {
  const el = document.getElementById('echartBox')
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

// const getListData = () => {
//   // 过滤掉type为2的变量不要
//   getAllVariables({ id: dataOperateIdValue.value }).then(v => {
//     if (v.code === 10000 && v.data.length > 0) {
//       dataList.value = v.data.filter(item => item.dataProperty !== 2)
//       argumentFill.value = v.data.filter(item => item.dataProperty === 1 && item.nullFlag === false)
//       dateType.value = dataList.value[0].dataProperty
//     }
//   })
// }

const getListData = async (newColNumber, type = true) => {
  getAllVariables({ id: dataOperateIdValue.value }).then(v => {
    if (v.code === 10000 && v.data.length > 0) {
      dataList.value = v.data.filter(item => item.dataProperty !== 2)
      argumentFill.value = v.data.filter(item => item.dataProperty === 1 && item.nullFlag === false)
      dateType.value = dataList.value[0].dataProperty
      if (newColNumber && type) {
        colNumber.value = newColNumber
      } else if (newColNumber && !type && dataList.value.length) {
        colNumber.value = dataList.value[0].colNumber
      }
    }
  })
}

// const getNullValueInfo = () => {
//   otherData.value = [
//     {
//       metric_name: 'sex',
//       data_nan_information_table: {
//         count_nan: 5,
//         count_value: 157,
//         nan_persent: 0.03184713375796178
//       },
//       metric_cls_enumerate: [
//         {
//           label: '18',
//           value: '0'
//         },
//         {
//           label: '24',
//           value: '1'
//         },
//         {
//           label: '34',
//           value: '2'
//         },
//         {
//           label: '28',
//           value: '3'
//         }
//       ]
//     },
//     {
//       metric_name: 'BMI',
//       data_nan_information_table: {
//         count_nan: 10,
//         count_value: 157,
//         nan_persent: 0.06369426751592357
//       }
//     },
//     {
//       metric_name: 'Group',
//       data_nan_information_table: {
//         count_nan: 0,
//         count_value: 157,
//         nan_persent: 0.12738853503184713
//       }
//     },
//     {
//       metric_name: 'ASA',
//       data_nan_information_table: {
//         count_nan: 0,
//         count_value: 157,
//         nan_persent: 0
//       }
//     }
//   ]
//   metricName.value = otherData.value[0].metric_name
//   countNan.value = otherData.value[0].data_nan_information_table.count_nan
//   qualitativePaddingOptios.value = otherData.value[0].metric_cls_enumerate
// }
const theOriginalForm = ref({})
const switchFormdata = () => {
  const newFormData = lodash.cloneDeep(theOriginalForm.value)
  theOriginalForm.value = lodash.cloneDeep(formData.value)
  formData.value = newFormData
}
const allBtn = () => {
  switchFormdata()
  isSingleVarible.value = !isSingleVarible.value
  if (isSingleVarible.value) {
    // variableSelectionRef.value?.clearSelection()
    updateViewList()
  }
}

// 选择处理方法
const changePaddingMethod = (val) => {
  formData.value.paddingMethod = ''
  formData.value.paddingNumber = ''
  formData.value.independentVariable = []
  formData.value.qualitativePadding = ''
}

defineExpose({
  handleSure
})

const init = () => {
  const { selectColumn } = props.titleObj
  getListData(selectColumn?.colNumber)
}

init()
</script>

<style scoped lang="scss">
@use '@/style/common/dataCleansing.scss';
.data-cleansing {
  :deep(.leftPanel) {
    width: 65% !important;
    .dataNameContent {
      max-width: 440px !important;
    }
  }

  .mainContainer {
    .rightPanel {
      .dataInfoContainer {
        .dataInfoBox {
          display: flex;
          flex-direction: column;
          flex: 1;
          height: 0;
          .tableContainer {
            box-sizing: border-box;
            padding: 16px;
            border: 1px solid #e8e8e8;
            border-radius: 2px;
            .el-table__empty-block {
              border-bottom: 1px solid #e8e8e8;
            }
            .el-table__empty-text {
              font-size: 12px;
            }
          }
          .el-table {
            .el-table__header-wrapper {
              height: 34px;
              .el-table__header {
                height: 34px !important;
                tr {
                  th {
                    // height: 34px;
                    padding: 0;
                    font-size: 12px;
                    color: var(--theme-text);
                    .cell {
                      justify-content: center;
                      // height: 34px !important;
                      padding: 0;
                      font-weight: 600;
                      color: var(--theme-text);
                    }
                  }
                }
              }
            }
            .el-table__body-wrapper {
              min-height: inherit;
              .el-table__row {
                // height: 32px;
                td {
                  // height: 34px;
                  padding: 0;
                }
                .cell {
                  justify-content: center;
                  min-height: 32px !important;
                  padding: 0;
                  font-weight: 400;
                  font-size: 12px;
                  color: var(--theme-text);
                }
              }
            }
          }
          .el-form {
            flex: 1;
            box-sizing: border-box;
            padding: 16px;
            border: 1px solid #e8e8e8;
            border-radius: 2px;
            .el-form-item {
              flex-direction: column;
            }
            .el-collapse {
              margin-bottom: 16px;
            }
            .el-form-item__label {
              justify-content: flex-start;
              height: 14px;
              margin-bottom: 16px;
              font-weight: 500;
              font-size: 14px;
              color: var(--theme-text);
            }
          }
          .demo-ruleForm {
            height: 509px;
          }
        }
      }
    }
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
  width: 369px;
}
.toolTipContent-other {
  max-width: 200px;
}
.titleContainer {
  display: flex;
  align-items: center;
}
.headerIcon {
  margin-left: 8px;
  color: var(--theme-text-3);
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
</style>

