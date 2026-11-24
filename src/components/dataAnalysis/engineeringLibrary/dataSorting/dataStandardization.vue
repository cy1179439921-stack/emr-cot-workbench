<template>
  <div class="data-cleansing">
    <el-dialog v-model="dialogVisible" :width="pxToRem(1035)" destroy-on-close :before-close="handleClose">
      <template #header>
        <el-tooltip class="box-item" effect="dark" placement="bottom-start">
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
            <commonSubTitle text="选择变量"></commonSubTitle>
            <p @click="allBtn" class="allBtn">
              <i class="iconfont icon-piliang"></i>
              <span> {{isSingleVarible ? '批量处理' : '退出批量处理'}}</span>
            </p>
          </div>
          <div class="variableSelectionContainer">
            <variableSelection
              ref="variableSelectionRefDom"
              :filteredList="filteredList"
              :titleObj="titleObj"
              dataType="1"
              :showTag="false"
              :colNumber="currentVar.colNumber"
              @handleChange="handleChange"
              :initDataList="dataList"
              showToolTip
              :isBatch="!isSingleVarible"
              :defaultArr="crrentVarList"
            >
            </variableSelection>
          </div>
          <template v-if="isSingleVarible">
            <div class="subTitleContainer chartsSubtitle">
              <commonSubTitle text="数据视图"></commonSubTitle>
              <div class="download" @click="handleDownload(xAxisName)" v-if="isShowCharts">
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
          </template>
        </div>
        <div class="line"></div>
        <div class="paramsContainer">
          <commonSubTitle text="标准化编辑"></commonSubTitle>
          <el-form ref="formRef" :model="formData" :rules="rules">
            <div class="nameBox">
              <el-form-item label="标准化方法" prop="normalizationMethodName">
                <el-select v-model="formData.normalizationMethodName" clearable placeholder="请选择一项">
                  <template v-for="(item) in selectOptions" :key="item.value">
                    <el-option :label="item.label" :value="item.value"></el-option>
                  </template>
                </el-select>
                <template v-slot:label>
                  <div class="alignCenter">
                    <span>变换方法</span>
                    <el-tooltip placement="top">
                      <template #content>
                        <span v-html="msgTip"></span>
                      </template>
                      <i class="iconfont icon-querentishi headerIcon"></i>
                    </el-tooltip>
                  </div>
                </template>
              </el-form-item>
              <div class="horizontalArrangement">
                <span class="dataTransformationParameters">输出形式</span>
                <el-form-item label="生成新变量" prop="replace">
                  <el-switch v-model="formData.replace" :active-value="0" :inactive-value="1"/>
                  <el-tooltip content="若关闭此选项，则数据处理结果将覆盖原数据。" placement="top">
                    <i class="iconfont icon-querentishi headerIcon"></i>
                  </el-tooltip>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取 消</el-button>
          <loading-btn type="primary" @handleSubmit="saveDataFilterFn" ref='loadingBtnDom' :disabled="!isSingleVarible && crrentVarList.length === 0">{{ isSingleVarible ? '保存' : '批量保存' }}</loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { useDataConversionResultNHook } from '@/hooks/dataConversionResultN.js'
import { ElMessage } from 'element-plus'
import { dataStandardizationFn } from '@/api/api_dataAnalysis.js'
// import lodash from 'lodash'

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

// 变化方法选项提示信息
const msgTip = computed(() => {
  return selectOptions.find(item => item.value === formData.value.normalizationMethodName)?.msg || ''
})
// 变化方法选项
const selectOptions = [
  { value: 'array_minmax', label: 'Min-Max标准化', msg: '1.公式为：（X-min）/ （max-min），其中X是数据点，max、min分别是是样本中最大值、最小值 <br/> 2.作用：对原始数据的线性变换，使结果落到[0,1]区间。' },
  { value: 'Zscore', label: 'Z-score标准化', msg: '1.Z标准化(S)公式为：Z = (X - μ) / σ，其中X 是数据点， μ是平均值，σ是标准差 <br/> 2.Z-score标准化是一种线性变换方法，旨在调整数据的分布，使其均值为0，标准差为1' }
]

const rules = {
}

const formRef = ref(null) // 表单ref
const formData = ref({ // 表单数据
  normalizationMethodName: 'array_minmax',
  replace: 0
})
const loadingBtnDom = ref(null) // 保存按钮ref
const xAxisName = ref('')
const yAxisName = ref('样本量')
const dialogVisible = ref(true)
const isSingleVarible = ref(true) // 是否单体操作
const { dataOperateId, currentVar, filteredList, dataList, crrentVarList, echartsOptions, getChartsDataFn, getDataList, handleDownload, isShowCharts } = useDataConversionResultNHook(formData, props)

// 批量处理按钮
const allBtn = async () => {
  isSingleVarible.value = !isSingleVarible.value
  if (isSingleVarible.value) {
    // await getDataVisibleFn()
    // updateViewList()
  }
}

// 变量选择变化
const handleChange = (obj) => {
  console.log('handleChange', obj)
  if (Array.isArray(obj)) {
    crrentVarList.value = obj
  } else {
    currentVar.value = obj
    xAxisName.value = obj.label
    getChartsDataFn({
      colId: obj.colId,
      operateId: dataOperateId.value
    })
  }
  formRef.value?.resetFields()
}

const variableSelectionRefDom = ref(null)

onMounted(() => {
  // 判断是否从数据查看跳转过来的
  const { selectColumn } = props.titleObj
  if (selectColumn) {
    currentVar.value = selectColumn
  }

  // 判断详情跳转过来的
  if (props.jumpData) {
    const { pid, params } = props.jumpData
    const { inputConditions } = JSON.parse(params)
    dataOperateId.value = pid
    formData.value = inputConditions.formData
    crrentVarList.value = inputConditions.crrentVarList
    currentVar.value = inputConditions.currentVar
    nextTick(() => {
      isSingleVarible.value = inputConditions.isSingleVarible
    })
  } else {
    dataOperateId.value = props.engineeringInfo?.dataOperateId
  }
  nextTick(() => {
    getDataList()
  })
})

const saveDataFilterFn = () => {
  if (isSingleVarible.value) {
    const { nullFlag, label } = currentVar.value
    if (nullFlag) {
      ElMessage.error(`变量${label}包含空值，请先进行空值处理`)
      return
    }
  } else {
    const filterList = dataList.value.filter(item => crrentVarList.value.includes(item.label) && item.nullFlag)
    if (filterList.length !== 0) {
      ElMessage.error(`变量${filterList.map(item => item.label).join(',')}包含空值，请先进行空值处理`)
    }
  }

  const params = {
    colIdList: [currentVar.value.colId],
    dataOperateId: dataOperateId.value,
    inputConditions: {
      isSingleVarible: isSingleVarible.value,
      formData: formData.value,
      crrentVarList: crrentVarList.value,
      currentVar: currentVar.value
    },
    fieldList: [{ metric: currentVar.value.label, metricType: currentVar.value.dataProperty }],
    normalizationMethodName: formData.value.normalizationMethodName,
    replace: formData.value.replace
  }
  if (!isSingleVarible.value) {
    const filterList = dataList.value.filter(item => crrentVarList.value.includes(item.label))
    params.colIdList = filterList.map(item => item.colId)
    params.fieldList = filterList.map(item => ({ metric: item.label, metricType: item.dataProperty }))
  }

  console.log(params)
  formRef.value?.validate(async (valid) => {
    if (valid) {
      dataStandardizationFn(params).then(res => {
        if (res.code === 10000) {
          dataOperateId.value = res.data.dataOperateId
          if (!formData.value.replace) {
            ElMessage.success('操作成功,已生成新变量')
          } else {
            ElMessage.success('操作成功,已覆盖原数据')
          }

          getDataList(isSingleVarible.value ? res.data.colNumberList[0] : null)
          emits('updateDataOperateId', res.data.dataOperateId)
        }
      })
    } else {
      loadingBtnDom.value.handleLoading()
    }
  })
}

const handleClose = (done) => {
  emits('handleClose')
  if (done) {
    done()
  }
}

watch(dataOperateId, (val, oldVal) => {
  if (oldVal) {
    emits('updateDataOperateId', val)
  }
})
</script>
  <style scoped lang="scss">
@use '@/style/common/dataAanlysisCommon.scss';
:deep(.el-overlay-dialog) {
  .el-dialog {
    display: flex;
    flex-direction: column;
    height: 691px;
  }
}
.paramsContainer {
  flex: 1;
  .nameBox {
    box-sizing: border-box;
    min-height: 94px;
    margin-top: 16px;
    padding: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 2px;
    .el-form-item {
      flex-direction: column;
      &:nth-last-child(1) {
        margin-bottom: 0;
      }
      :deep(.el-form-item__label) {
        justify-content: left;
        height: 14px;
        margin-bottom: 16px;
        line-height: 14px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
    .horizontalArrangement {
      display: flex;
      flex-direction: column;
      .dataTransformationParameters {
        margin-bottom: 16px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
      .el-form-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        :deep(.el-form-item__label) {
          margin-bottom: 0;
        }
        :deep(.el-form-item__content) {
          flex-wrap: nowrap;
        }
        .el-input-number {
          width: auto;
        }
      }
    }
    .alignCenter {
      display: flex;
      align-items: center;
    }
  }
}
.subTitleContainer {
  display: flex;
  position: relative;
  align-items: center;
  margin-bottom: 16px;
}
  </style>
