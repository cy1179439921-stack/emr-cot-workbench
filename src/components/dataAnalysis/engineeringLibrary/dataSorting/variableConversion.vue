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
          <commonSubTitle text="变换编辑"></commonSubTitle>
          <el-form ref="formRef" :model="formData" :rules="rules">
            <div class="nameBox">
              <el-form-item label="变换方法" prop="type">
                <el-select v-model="formData.type" clearable placeholder="请选择一项">
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
              <div class="horizontalArrangement" v-if="[5].includes(formData.type)">
                <span class="dataTransformationParameters">数据变换参数</span>
                <el-form-item label="Lambda值" prop="lambdaValue" v-if="formData.type === 5">
                  <el-input-number
                    v-no-e v-model.number="formData.lambdaValue" controls-position="right"></el-input-number>
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
import { useDataConversionResultNHook } from '@/hooks/dataConversionResultN.js'
import { ElMessage } from 'element-plus'
import { variableTransformFn } from '@/api/api_dataAnalysis.js'
import echartsEmpty from '../common/echartsEmpty.vue'
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

const loadingBtnDom = ref(null)
// 变化方法选项提示信息
const msgTip = computed(() => {
  return selectOptions.find(item => item.value === formData.value.type)?.msg || ''
})

// 变化方法选项
const selectOptions = [
  { value: 1, label: '自然对数（ln）变换', msg: '常用于处理正偏态数据、使乘法关系线性化等情况；' },
  { value: 2, label: '以10为底对数（log）变换', msg: '常用于处理正偏态数据、使乘法关系线性化等情况' },
  { value: 3, label: '平方根变换', msg: '用于当数据存在泊松分布特征且方差与均值相关、不符合分析中方差齐性等要求时，通过平方根变换可在一定程度上稳定方差、改善数据分布情况，使其更符合统计分析假设；' },
  { value: 4, label: '倒数变换', msg: '常用于当变量与其他变量间呈现反比例关系的情形，通过倒数变换将反比例关系转化为线性关系，方便后续用线性统计模型进行拟合分析；' },
  { value: 5, label: '幂变换', msg: '通过选择合适的 Lambda值，可以灵活地调整数据的分布形态和变量间的关系，以满足统计分析的需要；' }
  // { value: 6, label: 'Z-score标准化变换', msg: '1.Z标准化(S)公式为：Z = (X - μ) / σ <br/> 。2.Z-score标准化是一种线性变换方法，旨在调整数据的分布，使其均值为0，标准差为1。<br/> 3.作用：标准化后的变量值围绕0上下波动,大于0说明高于平均水平，小于0说明低于平均水平' },
  // { value: 7, label: 'Min-Max标准化变换', msg: '1.公式为：（X-min）/ （max-min）。<br/> 2.作用：对原始数据的线性变换，使结果落到[0,1]区间。' }
]

const rules = {
  type: [
    { required: true, message: '请选择变换方法', trigger: 'change' }
  ],
  lambdaValue: [
    { required: true, message: '请填写Lambda值', trigger: 'blur' },
    { type: 'number', message: '请填写数字', trigger: 'blur' }
  ]
}

const formRef = ref(null) // 表单ref
const formData = ref({ // 表单数据
  type: 1,
  lambdaValue: null
})

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
  console.log('chufale', obj)
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
    colIds: [currentVar.value.colId],
    operateId: dataOperateId.value,
    inputConditions: {
      isSingleVarible: isSingleVarible.value,
      formData: formData.value,
      crrentVarList: crrentVarList.value,
      currentVar: currentVar.value
    },
    type: formData.value.type,
    lambdaValue: [5].includes(formData.value.type) ? String(formData.value.lambdaValue) : undefined
  }

  if (!isSingleVarible.value) {
    params.colIds = dataList.value.filter(item => crrentVarList.value.includes(item.label)).map(item => item.colId)
  }

  formRef.value?.validate(async (valid) => {
    if (valid) {
      variableTransformFn(params).then(res => {
        if (res.code === 10000) {
          dataOperateId.value = res.data.dataOperateId
          ElMessage.success('操作成功')
          getDataList(isSingleVarible.value ? res.data.colNumber : null)
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
