<template>
  <div class="data-cleansing AI">
    <div class="content">
      <div class="main leftPanel">
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
            :filterCodomainType="[]"
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
            <el-form-item label="变换方法" prop="dataTransformersMethodName">
              <el-select v-model="formData.dataTransformersMethodName" clearable placeholder="请选择一项">
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
            <div class="horizontalArrangement" v-if="['box-cox','cwt_method','dwt_method','i_box-cox'].includes(formData.dataTransformersMethodName)">
              <span class="dataTransformationParameters">数据变换参数</span>
              <el-form-item label="Lambda值" prop="lambdaValue" v-if="['box-cox','i_box-cox'].includes(formData.dataTransformersMethodName)">
                <el-input-number
                  v-no-e v-model.number="formData.lambdaValue" :min="0" controls-position="right" :precision="2"></el-input-number>
                <el-tooltip content="Box-cox变换引入参数Lambda，通过数据本身估计该参数进而确定数据变换形式。" placement="top">
                  <i class="iconfont icon-querentishi headerIcon"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="小波尺度" prop="waveletLevel" v-if="formData.dataTransformersMethodName=== 'cwt_method'">
                <el-input-number
                  v-no-e v-model.number="formData.waveletLevel" :min="0"></el-input-number>
                <el-tooltip content="要使用的小波尺度：尺度越小，表示小波越窄，信号频率越高。尺度越大，表示小波越宽，信息频率越低。" placement="top">
                  <i class="iconfont icon-querentishi headerIcon"></i>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="小波类型" prop="wavelet" v-if="['cwt_method','dwt_method'].includes(formData.dataTransformersMethodName)">
                <el-select v-model="formData.wavelet" clearable placeholder="请选择一项">
                  <template v-for="(item) in waveletTypeOption" :key="item.value">
                    <el-option :label="item.label" :value="item.value"></el-option>
                  </template>
                </el-select>
                <!-- <el-cascader :options="waveletTypeOption" :show-all-levels="false" :props="cascaderProps" v-model="formData.wavelet"/> -->
                <el-tooltip content="使用的小波类型。" placement="top">
                  <i class="iconfont icon-querentishi headerIcon"></i>
                </el-tooltip>
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>
    </div>
    <!-- <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取 消</el-button>
          <loading-btn type="primary" @handleSubmit="saveDataFilterFn" ref='loadingBtnDom' :disabled="!isSingleVarible && crrentVarList.length === 0">{{ isSingleVarible ? '保存' : '批量保存' }}</loading-btn>
        </div>
      </template> -->
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import variableSelection from '@/components/dataAnalysis/engineeringLibrary/common/variableSelection.vue'
import commonEchartsTitle from '@/components/dataAnalysis/engineeringLibrary/common/commonEchartsTitle.vue'
import echartsEmpty from '@/components/dataAnalysis/engineeringLibrary/common/echartsEmpty.vue'
import { useDataConversionResultNHook } from '@/hooks/dataConversionResultN.js'
import { ElMessage } from 'element-plus'
import { dataTransformFn } from '@/api/api_dataAnalysis.js'
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

// const cascaderProps = {
//   value: 'label',
//   label: 'label',
//   children: 'children'
// }

const loadingBtnDom = ref(null)
// 变化方法选项提示信息
const msgTip = computed(() => {
  return selectOptions.find(item => item.value === formData.value.dataTransformersMethodName)?.msg || ''
})
// 小波类型选项
// const waveletTypeOption = [
//   {
//     label: '离散meyer小波',
//     children: [
//       { label: 'dmey' }
//     ]
//   },
//   {
//     label: '哈尔小波',
//     children: [
//       { label: 'haar' }
//     ]
//   },
//   {
//     label: '双正交小波',
//     children: [
//       { label: 'bior1.1' },
//       { label: 'bior1.3' },
//       { label: 'bior1.5' },
//       { label: 'bior2.2' },
//       { label: 'bior2.4' },
//       { label: 'bior2.6' },
//       { label: 'bior3.1' },
//       { label: 'bior3.3' },
//       { label: 'bior3.5' },
//       { label: 'bior4.4' },
//       { label: 'bior6.8' }
//     ]
//   },
//   {
//     label: 'Coifet/小波',
//     children: [
//       { label: 'coif1' },
//       { label: 'coif2' },
//       { label: 'coif3' },
//       { label: 'coif4' },
//       { label: 'coif5' },
//       { label: 'coif6' },
//       { label: 'coif7' },
//       { label: 'coif8' }
//     ]
//   },
//   {
//     label: '多贝西小波',
//     children: [
//       { label: 'db1' },
//       { label: 'db2' },
//       { label: 'db3' },
//       { label: 'db4' },
//       { label: 'db5' },
//       { label: 'db6' },
//       { label: 'db7' },
//       { label: 'db8' }
//     ]
//   },
//   {
//     label: 'Symlets小波',
//     children: [
//       { label: 'sym1' },
//       { label: 'sym2' },
//       { label: 'sym3' },
//       { label: 'sym4' },
//       { label: 'sym5' },
//       { label: 'sym6' },
//       { label: 'sym7' },
//       { label: 'sym8' },
//       { label: 'sym9' },
//       { label: 'sym10' }
//     ]
//   }
// ]
// 离散小波类型对照表
const waveletTypeOption = [
  { label: 'Daubechies 1 小波', value: 'db1' },
  { label: 'Daubechies 2 小波', value: 'db2' },
  { label: 'Haar 小波', value: 'haar' },
  { label: '对称 5 阶小波', value: 'sym5' },
  { label: 'Coiflet 小波', value: 'coif1' },
  { label: '双正交小波', value: 'bior' }
  // { label: '反双正交小波', value: 'rbio' }
]

// // 连续小波尺度选项
// const continuousWavelet = [
//   { label: '墨西哥帽小波', value: 'mexh' },
//   { label: 'Morlet小波', value: 'morl' },
//   { label: '复Morlet小波', value: 'cmor' },
//   { label: '一阶高斯导数小波', value: 'gaus1' },
//   { label: '二阶高斯导数小波', value: 'gaus2' }
// ]

// 变化方法选项
const selectOptions = [
  { value: 'fft_method', label: '傅里叶变换', msg: '傅里叶变换是一种将函数展开成三角函数的和或者积分的变换分析方法。其常用于信号分析等领域，能将信号在时域和频域之间进行变换。' },
  { value: 'ifft_method', label: '傅里叶逆变换', msg: '将傅里叶变换后的数据还原回去，可以在数据经过降噪或其他处理后使用。' },
  { value: 'box-cox', label: 'Box-cox变换', msg: 'Box-cox变换是一种广义幂变换方法，用于定量变量不满足正态分布的情况。Box-cox变换的目的是为了让数据满足线性模型的基本假定，即线性、正态性及方差齐性。Box-cox变换需要数据为非负数，当数据不满足条件时，可以将数据平移一固定值从而确保数据全为非负。' },
  { value: 'i_box-cox', label: 'Box-cox逆变换', msg: 'Box-cox的逆变换，在使用Box-cox变换后的数据建立模型后，将使用模型进行预测的预测值逆变换得到原先的结果。其中Lambda值需要与先前使用Box-cox的Lambda值一致。' },
  // { value: 'cwt_method', label: '连续小波变换', msg: '小波变换是一种将函数展开成一系列的小波函数的叠加的变换分析方法，它具有多分辨分析的特点，克服了傅里叶变换难以表征信号局部特征的缺陷。' },
  { value: 'dwt_method', label: '离散小波变换', msg: '为了更好利用计算机计算，就必须进行离散化处理，得到离散小波变换，离散小波变换对尺度和平移因子使用离散值' }
]

const rules = {
  dataTransformersMethodName: [
    { required: true, message: '请选择变换方法', trigger: 'change' }
  ],
  lambdaValue: [
    { required: true, message: '请填写Lambda值', trigger: 'blur' },
    { type: 'number', message: '请填写数字', trigger: 'blur' }
  ],
  waveletLevel: [
    { required: true, message: '请选择小波尺度', trigger: 'change' }
  ],
  wavelet: [
    { required: true, message: '请选择小波类型', trigger: 'change' }
  ]
}

const formRef = ref(null) // 表单ref
const formData = ref({ // 表单数据
  dataTransformersMethodName: 'fft_method',
  lambdaValue: null,
  waveletLevel: null,
  wavelet: null
})

const xAxisName = ref('')
const yAxisName = ref('样本量')
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
  const type = formData.value.dataTransformersMethodName
  const notItFourierTransform = ['box-cox', 'i_box-cox', 'cwt_method', 'dwt_method'].includes(type)
  const methodName = selectOptions.find(item => item.value === type)?.label
  if (isSingleVarible.value) {
    const { nullFlag, label, codomainType } = currentVar.value
    if (nullFlag) {
      ElMessage.error(`变量${label}包含空值，请先进行空值处理`)
      return
    }
    if (codomainType === 7 && notItFourierTransform) {
      ElMessage.error(`变量${label}为复数, 不能进行${methodName}变换`)
      return
    }
  } else {
    const filterList = dataList.value.filter(item => crrentVarList.value.includes(item.label) && item.nullFlag)
    if (filterList.length !== 0) {
      ElMessage.error(`变量${filterList.map(item => item.label).join(',')}包含空值，请先进行空值处理`)
      return
    }
    const complexNumberList = dataList.value.filter(item => crrentVarList.value.includes(item.label) && item.codomainType === 7)
    if (complexNumberList.length !== 0 && notItFourierTransform) {
      ElMessage.error(`变量${complexNumberList.map(item => item.label).join(',')}为复数, 不能进行${methodName}变换`)
      return
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
    dataTransformersMethodName: formData.value.dataTransformersMethodName,
    lambdaValue: formData.value.lambdaValue,
    waveletLevel: formData.value.waveletLevel,
    wavelet: formData.value.wavelet
  }
  if (!isSingleVarible.value) {
    const filterList = dataList.value.filter(item => crrentVarList.value.includes(item.label))
    params.colIdList = filterList.map(item => item.colId)
    params.fieldList = filterList.map(item => ({ metric: item.label, metricType: item.dataProperty }))
  }

  formRef.value?.validate(async (valid) => {
    if (valid) {
      dataTransformFn(params).then(res => {
        if (res.code === 10000) {
          dataOperateId.value = res.data.dataOperateId
          ElMessage.success('操作成功')
          getDataList(isSingleVarible.value ? res.data.colNumberList[0] : null)
          emits('updateDataOperateId', res.data.dataOperateId)
        }
      })
    } else {
      loadingBtnDom.value.handleLoading()
    }
  })
}

watch(dataOperateId, (val, oldVal) => {
  if (oldVal) {
    emits('updateDataOperateId', val)
  }
})
const handleSure = () => {
  saveDataFilterFn()
}
defineExpose({
  handleSure
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
