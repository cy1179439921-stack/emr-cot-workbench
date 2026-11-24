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
                :filteredList="filteredList"
                :titleObj="titleObj"
                :colNumber="colNumber"
                :defaultArr="choiceAllData"
                :isBatch="!isSingleVarible"
                @handleChange="handleChange"
                :initDataList="dataList"
                :showTag="false"
                :disabledTypeArr="disabledTypeArr"
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
            <div class="title" v-if="isSingleVarible">
              <p>
                <span></span>
                <span>变量编辑</span>
              </p>
            </div>
            <el-form ref="form" :model="formData" :rules="rules">
              <div class="name-box" v-if="isSingleVarible">
                <el-form-item label="变量名称" prop="label">
                  <el-input v-model.trim="formData.label" maxlength="60" clearable placeholder="请填写内容"></el-input>
                </el-form-item>
              </div>
              <el-tabs v-model="activeTab" :class="'tabs_' + activeTab" @tab-click="handleTabClick" v-if="isSingleVarible && (dateType === 0 || dateType === 1)">
                <el-tab-pane name="tab1" v-if="dateType === 1">
                  <template #label>
                    <div class="titleContainer">
                      <el-tooltip
                        class="box-item"
                        effect="dark"
                        placement="bottom-start">
                        <template #content>
                          <div class="toolTipContent-other">{{ tab3Tooltip }}</div>
                        </template>
                        <div class="iconContainer">
                          <span>变量数据类型</span>
                          <i class="iconfont icon-querentishi headerIcon"></i>
                        </div>
                      </el-tooltip>
                    </div>
                  </template>
                </el-tab-pane>
                <el-tab-pane name="tab2" v-if="dateType === 0">
                  <template #label>
                    <div class="titleContainer">
                      <el-tooltip class="box-item" effect="dark" popper-class="custom-tooltip" placement="bottom-start">
                        <template #content>
                          <div class="toolTipContent-other">{{ tab1Tooltip }}</div>
                        </template>
                        <div>
                          <span>变量编码&标签编辑</span>
                          <i class="iconfont icon-querentishi headerIcon"></i>
                        </div>
                      </el-tooltip>
                    </div>
                  </template>
                </el-tab-pane>
                <el-tab-pane name="tab3" v-if="dateType === 0 || dateType === 1">
                  <template #label>
                    <div class="titleContainer">
                      <el-tooltip class="box-item" effect="dark" popper-class="custom-tooltip" placement="bottom-start">
                        <template #content>
                          <div class="toolTipContent-other">{{ tab2Tooltip }}</div>
                        </template>
                        <div>
                          <span>变量类型强制转换</span>
                          <i class="iconfont icon-querentishi headerIcon"></i>
                        </div>
                      </el-tooltip>
                    </div>
                  </template>
                </el-tab-pane>
              </el-tabs>
              <div class="tag-box" v-if="activeTab === 'tab1' && dateType === 1 && isSingleVarible">
                <el-form-item label="原始数据类型" prop="dataType">
                  <el-input v-model="formData.dataType" clearable disabled placeholder="请填写内容"></el-input>
                </el-form-item>
                <el-form-item label="变更后数据类型" prop="newType">
                  <el-select v-model="formData.newType" clearable placeholder="请选择一项">
                    <el-option
                      v-for="item in dataTypeOptions"
                      :key="item.key"
                      :label="item.name"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <div class="tag-box tag-container" v-if="activeTab === 'tab2' && dateType === 0 && isSingleVarible">
                <div class="tag-container-title">
                  <p>编码</p>
                  <p></p>
                  <p>标签</p>
                </div>
                <el-scrollbar>
                  <ul class="tag-container-content">
                    <li v-for="(item, index) in formData.tagList" :key="index">
                      <el-input class="tag-input-left" maxlength="30" v-model="item.indexValue" oninput="value=value.replace(/[^\d.]/g,'')"></el-input>
                      <span class="tag-span">表示</span>
                      <el-input class="tag-input-right" maxlength="30" v-model="item.labelValue"></el-input>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
              <div class="title" :style="{marginBottom: pxToRem(16), marginTop: pxToRem(16)}" v-if="dateType === 2 || !isSingleVarible">
                <p>
                  <span></span>
                  <el-tooltip class="box-item" effect="dark" popper-class="custom-tooltip" placement="bottom-start">
                    <template #content>
                      <div class="toolTipContent-other">{{ tab2Tooltip }}</div>
                    </template>
                    <div style="display: flex; align-items: center;">
                      <em>变量类型强制转换</em>
                      <i class="iconfont icon-querentishi headerIcon"></i>
                    </div>
                  </el-tooltip>
                </p>
              </div>
              <div class="other-box" v-if="((dateType === 0 || dateType === 1) && activeTab === 'tab3' || dateType === 2)&&isSingleVarible">
                <el-form-item label="当前变量类型" prop="varType">
                  <el-input v-model="formData.varType" clearable disabled placeholder="请填写内容"></el-input>
                </el-form-item>
                <el-form-item label="变更后变量类型" prop="newVarType">
                  <el-select v-model="formData.newVarType" clearable placeholder="请选择一项">
                    <el-option
                      v-for="item in varTypeOptions"
                      :key="item.key"
                      :label="item.name"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <div class="other-box" v-if="(!isSingleVarible && disabledTypeArr.length!== 0)" :style="{
                height: pxToRem(509)
              }">
                <el-form-item label="当前变量类型" prop="batchVarType">
                  <el-input v-model="formData.batchVarType" clearable disabled placeholder="请填写内容"></el-input>
                </el-form-item>
                <el-form-item label="变更后变量类型" prop="batchNewVarType">
                  <el-select v-model="formData.batchNewVarType" clearable placeholder="请选择一项">
                    <el-option
                      v-for="item in varTypeOptions"
                      :key="item.key"
                      :label="item.name"
                      :value="item.key"
                    />
                  </el-select>
                </el-form-item>
              </div>
            </el-form>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取 消</el-button>

          <!-- <el-button v-if="isSingleVarible" @click="handleSure('1',form)">覆盖旧变量</el-button>
          <el-button v-if="isSingleVarible" type="primary" @click="handleSure('2',form)">生成新变量</el-button>
          <el-button
            type="primary"
            :disabled="!choiceAllData?.length"
            v-if="!isSingleVarible"
            @click="handleSure('3',form)">
            批量覆盖旧变量
          </el-button> -->
          <loading-btn
            type=""
            ref='loadingBtnDom1'
            v-if="isSingleVarible"
            :disabled="loading1"
            loadingColor="#333"
            @handleSubmit="handleSure('1',form)"
          >
            覆盖旧变量
          </loading-btn>
          <loading-btn
            :disabled="loading2"
            ref='loadingBtnDom2'
            v-if="isSingleVarible"
            type="primary"
            @handleSubmit="handleSure('2',form)"
          >
            生成新变量
          </loading-btn>
          <loading-btn
            ref='loadingBtnDom3'
            :disabled="!choiceAllData?.length"
            v-if="!isSingleVarible"
            @handleSubmit="handleSure('3',form)"
          >
            批量覆盖旧变量
          </loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
defineOptions({
  name: 'dataEditResultN'
})
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { useDataFilterHook } from '@/hooks/dataFilterHook.js'
import { verticalBarChartBasicOption, histogramChartBasicOption } from '../common/echartsConfig.js'
import { nowDate } from '@/utils/utils.js'
import { getDataEditList, getAllVariables, getChartData, batchSaveEdit } from '@/api/api_dataAnalysis'
import html2canvas from 'html2canvas'
import fileDownload from 'js-file-download'
import lodash from 'lodash'
const emits = defineEmits(['updateList', 'handleClose', 'updateDataOperateId'])
const dateType = ref(1)
const disabledTypeArr = ref([])
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
const currentVisibleObj = ref({})
const choiceAllData = ref([])
const title = ref('')
const dataOperateIdValue = ref('')
const colNumber = ref('')
const formData = ref({
  label: '',
  dataType: '',
  newType: '',
  tagList: '',
  varType: '',
  newVarType: '',
  batchVarType: '',
  batchNewVarType: ''
})
const activeTab = ref('tab1')
const isSingleVarible = ref(true)
const metricName = ref('')
const typeValue = ref('')
const jumpFlag = ref(false)
if (props.jumpData) {
  const result = lodash.get(props.jumpData, 'params')
  const initParams = JSON.parse(result)
  isSingleVarible.value = lodash.get(initParams, 'inputConditions.isSingleVarible')
  if (isSingleVarible.value) {
    colNumber.value = lodash.get(initParams, 'inputConditions.colNumber')
    dataOperateIdValue.value = props.jumpData?.pid
    formData.value.label = lodash.get(initParams, 'indexName', '')
    formData.value.newVarType = lodash.get(initParams, 'dataProperty')
    formData.value.newType = lodash.get(initParams, 'inputConditions.newType', '') || ''
    formData.value.tagList = lodash.get(initParams, 'params', [])
    typeValue.value = lodash.get(initParams, 'dataUpdateType')
    dateType.value = lodash.get(initParams, 'inputConditions.dateType', '')
    activeTab.value = lodash.get(initParams, 'inputConditions.activeTab')
  } else {
    dataOperateIdValue.value = props.jumpData?.pid
    choiceAllData.value = lodash.get(initParams, 'inputConditions.nameList', [])
    formData.value.batchNewVarType = lodash.get(initParams, 'dataProperty')
  }

  jumpFlag.value = true
} else {
  dataOperateIdValue.value = props.engineeringInfo.dataOperateId
}

const echarsDom = ref(null)
const xAxisName = ref('')
const yAxisName = ref('')
const allChange = ref(false)
const variableSelectionRef = ref(null)

const {
  echartsOptions,
  filteredList
} = useDataFilterHook()

const rules = reactive({
  label: [
    { required: true, message: '请填写变量名称', trigger: 'blur' }
  ],
  tagList: [
    { type: 'array', required: true, message: '请至少选择一个标签', trigger: 'blur' }
  ],
  newType: [
    { required: true, message: '请选择数据类型', trigger: 'blur' }
  ],
  batchVarType: [
    { required: true, message: '请选择数据类型', trigger: 'blur' }
  ],
  newVarType: [
    { required: true, message: '请选择变量类型', trigger: 'blur' }
  ],
  batchNewVarType: [
    { required: true, message: '请选择变量类型', trigger: 'blur' }
  ]
})

const tab1Tooltip = ref(
  '变量数据类型（定量变量）和变量标签编辑（定性变量）变更功能可以帮助您在变量类型不变的情况下，轻松改变变量的数据编码等细节。该功能同变量类型强制转换功能无法同时使用。'
)
const tab2Tooltip = ref(
  '变量类型强制转换功能可以帮助您直接强制改变变量类型。例如将定性变量强制转换为定量变量。强制转换的前提是转换后的变量类型依旧合法，如不合法可能会出现报错。例如：非数字字符转换为定量变量可能全部变为空值。另外，强制转换有可能会造成部分数据丢失，请谨慎使用。'
)
const tab3Tooltip = ref(
  '变量数据类型（定量变量）和变量标签编辑（定性变量）变更功能可以帮助您在变量类型不变的 情况下，轻松改变变量的数据编码等细节。 该功能同变量类型强制转换功能无法同时使用。'
)
const viewList = ref([])
const selectedViewIndex = ref(null)
const typeToViewList = {
  0: [
    { name: '柱状图', icon: 'iconfont icon-releatu-01', type: 'verticalBarChartBasicOption' }
  ],
  1: [
    { name: '直方图', icon: 'iconfont icon-zhuzhuangtu', type: 'barCategoryGap' }
  ],
  2: [
    { name: '柱状图', icon: 'iconfont icon-releatu-01', type: 'verticalBarChartBasicOption' }
  ]
}

const echartsData = ref([])
const isShowCharts = ref(false)
const getDataVisibleFn = () => {
  return new Promise((resolve) => {
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
      formData.value.label = res.data?.indexName
      if (res.data?.codomainType === 1) {
        formData.value.dataType = 'int'
      } else if (res.data?.codomainType === 2) {
        formData.value.dataType = 'float'
      } else {
        formData.value.dataType = ''
      }

      const varTypes = ['定性变量', '定量变量', '其它变量']
      formData.value.varType = varTypes[res.data?.dataProperty] || ''
      resolve()
    })
  })
}

const updateViewList = () => {
  viewList.value = typeToViewList[currentVisibleObj.value.dataProperty] || []
  selectedViewIndex.value = 0
  if (viewList.value.length > 0) {
    handleViewChange(viewList.value[0], 0)
  }
}

const handleTabClick = (tab) => {
  activeTab.value = tab.props.name
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
  formData.value.tagList = ''
  switch (item.type) {
    case 'verticalBarChartBasicOption':
      echartsData.value.barData?.forEach(item => {
        xAxisData.push(item.name)
        yAxisData.push(item.value)
      })
      echartsOptions.value = verticalBarChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: currentVisibleObj.value.dataProperty
        }
      )
      formData.value.tagList = echartsData.value.m
      break
    case 'barCategoryGap':
      echartsData.value.groupData?.xaxis?.forEach(item => {
        xAxisData.push(item)
      })
      echartsData.value.groupData?.yaxis?.forEach(item => {
        yAxisData.push(item)
      })
      echartsOptions.value = histogramChartBasicOption(
        {
          xAxisData,
          yAxisData,
          type: currentVisibleObj.value.dataProperty
        }
      )
      break
  }
}
const dataTypeOptions = [
  { key: '1', name: '浮点数' },
  { key: '2', name: '四舍五入取整' },
  { key: '3', name: '向下取整' },
  { key: '4', name: '向上取整' },
  { key: '5', name: '舍去小数部分取整' }
]

const varTypeOptions = [
  { key: 0, name: '定性变量' },
  { key: 1, name: '定量变量' },
  { key: 2, name: '其他变量' }
]

const handleClose = (done) => {
  emits('handleClose')
  if (done) {
    done()
  }
}

// 需要传入的数据
const dataList = ref([])
const oldDataType = ref('')
const handleChange = async (obj, isInitiative) => {
  if (obj) {
    form.value.clearValidate()
    if ('dataProperty' in obj) {
      if (!jumpFlag.value || isInitiative) {
        dateType.value = obj.dataProperty
      }
      metricName.value = obj.label
      currentVisibleObj.value = obj
      colNumber.value = obj.colNumber
      await getDataVisibleFn()
    } else {
      // 去dateType.value中查找name等于obj的那条数据，获取type
      if (obj.length > 0) {
        choiceAllData.value = obj
        const foundItem = dataList.value.find(item => item.label === obj[0])
        if (foundItem) {
          dateType.value = foundItem.dataProperty
        }
      } else {
        choiceAllData.value = []
        dateType.value = ''
        formData.value.batchVarType = ''
        formData.value.batchNewVarType = ''
      }
    }
    if (dateType.value === 0) {
      if (isSingleVarible.value) {
        formData.value.varType = '定性变量'
      } else {
        formData.value.batchVarType = '定性变量'
      }
      if (!jumpFlag.value || isInitiative) {
        activeTab.value = 'tab2'
      }
      disabledTypeArr.value = [1, 2]
    } else if (dateType.value === 1) {
      if (isSingleVarible.value) {
        formData.value.varType = '定量变量'
      } else {
        formData.value.batchVarType = '定量变量'
      }
      if (!jumpFlag.value || isInitiative) {
        activeTab.value = 'tab1'
      }
      disabledTypeArr.value = [0, 2]
    } else if (dateType.value === 2) {
      if (isSingleVarible.value) {
        formData.value.varType = '其他变量'
      } else {
        formData.value.batchVarType = '其他变量'
      }
      disabledTypeArr.value = [0, 1]
    } else {
      disabledTypeArr.value = []
    }
    if ((!jumpFlag.value || isInitiative) && isSingleVarible) {
      formData.value.newType = ''
      formData.value.tagList = ''
    }
    if (isSingleVarible.value) {
      if (!jumpFlag.value || isInitiative) {
        formData.value.newVarType = ''
      }
      updateViewList()
    }
  }
}

const getListData = async (newColNumber) => {
  getAllVariables({ id: dataOperateIdValue.value }).then(v => {
    if (v.code === 10000 && v.data.length > 0) {
      dataList.value = v.data
      lodash.remove(dataList.value, { label: 'the_geom' })
      if (newColNumber) {
        colNumber.value = newColNumber
      }
      if (v.data[0].dataProperty === '0') {
        activeTab.value = 'tab2'
      } else if (v.data[0].dataProperty === '1') {
        activeTab.value = 'tab1'
      }
      currentVisibleObj.value = v.data[0]
    }
  })
}

const oldActiveTab = ref('')
const oldDisabledTypeArr = ref([])
const allBtn = () => {
  if (isSingleVarible.value) {
    oldActiveTab.value = activeTab.value
    oldDataType.value = dateType.value
  } else {
    oldDisabledTypeArr.value = lodash.cloneDeep(disabledTypeArr.value)
  }
  isSingleVarible.value = !isSingleVarible.value
  if (isSingleVarible.value) {
    dateType.value = oldDataType.value
    activeTab.value = oldActiveTab.value
    handleChange(currentVisibleObj.value, true)
    // updateViewList()
  } else {
    disabledTypeArr.value = lodash.cloneDeep(oldDisabledTypeArr.value)
  }
}

const form = ref(null)
const loadingBtnDom1 = ref()
const loadingBtnDom2 = ref()
const loadingBtnDom3 = ref()
const loading1 = ref(false)
const loading2 = ref(false)
const handleSure = async(type, formEl) => {
  // 编码，标签，两个字段不能为空，不能有空格
  if (!formEl) return
  await formEl.validate(async(valid, fields) => {
    if (valid) {
      if (type === '1') {
        // loadingBtnDom2.value?.switchLoading()
        loading2.value = true
      } else {
        loading1.value = true
        // loadingBtnDom1.value?.switchLoading()
      }

      if (type === '1' || type === '2') {
        if (dateType.value === 0 && activeTab.value === 'tab2' && formData.value.tagList.length === 0) {
          ElMessage.error('编码标签不能为空')
          return
        } else if (dateType.value === 0 && activeTab.value === 'tab2' && formData.value.tagList.length > 0) {
          const indexValues = new Set()
          const labelValues = new Set()
          for (let i = 0; i < formData.value.tagList.length; i++) {
            const tag = formData.value.tagList[i]
            // 判断编码和标签是否为空或仅包含空格
            if (tag.indexValue.trim() === '') {
              ElMessage.error('编码不能为空')
              return
            } else if (tag.labelValue.trim() === '') {
              ElMessage.error('标签名不能为空')
              return
            }
            // 判断 indexValue 是否重复
            if (indexValues.has(tag.indexValue.trim())) {
              ElMessage.error('编码重复')
              return
            } else {
              indexValues.add(tag.indexValue.trim())
            }
            // 判断 labelValue 是否重复
            if (labelValues.has(tag.labelValue.trim())) {
              ElMessage.error('标签名重复')
              return
            } else {
              labelValues.add(tag.labelValue.trim())
            }
          }
        }
        // 当type为2的时候，判断formData.value.label这个名字，是否与dataList.value的变量名重复，重复的话提示错误
        // if (type === '2') {
        //   const foundItem = dataList.value.find(item => item.label === formData.value.label)
        //   if (foundItem) {
        //     ElMessage.error('变量名重复，请修改变量名')
        //     return
        //   }
        // }
        if (activeTab.value === 'tab3' || dateType.value === 2) {
          typeValue.value = '2'
        } else {
          typeValue.value = '1'
        }
        const params = {
          colId: currentVisibleObj.value.colId,
          operateId: dataOperateIdValue.value,
          dataProperty: formData.value.newVarType,
          indexName: formData.value.label.trim(),
          dataType: formData.value.newType || '',
          params: formData.value.tagList ? formData.value.tagList : [],
          operateType: type === '1' ? 1 : 2,
          dataUpdateType: typeValue.value,
          inputConditions: {
            dateType: dateType.value,
            activeTab: activeTab.value,
            isSingleVarible: isSingleVarible.value,
            colNumber: currentVisibleObj.value.colNumber,
            newType: formData.value.newType
          }
        }
        if (formData.value.varType !== 1 && formData.value.newVarType === 1) {
          ElMessageBox.confirm(
            `定性变量/其他变量转换为定量变量将丢失标签数据!`,
            '转化确认',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              type: 'warning'
            }
          )
            .then(async () => {
              getDataEditList(params).then(res => {
                loading1.value = false
                loading2.value = false
                if (res.code === 10000) {
                  ElMessage.success('操作成功')
                  variableSelectionRef.value?.clearSelection()
                  choiceAllData.value = []
                  oldDisabledTypeArr.value = []
                  dataOperateIdValue.value = res.data.dataOperateId
                  getListData(res.data.colNumber)
                  emits('updateDataOperateId', res.data.dataOperateId)
                }
              })
            })
            .catch(() => {
              loadingBtnDom1.value?.handleLoading()
              loadingBtnDom2.value?.handleLoading()
              loadingBtnDom3.value?.handleLoading()
              loading1.value = false
              loading2.value = false
            })
        } else {
          getDataEditList(params).then(res => {
            loading1.value = false
            loading2.value = false
            if (res.code === 10000) {
              ElMessage.success('操作成功')
              variableSelectionRef.value?.clearSelection()
              choiceAllData.value = []
              oldDisabledTypeArr.value = []
              dataOperateIdValue.value = res.data.dataOperateId
              getListData(res.data.colNumber)
              emits('updateDataOperateId', res.data.dataOperateId)
            }
          })
        }
      } else if (type === '3') {
        const params = {
          colId: choiceAllData.value.map(item => dataList.value.find(i => i.label === item).colId),
          dataProperty: formData.value.batchNewVarType,
          operateId: dataOperateIdValue.value,
          inputConditions: {
            dateType: dateType.value,
            activeTab: activeTab.value,
            isSingleVarible: isSingleVarible.value,
            nameList: choiceAllData.value
          }
        }
        if (formData.value.batchVarType !== 1 && formData.value.batchNewVarType === 1) {
          ElMessageBox.confirm(
            `定性变量/其他变量转换为定量变量将丢失标签数据!`,
            '转化确认',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              type: 'warning'
            }
          ).then(async () => {
            batchSaveEdit(params).then(res => {
              loading1.value = false
              loading2.value = false
              if (res.code === 10000) {
                ElMessage.success('操作成功')
                choiceAllData.value = []
                oldDisabledTypeArr.value = []
                dataOperateIdValue.value = res.data.dataOperateId
                disabledTypeArr.value = []
                variableSelectionRef.value?.clearSelection()
                allChange.value = true
                getListData(res.data.colNumber)
                emits('updateDataOperateId', res.data.dataOperateId)
              }
            })
          }).catch(() => {
            loading1.value = false
            loading2.value = false
            loadingBtnDom1.value?.handleLoading()
            loadingBtnDom2.value?.handleLoading()
            loadingBtnDom3.value?.handleLoading()
          })
        } else {
          batchSaveEdit(params).then(res => {
            loading1.value = false
            loading2.value = false
            if (res.code === 10000) {
              ElMessage.success('操作成功')
              choiceAllData.value = []
              oldDisabledTypeArr.value = []
              dataOperateIdValue.value = res.data.dataOperateId
              disabledTypeArr.value = []
              variableSelectionRef.value?.clearSelection()
              allChange.value = true
              getListData(res.data.colNumber)
              emits('updateDataOperateId', res.data.dataOperateId)
            }
          })
        }
      }
    } else {
      loadingBtnDom1.value?.handleLoading()
      loadingBtnDom2.value?.handleLoading()
      loadingBtnDom3.value?.handleLoading()
    }
    emits('updateList', dataList.value)
  })
}

const handleName = () => {
  // 工程名称_变量名_数据视图_年月日时分秒
  return `${props.engineeringInfo?.name}_数据编辑_${metricName.value}_${nowDate(new Date())}`
}
const downloadGraph = (type) => {
  // const base64 = echarsDom.value.getBasePng()
  // downloadImage(base64, '数据视图')
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
defineExpose({
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
    .dataNameContent {
      max-width: 500px !important;
    }
  }
  :deep(.el-overlay-dialog) {
    .el-dialog {
      .mainContainer {
        .rightPanel {
          .dataInfoContainer {
            .el-form {
              display: flex;
              flex-direction: column;
              flex: 1;
              height: 0;
              .name-box {
                box-sizing: border-box;
                height: 94px;
                // margin-bottom: 16px;
                padding: 16px;
                border: 1px solid #e8e8e8;
                border-radius: 2px;
              }
              .el-form-item {
                flex-direction: column;
              }
              .el-form-item__label {
                justify-content: flex-start;
                height: 14px;
                margin-bottom: 16px;
                font-weight: 600;
                font-size: 14px;
                color: var(--theme-text);
              }
              .el-tabs {
                height: 29px;
                margin: 16px 0;
                line-height: 22px;
                &.tabs_tab1 {
                  .el-tabs__active-bar {
                    left: 26px !important;
                  }
                }
                &.tabs_tab2 {
                  .el-tabs__active-bar {
                    left: 44px !important;
                  }
                }
                &.tabs_tab3 {
                  .el-tabs__active-bar {
                    left: 40px !important;
                  }
                }
                .el-tabs__nav-scroll {
                  display: flex;
                  justify-content: center;
                }
                .el-tabs__nav-wrap::after {
                  height: 0;
                  background: none;
                }
                .el-tabs__nav {
                  .el-tabs__item {
                    height: 29px;
                    padding: 0;
                    &+.el-tabs__item {
                      margin-left: 24px;
                    }
                    .titleContainer {
                      font-weight: 400;
                      font-size: 14px;
                      color: var(--theme-text-2);
                    }
                  }
                  .el-tabs__item.is-active {
                    .titleContainer {
                      font-weight: 600;
                      color: var(--theme-primary);
                    }
                  }
                  .el-tabs__active-bar {
                    top: 27px !important;
                    width: 33px !important;
                  }
                }
                // .el-tabs__nav {
                //   .el-tabs__item.is-active {
                //     /* 第一个选项卡的活动条 */
                //     &:nth-child(0) .el-tabs__active-bar {
                //       left: 9% !important;
                //     }

                //     /* 第二个选项卡的活动条 */
                //     &:nth-child(1) .el-tabs__active-bar {
                //       left: 20% !important;
                //     }
                //   }
                // }

                .headerIcon {
                  font-size: 12px;
                }
              }
              .tag-box,
              .other-box {
                flex: 1;
                box-sizing: border-box;
                // height: 354px;
                padding: 16px;
                border: 1px solid #e8e8e8;
                border-radius: 2px;
                .el-form-item__content {
                  height: 32px;
                }
              }
              .tag-container {
                display: flex;
                overflow: hidden;
                flex-direction: column;
                padding: 13px 0 13px 16px !important;
                .tag-container-title {
                  display: flex;
                  z-index: 10;
                  height: 33px;
                  p {
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--theme-text);
                  }
                  p:nth-child(1) {
                    width: 48px;
                  }
                  p:nth-child(2) {
                    width: 60px;
                  }
                  p:nth-child(3) {
                    width: 169px;
                  }
                }
                .tag-container-content {
                  overflow-y: auto;
                  height: 100%;
                  padding-right: 16px;
                  li {
                    display: flex;
                    align-items: center;
                    margin-bottom: 16px;
                    .el-input:nth-child(1) {
                      width: 48px;
                      height: 32px;
                      .el-input__inner {
                        text-align: center;
                      }
                    }
                    .tag-span {
                      display: block;
                      width: 60px;
                      text-align: center;
                      font-weight: 400;
                      font-size: 14px;
                      color: var(--theme-text);
                    }
                    .el-input:nth-child(3) {
                      width: 169px;
                      height: 32px;
                    }
                  }
                  li:last-child {
                    margin-bottom: 0;
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
  // height: 32px;
}
:deep(.el-form-item:nth-last-of-type(1)) {
  margin-bottom: 0;
}
.toolTipContent {
  width: 369px;
}
:deep(.el-popper__arrow) {
  left: 2px !important;
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
</style>

