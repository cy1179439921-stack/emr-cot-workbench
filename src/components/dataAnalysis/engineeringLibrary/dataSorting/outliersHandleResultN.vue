<template>
  <div class="data-cleansing">
    <el-dialog
      class="addIP_Dialog"
      v-model="dialogVisible"
      :title="title"
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
                dataType="1"
                :filteredList="filteredList"
                :titleObj="titleObj"
                :colNumber="colNumber"
                @handleChange="handleChange"
                :initDataList="dataList"
                :showTag="false"
                :isBatch="!isSingleVarible"
                :disabledTypeArr="[]"
                :defaultArr="currentVisibleArr"
                showToolTip
              >
              </variableSelection>
            </div>
            <div class="chartContainer">
              <div class="title" v-if="isSingleVarible">
                <p>
                  <span></span>
                  <span>数据视图</span>
                </p>
                <p @click="downloadGraph" v-if="isShowCharts">
                  <i class="iconfont icon-daochu2"></i>
                  <span>下载</span>
                </p>
              </div>
              <div class="chartBox" v-if="isSingleVarible" id="echartBox">
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
            <div class="title">
              <p>
                <span></span>
                <span>异常值筛选</span>
              </p>
            </div>
            <el-form ref="ruleForm" :model="formData">
              <div class="name-box">
                <el-form-item label="异常值筛选方法" prop="type">
                  <el-select v-model="formData.type" @change="changeFilterMethod" clearable placeholder="请选择一项">
                    <template v-for="(item, index) in options" :key="index">
                      <el-tooltip
                        v-if="item.tooltip"
                        class="box-item"
                        effect="dark"
                        placement="right"
                        :content="item.tooltip"
                      >
                        <el-option :label="item.label" :value="item.value"></el-option>
                      </el-tooltip>
                      <el-option
                        v-else
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </template>
                  </el-select>
                </el-form-item>
                <!-- 选择不同的处理方法，要展示不同的内容start -->
                <el-form-item label="z_score值" prop="scoreNum" v-if="formData.type === 'z_score'">
                  <div class="scoreContent" style="width: 100%;">
                    <el-input
                      type="number"
                      v-model.trim="formData.scoreNum"
                      placeholder="请填写内容"
                    ></el-input>
                    <el-button
                      type="primary"
                      class="scoreBtn"
                      @click.stop="confirmScore"
                    >确 认</el-button
                    >
                  </div>
                </el-form-item>
                <el-form-item label="固定值" prop="scoreNum" v-if="formData.type === 'fixed'">
                  <div class="scoreContent" style="width: 100%;">
                    <el-input
                      type="number"
                      v-model.trim="formData.scoreNum"
                      placeholder="请填写内容"
                    ></el-input>
                    <el-button
                      type="primary"
                      class="scoreBtn"
                      @click.stop="confirmScore"
                    >确 认</el-button
                    >
                  </div>
                </el-form-item>
                <el-form-item label="值域" v-if="formData.type === 'range_value'" class="p6">
                  <div class="interval">
                    <el-input
                      type="number"
                      class="custom-input custom-input1"
                      v-model="formData.rangeValue.startValue"
                    ></el-input>
                    <el-select
                      class="custom-select fontFm"
                      v-model="formData.rangeValue.startSymbol"
                      placeholder=""
                    >
                      <el-option
                        v-for="item in startComputingOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                    <i class="iconfont icon-zimuX fuhao"></i>
                    <el-select
                      class="custom-select fontFm"
                      v-model="formData.rangeValue.endSymbol"
                      placeholder=""
                    >
                      <el-option
                        v-for="item in endComputingOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                    <el-input
                      v-model="formData.rangeValue.endValue"
                      type="number"
                      class="custom-input custom-input2"
                    ></el-input>
                  </div>
                  <el-button
                    class="scoreBtn"
                    type="primary"
                    @click.stop="confirmScore"
                  >确 认</el-button
                  >
                </el-form-item>
                <el-form-item label="均值" prop="meanValue" v-if="formData.type === 'mean_std'">
                  <div class="meanContent">
                    <el-input
                      v-if="isSingleVarible"
                      v-model="formData.meanValue"
                      type="number"
                      class="meanInput"
                      placeholder=""
                      disabled
                    ></el-input>
                    <span class="addIcon">+</span>
                    <el-input
                      type="number"
                      placeholder=""
                      class="meanInput"
                      v-model.trim="formData.scoreNum"
                    ></el-input>
                    <div
                      class="noWrap"
                    >
                      倍标准差
                    </div>
                  </div>
                  <el-button
                    class="scoreBtn mt"
                    type="primary"
                    @click.stop="confirmScore"
                  >确 认</el-button
                  >
                </el-form-item>
                <el-form-item label="分布百分比" v-if="formData.type === 'range_percent'" class="p6">
                  <!-- <div class="intervalTxt"></div> -->
                  <div class="interval customInterval">
                    <el-input type="number" v-no-e v-model="formData.rangeValue.startValue" class="custom-input custom-input1 custom-inputPercent">
                      <template v-slot:append>%</template>
                    </el-input>
                    <el-select class="custom-select custom-selectPercent fontFm" v-model="formData.rangeValue.startSymbol" placeholder="">
                      <el-option
                        v-for="item in startComputingOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                    <div class="intervalBox">and</div>
                    <el-select
                      class="custom-select custom-selectPercent fontFm"
                      v-model="formData.rangeValue.endSymbol"
                      placeholder=""
                    >
                      <el-option
                        v-for="item in endComputingOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                    <el-input
                      v-model="formData.rangeValue.endValue"
                      type="number"
                      class="custom-input custom-input2 custom-inputPercent"
                    >
                      <template v-slot:append>%</template></el-input
                    >
                  </div>
                  <el-button
                    class="scoreBtn"
                    type="primary"
                    @click.stop="confirmScore"
                  >确 认</el-button
                  >
                </el-form-item>
              </div>
              <!-- 选择不同的处理方法，要展示不同的内容end -->
              <div class="title mtb">
                <p>
                  <span></span>
                  <span>异常值处理</span>
                </p>
              </div>
              <div class="other-box">
                <el-scrollbar>
                  <el-form-item label="处理方法">
                    <el-select v-model="formData.operateMethod" @change="changeProcessingMethod" clearable placeholder="请选择一项">
                      <el-option
                        v-for="item in handleMethodOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="填充方法"
                    v-if="['statisticsFill', 'ruleFill'].includes(formData.operateMethod)">
                    <el-select v-model="formData.paddingMethod" clearable placeholder="请选择一项">
                      <el-option
                        v-for="item in paddingOptionsMap[formData.operateMethod]"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    label="填充数值"
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
                        v-for="item in currentVisibleArr"
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
                      <el-option :label="item.label" :value="item.colId" v-for="item in argumentFill" :key="item.colId">
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
                    </el-select>
                  </el-form-item>
                </el-scrollbar>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取 消</el-button>
          <!-- <el-button type="primary" v-show="isSingleVarible" @click="handleSure(ruleForm)">保 存</el-button> -->
          <!-- <el-button type="primary" v-show="!isSingleVarible" @click="handleSure(ruleForm)">批量保存</el-button> -->

          <loading-btn
            type="primary"
            v-if="isSingleVarible"
            @handleSubmit="handleSure(ruleForm)"
            ref='loadingBtnDom1'
          >
            保 存
          </loading-btn>
          <loading-btn
            type="primary"
            v-if="!isSingleVarible"
            @handleSubmit="handleSure(ruleForm)"
            ref='loadingBtnDom2'
          >
            批量保存
          </loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: 'outliersHandleResultN'
})
import { computed, nextTick, ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { useDataFilterHook } from '@/hooks/dataFilterHook.js'
import { useOutliersHandleHook } from '@/hooks/outliersHandleHook.js'
import { nowDate } from '@/utils/utils.js'
import { getAllVariables, getChartData, saveAbnormalValueInfo, getAbnormalValueInfo, getAverageValueAbnormal } from '@/api/api_dataAnalysis'
import html2canvas from 'html2canvas'
import fileDownload from 'js-file-download'
import { histogramChartBasicOption, scatterChartsOption2 } from '../common/echartsConfig.js'
import lodash from 'lodash'
const emits = defineEmits(['updateList', 'handleClose'])
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
    type: Object
  }
})
const dialogVisible = ref(true)
const title = ref('')
const dataList = ref([])
const metricName = ref('')
const dateType = ref('')
const echarsDom = ref(null)
const isSingleVarible = ref(true)
const xAxisName = ref('')
const yAxisName = ref('')
const selectedViewIndex = ref(null)
const colNumber = ref('')
const viewList = ref([])
const variableSelectionRef = ref(null)
const argumentFill = computed(() => {
  return dataList.value.filter(item => {
    if (isSingleVarible.value) {
      return item.label !== metricName.value
    } else {
      return !currentVisibleArr.value.includes(item.label)
    }
  })
})
const dataOperateIdValue = ref(props.engineeringInfo.dataOperateId)
const echartsData = ref([])
const currentVisibleObj = ref({})
const currentVisibleArr = ref([])
const typeToViewList = {
  1: [
    { name: '直方图', icon: 'iconfont icon-zhuzhuangtu', type: 'barCategoryGap' },
    { name: '散点图', icon: 'iconfont icon-sandiantu-01', type: 'scatterChartsOption' }
  ]
}

const verify = computed(() => {
  return {
    // 保存时候的校验
    filterMethod: {
      // 异常值筛选方法
      msg: '请选择异常值筛选方法',
      verify: () => !formData.value.type
    },
    requiresScoreNum: {
      msg: '信息不完整',
      verify: () =>
        ['z_score', 'fixed', 'mean_std'].includes(formData.value.type) && formData.value.operateMethod !== 'delete' && !formData.value.scoreNum
    },
    handleMethod: {
      // 离群值处理方法
      msg: '请选择异常值处理方法',
      verify: () => !formData.value.operateMethod
    },
    paddingMethod: {
      // 填充方法
      msg: '请选择填充方法',
      verify: () => ['statisticsFill', 'ruleFill', 'fill'].includes(formData.value.operateMethod) && !formData.value.paddingMethod
    },
    paddingNumber: {
      // 填充数值
      msg: '信息不完整',
      verify: () => ['ruleFill'].includes(formData.value.operateMethod) && ['custom'].includes(formData.value.paddingMethod) && !formData.value.paddingNumber
    },
    independentVariable: {
      // 定量变量-回归填充
      msg: '请选择自变量',
      verify: () => formData.value.operateMethod === 'returnFill' && !formData.value.independentVariable.length
    },
    rangeValue: {
      // 值域
      msg: '信息不完整',
      verify: () =>
        ['range_value', 'range_percent'].includes(formData.value.type) && (!formData.value.rangeValue.startValue || !formData.value.rangeValue.endValue) && formData.value.operateMethod !== 'delete'
    },
    rangeValueLegal: {
      // 值域是否合法
      msg: '输入值不合法',
      verify: () => ['range_value', 'range_percent'].includes(formData.value.type) && Number(formData.value.rangeValue.startValue) > Number(formData.value.rangeValue.endValue)
    }
  }
})

const vertify2 = computed(() => {
  return {
  // 筛选方法 确定时候的校验
    requiresScoreNum: {
      msg: '信息不完整',
      verify: () => ['z_score', 'fixed', 'mean_std'].includes(formData.value.type) && !formData.value.scoreNum
    },
    rangeValue: {
    // 值域
      msg: '信息不完整',
      verify: () =>
        ['range_value', 'range_percent'].includes(formData.value.type) && (!formData.value.rangeValue.startValue || !formData.value.rangeValue.endValue)
    },
    rangeValueLegal: {
      // 值域是否合法
      msg: '输入值不合法',
      verify: () => ['range_value', 'range_percent'].includes(formData.value.type) && Number(formData.value.rangeValue.startValue) > Number(formData.value.rangeValue.endValue)
    }
  }
})

const formData = ref({
  type: '',
  operateMethod: '',
  paddingMethod: '',
  paddingNumber: '',
  independentVariable: [],
  metricList: [],
  scoreNum: null,
  rangeValue: {
    startValue: '',
    startSymbol: '>=',
    endSymbol: '<=',
    endValue: ''
  },
  meanValue: ''
})

const {
  echartsOptions,
  filteredList
} = useDataFilterHook()

const {
  options,
  handleMethodOptions,
  paddingOptionsMap,
  startComputingOptions,
  endComputingOptions
} = useOutliersHandleHook()
const isShowCharts = ref(false)

const getDataVisibleFn = () => {
  if (currentVisibleObj.value.colId) {
    const params = {
      colId: currentVisibleObj.value.colId,
      operateId: dataOperateIdValue.value
    }
    getChartData(params).then(res => {
      if (res.code === 10000) {
        isShowCharts.value = true
        echartsData.value = lodash.get(res, 'data.view') || []
        updateViewList()
      } else {
        isShowCharts.value = false
      }
    })
  }
}

const updateViewList = () => {
  viewList.value = typeToViewList[dateType.value] || []
  selectedViewIndex.value = 0
  if (viewList.value.length > 0) {
    handleViewChange(viewList.value[0], 0)
  }
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
  switch (item.type) {
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
      break
    case 'scatterChartsOption':
      echartsOptions.value = scatterChartsOption2(
        {
          type: dateType.value,
          dataArr: echartsData.value
        }
      )
      break
  }
}

const isFlag = ref(true)

const handleChange = async (obj) => {
  formData.value.meanValue = ''
  if (Array.isArray(obj)) {
    formData.value.independentVariable = []
    currentVisibleArr.value = obj
  } else {
    formData.value.type = ''
    formData.value.operateMethod = ''
    formData.value.paddingMethod = ''
    formData.value.paddingMethod = ''
    formData.value.independentVariable = []
    formData.value.metricList = []
    formData.value.scoreNum = null
    formData.value.rangeValue = {
      startValue: '',
      endValue: '',
      startSymbol: '>=',
      endSymbol: '<='
    }

    dateType.value = obj.dataProperty
    colNumber.value = obj.colNumber
    metricName.value = obj.label
    currentVisibleObj.value = obj
  }
  if (isSingleVarible.value && isFlag.value) {
    getDataVisibleFn()
  }
}

const getListData = async (newColNumber, type = true) => {
  isFlag.value = type
  getAllVariables({ id: dataOperateIdValue.value }).then(v => {
    if (v.code === 10000 && v.data.length > 0) {
      if (newColNumber) {
        colNumber.value = newColNumber
      }
    }
    dataList.value = v.data.filter(item => item.dataProperty === 1)
    dateType.value = dataList.value[0].dataProperty
    metricName.value = dataList.value[0].label
    nextTick(() => {
      isFlag.value = true
    })
  })
}

const confirmScore = () => {
  for (const k in vertify2.value) {
    // 校验
    if (vertify2.value[k].verify()) {
      ElMessage.error(vertify2.value[k].msg)
      return
    }
  }

  if (['range_percent', 'range_value'].includes(formData.value.type)) {
    if (Number(formData.value.rangeValue.endValue) > 100) {
      ElMessage.error('输入值不合法')
      return
    }
  }
  outlierDataHandle()
}

const outlierDataHandle = () => {
  getScatterChart()
}

// 选择异常值筛选方法
const changeFilterMethod = () => {
  formData.value.scoreNum = null
  formData.value.rangeValue = {
    startValue: '',
    endValue: '',
    startSymbol: '>=',
    endSymbol: '<='
  }

  if (formData.value.type === '3_sigma' || formData.value.type === 'IQR') {
    getScatterChart()
  }
  if (formData.value.type === 'mean_std' && isSingleVarible.value) {
    obtainTheMean()
  }
}

// 获取均值
const obtainTheMean = () => {
  getAverageValueAbnormal({ colId: currentVisibleObj.value.colId }).then(res => {
    formData.value.meanValue = res.data?.averageValue || ''
  })
}

// 获取散点图
const getScatterChart = () => {
  if (isSingleVarible.value) {
    getAbnormalValueInfo({
      colId: currentVisibleObj.value.colId,
      dataOperateId: dataOperateIdValue.value,
      params: {
        metric_name: metricName.value,
        outlier_thresh_method: formData.value.type,
        process_method: formData.value.operateMethod,
        thresh_value: ['z_score', 'fixed', 'range_value', 'range_percent', 'mean_std'].includes(formData.value.type) ? formData.value.scoreNum : null,
        thresh_value_range: ['range_percent', 'range_value'].includes(formData.value.type) ? formData.value.rangeValue : null
      }
    }).then(res => {
      const dataArr = [res.data?.result?.after_process_plt.in_lier, res.data?.result?.after_process_plt.out_lier]
      echartsData.value = dataArr
      handleViewChange({ icon: 'iconfont icon-zhuzhuangtu', name: '散点图', type: 'scatterChartsOption' }, 1)
    })
  }
}

const changeProcessingMethod = () => {
  formData.value.paddingMethod = ''
  formData.value.paddingMethod = ''
}

const handleClose = (done) => {
  emits('handleClose')
  if (done) {
    done()
  }
}

const ruleForm = ref(null)
const loadingBtnDom1 = ref()
const loadingBtnDom2 = ref()
const handleSure = async() => {
  if (!isSingleVarible.value && currentVisibleArr.value.length === 0) {
    ElMessage.error('请选择需要处理的变量')
    loadingBtnDom1.value?.handleLoading()
    loadingBtnDom2.value?.handleLoading()
    return
  }

  for (const k in verify.value) {
    if (verify.value[k].verify()) {
      ElMessage.error(verify.value[k].msg)
      loadingBtnDom1.value?.handleLoading()
      loadingBtnDom2.value?.handleLoading()
      return
    }
  }

  const type = formData.value.operateMethod
  let ConfirmType = ''
  if (type === 'delete') {
    ConfirmType = '删除'
  } else if (type === 'multipleImputation') {
    ConfirmType = '多重插补'
  } else {
    ConfirmType = '填充'
  }
  ElMessageBox.confirm(
    `${ConfirmType}将直接作用到当前数据集上`,
    `${ConfirmType}!`,
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
        smallGroup: '异常值处理',
        params: {
          outlier_thresh_method: formData.value.type,
          process_method: formData.value.operateMethod,
          paddingNumber: ['ruleFill'].includes(formData.value.operateMethod) && ['custom'].includes(formData.value.paddingMethod) ? formData.value.paddingNumber : null,
          independent_variable: formData.value.independentVariable,
          method: formData.value.paddingMethod,
          field: [{ metric: metricName.value, metric_type: dateType.value }],
          thresh_value: formData.value.scoreNum,
          thresh_value_range: ['range_percent', 'range_value'].includes(formData.value.type) ? formData.value.rangeValue : null
        }
      }
      if (isSingleVarible.value) {
        paramsValue.params.metric_name = metricName.value
      } else {
        const metricList = []
        const colIdArr = []
        dataList.value.forEach(item => {
          if (currentVisibleArr.value.includes(item.label)) {
            metricList.push({
              metric: item.label,
              metric_type: item.dataProperty
            })
            colIdArr.push(item.colId)
          }
        })
        paramsValue.params.metric_list = metricName.value
        paramsValue.params.field = metricList
        paramsValue.colIdList = colIdArr
      }
      paramsValue.params.input_conditions = JSON.stringify({
        formData: formData.value,
        currentVisibleObj: currentVisibleObj.value,
        currentVisibleArr: currentVisibleArr.value,
        metricName: metricName.value,
        isSingleVarible: isSingleVarible.value,
        colNumber: colNumber.value
      })
      saveAbnormalValueInfo(paramsValue).then(res => {
        if (res.code === 10000) {
          ElMessage.success('操作成功')
          dataOperateIdValue.value = res.data.dataOperateId
          getListData(isSingleVarible.value ? res.data.colNumberList[0] : undefined, false)
          // variableSelectionRef.value?.clearSelection()
          if (isSingleVarible.value) {
            const dataArr = [res.data?.chartData?.after_process_plt.in_lier, res.data?.chartData?.after_process_plt.out_lier]
            echartsData.value = dataArr
            handleViewChange({ icon: 'iconfont icon-zhuzhuangtu', name: '散点图', type: 'scatterChartsOption' }, 1)
          }
          emits('updateList', dataList.value)
        }
      })
    })
    .catch(() => {
      loadingBtnDom1.value?.handleLoading()
      loadingBtnDom2.value?.handleLoading()
    })

  emits('updateList', dataList.value)
}

const handleName = () => {
  return `${props.engineeringInfo?.name}_异常值处理_${metricName.value}_${nowDate(new Date())}`
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

const allBtn = async () => {
  isSingleVarible.value = !isSingleVarible.value
  formData.value.independentVariable = []
  if (isSingleVarible.value) {
    getDataVisibleFn()
  }
}

defineExpose({
})

// 若回调成功，一定是跳转的
const handleJumpParams = async () => {
  if (props.jumpData) {
    const inputConditions = JSON.parse(JSON.parse(props.jumpData.params).input_conditions)
    const pId = props.jumpData.pid
    getAllVariables({ id: pId }).then(async v => {
      if (v.code === 10000 && v.data.length > 0) {
        dataList.value = v.data.filter(item => item.dataProperty === 1)
        currentVisibleObj.value = inputConditions.currentVisibleObj
        if (inputConditions.isSingleVarible) {
          dateType.value = inputConditions.currentVisibleObj.dataProperty
          metricName.value = inputConditions.currentVisibleObj.label
        } else {
          dateType.value = dataList.value[0].dataProperty
          metricName.value = dataList.value[0].label
        }
        colNumber.value = inputConditions.colNumber
        currentVisibleObj.value = inputConditions.currentVisibleObj
        currentVisibleArr.value = inputConditions.currentVisibleArr
        nextTick(() => {
          isSingleVarible.value = inputConditions.isSingleVarible
          formData.value = inputConditions.formData
          getScatterChart()
        })
      }
    })
  }
}

const init = () => {
  const { jumpData } = props
  if (jumpData) {
    handleJumpParams()
    return
  }
  const { selectColumn } = props.titleObj
  getListData(selectColumn?.colNumber)
}

init()
</script>

<style scoped lang="scss">
@use '@/style/common/dataCleansing.scss';
.data-cleansing {
  :deep(.leftPanel) {
    .dataNameContent {
      max-width: 500px !important;
    }
  }
  :deep(.el-overlay-dialog) {
    .el-dialog {
      .mainContainer {
        .rightPanel {
          overflow: hidden;
          flex: 1;
          padding-left: 24px;
          .dataInfoContainer {
            display: flex;
            flex-direction: column;
            height: 100%;
            .el-form {
              display: flex;
              overflow: hidden;
              flex-direction: column;
              flex: 1;
              .name-box {
                box-sizing: border-box;
                min-height: 94px;
                padding: 16px;
                border: 1px solid #e8e8e8;
                border-radius: 2px;
              }
              .el-form-item {
                flex-direction: column;
              }
              .p6 {
                .el-select__wrapper,
                .el-input__wrapper {
                  padding: 0 6px !important;
                }
              }
              .el-form-item__label {
                justify-content: flex-start;
                height: 14px;
                margin-bottom: 16px;
                font-weight: 500;
                font-size: 14px;
                color: var(--theme-text);
              }
              .scoreBtn {
                margin-top: 16px;
              }
              .mt {
                margin-left: v-bind("isSingleVarible ? '0' : '16px'");
                margin-top: v-bind("isSingleVarible ? '16px' : '0px'");
              }
              .interval {
                display: flex;
                .custom-input,
                .el-select {
                  width: 60px;
                  height: 32px;
                  margin-right: 6px;
                }
                .custom-input2 {
                  margin-right: 0;
                }
                .fuhao {
                  display: block;
                  margin: 0 8px 0 2px;
                  font-style: normal;
                }
              }
              .meanContent {
                display: flex;
                .meanInput {
                  width: 95px;
                  height: 32px;
                }
                .addIcon {
                  display: block;
                  margin: 0 6px;
                  font-size: 18px;
                  color: var(--theme-text);
                }
                .noWrap {
                  margin-left: 5px;
                  font-weight: 400;
                  font-size: 14px;
                  color: var(--theme-text);
                  word-break: keep-all;
                }
              }
              .customInterval {
                display: flex;
                .custom-inputPercent {
                  width: 70px;
                  height: 32px;
                  margin-right: 0;
                  .el-input-group__append {
                    padding: 0 10px;
                    background: var(--theme-fill);
                  }
                }
                .custom-selectPercent {
                  width: 48px;
                  height: 32px;
                  margin: 0 4px;
                }
                .fontFm {
                  font-family: "San francisco", PingFangSC-Light, sans-serif;
                }
                .intervalBox {
                  font-weight: 400;
                  font-size: 14px;
                  color: var(--theme-text-2);
                }
              }
              .el-tabs {
                height: 29px;
                margin: 16px 0;
                line-height: 22px;
                .el-tabs__nav-wrap::after {
                  height: 0;
                  background: none;
                }
                .el-tabs__nav {
                  .el-tabs__item {
                    height: 29px;
                    .titleContainer {
                      font-weight: 400;
                      font-size: 14px;
                      color: var(--theme-text-2);
                    }
                  }
                  .el-tabs__item.is-active {
                    .titleContainer {
                      font-weight: 500;
                      color: var(--theme-primary);
                    }
                  }
                  .el-tabs__active-bar {
                    left: 9% !important;
                    top: 27px !important;
                    width: 33px !important;
                  }
                }
                .el-tabs__nav {
                  .el-tabs__item.is-active {
                    /* 第一个选项卡的活动条 */
                    &:nth-child(0) .el-tabs__active-bar {
                      left: 9% !important;
                    }

                    /* 第二个选项卡的活动条 */
                    &:nth-child(1) .el-tabs__active-bar {
                      left: 13% !important;
                    }
                  }
                }

                .headerIcon {
                  font-size: 12px;
                }
              }
              .tag-box,
              .other-box {
                flex: 1;
                box-sizing: border-box;
                height: 0;
                // height: 393px;
                border: 1px solid #e8e8e8;
                border-radius: 2px;
                .el-scrollbar {
                  .el-form-item {
                    padding: 0 16px;
                  }
                  .el-form-item:nth-child(1) {
                    margin-top: 16px;
                  }
                  .el-form-item:last-child {
                    margin-bottom: 16px;
                  }
                  .el-collapse {
                    margin-bottom: 16px;
                    padding: 0 16px;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
:deep(.el-form-item__label) {
  align-items: center;
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

