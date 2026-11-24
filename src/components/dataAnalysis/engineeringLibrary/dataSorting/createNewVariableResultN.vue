<template>
  <div class="data-cleansing">
    <el-dialog
      v-model="dialogVisible"
      :width="pxToRem(1035)"
      destroy-on-close
      :before-close="handleClose"
      body-class="bodyClass"
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
          <div class="subTitleContaier">
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
          <div class="subTitleContaier chartsSubtitle">
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
        <div class="paramsContainer" ref="paramsContainerDom">
          <el-scrollbar ref="ElScrollbarDom">
            <el-form
              ref="ruleFormRef"
              :rules="rules"
              :model="ruleForm"
              label-width="0"
            >
              <div class="subTitleContaier">
                <commonSubTitle text="原变量名称">
                </commonSubTitle>
              </div>
              <div class="paramsF">
                <div class="paramsItem">
                  <div class="label">原变量名称</div>
                  <el-form-item label="" prop="metricName">
                    <el-input v-model="ruleForm.metricName" maxlenght="60" disabled></el-input>
                  </el-form-item>
                </div>
              </div>
              <div class="subTitleContaier">
                <commonSubTitle text="生成变量信息">
                </commonSubTitle>
              </div>
              <div class="paramsF">
                <div class="paramsItem">
                  <div class="label">生成变量名称</div>
                  <el-form-item label="" prop="name">
                    <el-input class="paramsInput" placeholder="请填写内容" maxlength="60" v-model.trim="ruleForm.name"></el-input>
                  </el-form-item>

                </div>
                <div class="paramsItem">
                  <div class="label">生成变量类型</div>
                  <el-form-item label="" prop="type">
                    <el-select
                      class="paramsSelect"
                      v-model="ruleForm.type"
                      placeholder="请选择一项"
                      @change="changeVariateType"
                    >
                      <el-option
                        v-for="item in varList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </el-form-item>
                </div>
              </div>
              <div class="subTitleContaier">
                <commonSubTitle text="生成方法">
                </commonSubTitle>
              </div>
              <div class="paramsF">
                <div class="paramsItem">
                  <div class="label">生成方法</div>
                  <el-form-item label="" prop="createMethod">
                    <el-select
                      class="paramsSelect"
                      v-model="ruleForm.createMethod"
                      placeholder="请选择一项"
                      @change="changeCreateMethod"
                    >
                      <el-tooltip
                        v-for="item in createMethodList"
                        :key="item.value"
                        class="box-item"
                        effect="dark"
                        placement="left"
                        :disabled="!item.content"
                      >
                        <template v-slot:content>
                          <div
                            v-if="item.content"
                          >
                            {{ item.content || '无' }}
                          </div>
                        </template>
                        <el-option
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-tooltip>
                    <!-- <el-option
                      v-for="item in createMethodList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option> -->
                    </el-select>
                  </el-form-item>

                </div>
              </div>
              <!-- 定性变量 -->
              <template v-if="ruleForm.type === 'cls'">
                <!-- 生成方法 分组 -->
                <template v-if="ruleForm.createMethod === 'step_group'">
                  <el-form-item label="" prop="groupLisValidate" class="flex-line-div">
                    <div class="groupMethod groupMethod2">
                      <commonSubTitle text="分组编辑"></commonSubTitle>
                      <div
                        class="addIcon unselectable"
                        @click="addGroup"
                      >
                        <i class="iconfont icon-tianjiayihang"></i>
                        <span class="marginR">添加组</span>
                      </div>
                    </div>
                    <div class="line-tips">* 变量取值范围：{{ groupMinValue }} ~ {{ groupMaxValue }}</div>
                  </el-form-item>
                  <div class="fenzu">
                    <div
                      class="groupList"
                      v-for="(item, index) in groupList"
                      :key="index"
                    >
                      <div class="groupItem paramsF">
                        <div v-if="index !== 0" class="deleteBtn" @click="deleteGroup(item, index)">
                          <i
                            class="iconfont  icon-shanchu2"
                          ></i>
                        </div>
                        <div class="range">
                          <span class="groupLabel">区间</span>
                          <div class='paramsContent'>
                            <el-input-number
                              v-no-e
                              :controls="false"
                              :precision="2"
                              v-model.trim="item.startRange"
                              placeholder="请填写内容"
                            ></el-input-number>
                            <span class="yueDeng">~</span>
                            <el-input-number
                              v-no-e
                              :controls="false"
                              :precision="2"
                              v-model.trim="item.endRange"
                              placeholder="请填写内容"
                            ></el-input-number>
                          </div>
                        </div>
                        <div class="labelContent">
                          <div class="paramsContent">
                            <span class="groupLabel">标签</span>
                            <el-input
                              class="labelNum"
                              v-model.trim="item.label"
                              placeholder="请填写内容"
                            ></el-input>
                          </div>
                          <div class="paramsContent">
                            <span class="groupLabel">分组编码值</span>
                            <el-input
                              class="labelCode"
                              type="number"
                              placeholder="请填写内容"
                              v-model.trim="item.code"
                            ></el-input>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <!-- 生成方法 乘积变量编辑  这块可能是假方法可以暂时忽略-->
                <template v-if="ruleForm.createMethod === '多定量乘积'">
                  <div class="groupMethod">
                    <commonSubTitle text="乘积变量编辑"></commonSubTitle>
                    <span class="tips"></span>
                    <div
                      class="addIcon unselectable"
                      @click="addVariable"
                    >
                      <i class="iconfont icon-tianjiayihang"></i>
                      <span class="marginR">添加变量</span>
                    </div>
                  </div>
                  <div
                    v-for="(item, index) in chengjiList"
                    :key="index"
                    class="paramsF multiVolumeMultiplication"
                  >
                    <div v-if="index !== 0" class="deleteBtn" @click="deleteChengji(item, index)">
                      <i
                        class="iconfont  icon-shanchu2"
                      ></i>
                    </div>
                    <div class="nickLabel">变量{{ index + 1 }}</div>
                    <div class="chengjiItem">
                      <el-select
                        v-model="item.variable"
                        placeholder="请选择一项"
                      >
                        <el-option
                          v-for="item2 in chengJiOptions"
                          :key="item2.value"
                          :label="item2.label"
                          :value="item2.value"
                        >
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                </template>
                <!-- 生成方法 哑变量-->
                <template v-if="ruleForm.createMethod === 'dummy_variable'">
                  <el-form-item label="" prop="dummyVariableValidate">
                    <div class="groupMethod">
                      <commonSubTitle text="哑变量编辑"></commonSubTitle>
                      <span class="tips"></span>
                      <div
                        class="addIcon unselectable"
                        @click="addDumbItem"
                      >
                        <i class="iconfont icon-tianjiayihang"></i>
                        <span class="marginR">添加哑变量子项</span>
                      </div>
                    </div>
                  </el-form-item>
                  <div class="yaBianLiang">
                    <div
                      v-for="(item, index) in dumbList"
                      :key="index"
                      class="dumbContent paramsF"
                    >
                      <div v-if="index !== 0" class="deleteBtn" @click="deleteDumb(item, index)">
                        <i
                          class="iconfont  icon-shanchu2"
                        ></i>
                      </div>
                      <div class="dumbItem">
                        <div class="dumbOldLabel">
                          <span class="groupLabel">原标签</span>
                          <div class='paramsContent'>
                            <el-select
                              v-model="item.ori_encode"
                              placeholder="请选择一项"
                            >
                              <el-option
                                v-for="(item, index) in selectOptions"
                                :key="index"
                                :label="item.labelValue"
                                :value="item.indexValue"
                              >
                              </el-option>
                            </el-select>
                            <span class="originalCodeValue">原编码值</span>
                            <span class="dumbNum">{{ item.ori_encode ||'无'}}</span>
                          </div>
                        </div>
                        <div class="dumbLabelInput">
                          <span class="groupLabel">哑变量标签</span>
                          <el-input
                            v-model="item.dummy_variable_label"
                            placeholder="请填写内容"
                          ></el-input>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
              <!-- 定量变量 -->
              <template v-if="ruleForm.type === 'scale'">
                <!-- 生成方法 求和 -->
                <template v-if="ruleForm.createMethod === 'Add'">
                  <div class="groupMethod">
                    <commonSubTitle text="求和变量编辑"></commonSubTitle>
                    <span class="tips"></span>
                    <div
                      class="addIcon unselectable"
                      @click="addSumVariate"
                    >
                      <i class="iconfont icon-tianjiayihang"></i>
                      <span class="marginR">添加变量</span>
                    </div>
                  </div>
                  <div
                    v-for="(item, index) in sumList"
                    :key="index"
                    class="paramsF multiVolumeMultiplication"
                  >
                    <div v-if="index !== 0" class="deleteBtn" @click="deleteSumVariate(item, index)">
                      <i class="iconfont  icon-shanchu2"></i>
                    </div>
                    <div class="nickLabel">变量{{ index + 1 }}</div>
                    <div class="chengjiItem">
                      <el-select
                        v-model="item.variable"
                        filterable
                        :disabled="index === 0"
                        placeholder="请选择一项"
                        :fit-input-width="true"
                      >
                        <el-option
                          v-for="(item, index) in chengJiOptions"
                          :key="index"
                          :label="item.label"
                          :value="item.label"
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
                      </el-select>
                    </div>
                  </div>
                </template>
                <!-- 生成方法 z-score标准化 -->
                <!-- <template v-if="createMethod === 'Zscore'">
              <div class="nickLabel marTfu16">z-score值</div>
              <el-input  v-model.trim="scoreNum" placeholder="请填写内容"></el-input>
            </template> -->
                <!-- 生成方法 N次方 -->
                <template v-if="ruleForm.createMethod === 'array_npower'">
                  <div class="paramsF multiVolumeMultiplication">
                    <div class="nickLabel">N次方值</div>
                    <el-form-item label="" prop="nNum">
                      <el-input
                        type="number"
                        v-model.trim="ruleForm.nNum"
                        placeholder="请填写内容"
                        oninput="value=value.replace(/[^0-9]/g,'')"
                      ></el-input>
                    </el-form-item>
                  </div>
                </template>
                <!-- 生成方法 取整 -->
                <template v-if="ruleForm.createMethod === 'array_ceil'">
                  <div class="paramsF multiVolumeMultiplication">
                    <div class="nickLabel">取整方式</div>
                    <el-form-item label="" prop="arrayCeilType">
                      <el-select
                        v-model="ruleForm.arrayCeilType"
                        placeholder="请选择一项"
                      >
                        <el-option
                          v-for="item in arrayCeilTypeOptions"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </template>
              </template>
            </el-form>
            <div class="blankDom"></div>
          </el-scrollbar>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取&nbsp;消</el-button>
          <!-- <el-button type="primary" @click="handleSure(2)">
            生成新变量
          </el-button> -->
          <loading-btn
            type="primary"
            @handleSubmit="handleSure(2)"
            ref='loadingBtnDom'
          >
            生成新变量
          </loading-btn>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import variableSelection from '../common/variableSelection.vue'
import commonEchartsTitle from '../common/commonEchartsTitle.vue'
import echartsEmpty from '../common/echartsEmpty.vue'
import { nowDate } from '@/utils/utils.js'
import { histogramChartBasicOption, verticalBarChartBasicOption } from '../common/echartsConfig.js'
// eslint-disable-next-line no-unused-vars
import { ElMessage, ElMessageBox } from 'element-plus'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
// eslint-disable-next-line no-unused-vars
import lodash from 'lodash'
import { getAllVariables, getCreateVariableMethod, getVariableInterval, getDumbVariables, postGeneratingVariable, getChartData } from '@/api/api_dataAnalysis.js'
// eslint-disable-next-line no-unused-vars
const emits = defineEmits(['handleClose', 'updateDataOperateId', 'clearJumpData'])

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
const reconciliationFlag = ref(false)
onMounted(() => {
  if (props.jumpData) {
    reconciliationFlag.value = true
    dataOperateId.value = props.jumpData?.pid
    const result = lodash.get(props.jumpData, 'params')
    const initParams = JSON.parse(result)
    colNumber.value = initParams.colNumber
    ruleForm.value.type = lodash.get(initParams, 'createType')
  } else {
    dataOperateId.value = props.engineeringInfo?.dataOperateId
  }
  getDataList()
})
const handleInitParams = () => {
  nextTick(() => {
    reconciliationFlag.value = false
    toCurrent.value = true
    const result = lodash.get(props.jumpData, 'params')
    const initParams = JSON.parse(result)
    ruleForm.value.type = lodash.get(initParams, 'createType')
    ruleForm.value.metricName = lodash.get(initParams, 'metric_name')
    ruleForm.value.name = lodash.get(initParams, 'metric_name_new') || lodash.get(initParams, 'generate_metric_name')
    colNumber.value = initParams.colNumber
    ruleForm.value.createMethod = lodash.get(initParams, 'createMethod')
    dumbList.value = lodash.get(initParams, 'map_dict_res', [])
    groupList.value = lodash.get(initParams, 'step_group', [])
    const metricListArr = lodash.get(initParams, 'metric_name_list', [])
    metricListArr.forEach(item => {
      sumList.value.push({
        variable: item
      })
    })
    changeCreateMethod()
    if (ruleForm.value.createMethod === 'array_npower') {
      ruleForm.value.nNum = lodash.get(initParams, 'params', '')
    } else {
      ruleForm.value.arrayCeilType = lodash.get(initParams, 'params', '')
    }
  })
}
const dialogVisible = ref(true)
const handleClose = (done) => {
  emits('handleClose')
  if (done) {
    done()
  }
}
// 需要传入的数据
const dataList = ref()
const variableSelectionDom = ref(null)

const getDataList = () => {
  getAllVariables({ id: dataOperateId.value }).then(v => {
    dataList.value = v.data || []
    if (props.jumpData && reconciliationFlag.value) {
      handleInitParams()
    }
  })
}

const varList = ref([
  { value: 'cls', label: '定性变量' },
  { value: 'scale', label: '定量变量' }
])
const currentVar = ref({})
const dataOperateId = ref('')
const { selectColumn } = props.titleObj
const colNumber = ref('')
if (selectColumn) {
  colNumber.value = selectColumn.colNumber
}
const handleChange = (obj, isInitiative) => {
  toCurrent.value = false
  currentVar.value = obj
  metricName.value = obj.label
  ruleForm.value.metricName = obj.label
  getChartDataFn()
  if ((!props.jumpData && !isInitiative) || isInitiative) {
    if (currentVar.value.dataProperty === 1) {
      ruleForm.value.type = 'scale'
    } else {
      ruleForm.value.type = 'cls'
    }
  }
  if (ruleForm.value.type) {
    changeVariateType(ruleForm.value.type)
  }
}
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
const handleName = () => {
  // 工程名称_变量名_数据视图_年月日时分秒
  return `${props.engineeringInfo?.name}_${props.titleObj.name}_${metricName.value}_${nowDate(new Date())}`
}
const echartsOptions = ref({})
const xAxisName = ref('')
const yAxisName = ref('')
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
const metricName = ref('')
const createMethodList = ref([])
const arrayCeilTypeOptions = ref([
  { value: 0, label: '向下取整' },
  { value: 1, label: '向上取整' },
  { value: 2, label: '四舍五入' }
])
const changeVariateType = (val) => {
  toCurrent.value = false
  ruleForm.value.createMethod = ''
  if (!ruleForm.value.metricName || !ruleForm.value.type) return
  getCreateVariableMethod({
    newDataProperty: ruleForm.value.type === 'cls' ? 0 : 1,
    oldDataProperty: currentVar.value.dataProperty
  }).then(v => {
    if (v.code === 10000) {
      createMethodList.value = lodash.get(v, 'data.methodList', [])
    }
  })
}
const dumbList = ref([])
const sumList = ref([])
const chengJiOptions = ref([])
// 选择生成方法
const changeCreateMethod = () => {
  switch (ruleForm.value.createMethod) {
    case 'step_group': // 分组
      getGroupData()
      break
    case 'dummy_variable': // 哑变量
      if (!toCurrent.value) {
        // 非节点跳转至逻辑
        dumbList.value = [
          {
            ori_encode: '',
            dummy_variable_label: ''
          }
        ]
        handleScroll()
      }
      getDumbVariablesFn()
      break
    case 'Add': // 求和
    // 获取所有的变量,
      chengJiOptions.value = dataList.value.filter(item => item.dataProperty === 1)
      if (!toCurrent.value) {
        // 非节点跳转至逻辑
        sumList.value = [{ variable: metricName.value }]
      }
      handleScroll()
      break
  }
}
const selectOptions = ref([])
const groupMaxValue = ref('')
const groupMinValue = ref('')
const toCurrent = ref(false) // True 节点跳转过来的 false 非节点跳转至过来的
const groupList = ref([])
// 添加分组
const addGroup = () => {
  // 点击添加组--开始至为上一个组结束值+1--如果上一个项目结束值为最大值 则 添加分组时候 开始值为最大值
  groupList.value.push({
    startRange:
          groupList.value[groupList.value.length - 1].endRange < groupMaxValue.value
            ? Number(groupList.value[groupList.value.length - 1].endRange) || 0
            : groupMinValue.value,
    endRange: groupMaxValue.value,
    label: '',
    code: ''
  })
  handleScroll()
}
// 删除分组
const deleteGroup = (item, index) => {
  groupList.value.splice(index, 1)
}
// 获取哑变量下拉选项
const getDumbVariablesFn = () => {
  getDumbVariables({ colId: currentVar.value.colId })
    .then(res => {
      if (res.code === 10000) {
        selectOptions.value = lodash.get(res, 'data.dictList', [])
      }
    })
    .catch(() => {})
}
// 获取分组最大值和最小值
const getGroupData = () => {
  // flag true 跳转至逻辑 false非跳转至逻辑
  getVariableInterval({ colId: currentVar.value.colId }).then(res => {
    if (!toCurrent.value) {
      groupList.value = [
        {
          startRange: res.data.minValue || 0,
          endRange: res.data.maxValue || 0,
          label: '',
          code: ''
        }
      ]
      handleScroll()
    }

    groupMaxValue.value = res.data.maxValue || 0
    groupMinValue.value = res.data.minValue || 0
  })
}
const addDumbItem = () => {
  dumbList.value.push({
    ori_encode: '',
    dummy_variable_label: ''
  })
  handleScroll()
}
const deleteDumb = (item, index) => {
  dumbList.value.splice(index, 1)
}

const chengjiList = ref([
  {
    variable: ''
  }
])
// 添加乘积变量
const addVariable = () => {
  chengjiList.value.push({
    variable: ''
  })
}
// 删除乘积变量
const deleteChengji = (item, index) => {
  chengjiList.value.splice(index, 1)
}
const paramsContainerDom = ref()
const ElScrollbarDom = ref()
const handleScroll = () => {
  nextTick(() => {
    ElScrollbarDom.value.setScrollTop(paramsContainerDom.value.offsetHeight)
  })
}
// 求和变量编辑
const addSumVariate = () => {
  sumList.value.push({
    variable: ''
  })
  handleScroll()
}
const deleteSumVariate = (item, index) => {
  sumList.value.splice(index, 1)
}
const ruleFormRef = ref(null)
// const metricNameValidate = (rule, value, callback) => {
//   let flag = true
//   dataList.value.forEach(item => {
//     if (item.label === value) {
//       flag = false
//     }
//   })
//   if (flag) {
//     callback()
//   } else {
//     callback(new Error('当前变量名称该数据集中已存在，请重新设置!'))
//   }
// }
const groupLisValidate = (rule, value, callback) => {
  let flag1 = true
  let flag2 = true
  const codes = groupList.value.map(item => item.code)
  const endRanges = groupList.value.map(item => item.endRange)
  const labels = groupList.value.map(item => item.label)
  const startRanges = groupList.value.map(item => item.startRange)
  const groupEncodeds = groupList.value.map(item => item.code)
  const newGroupEncodes = [...new Set(groupEncodeds)]
  if (codes.includes('') || endRanges.includes('') || labels.includes('') || startRanges.includes('') || codes.includes(null) || endRanges.includes(null) || labels.includes(null) || startRanges.includes(null)) {
    flag1 = false
  } else {
    flag1 = true
  }
  if ((newGroupEncodes.length === groupEncodeds.length)) {
    flag2 = true
  } else {
    flag2 = false
  }
  if (flag1 && flag2) {
    callback()
  } else if (!flag1) {
    callback(new Error('信息填写不完整'))
  } else {
    callback(new Error('分组编码值不可重复'))
  }
}
const dummyVariableValidate = (rule, value, callback) => {
  const flag1 = ruleForm.value.createMethod === 'dummy_variable' && dumbList.value?.length
  let flag2 = true
  let flag3 = true
  let flag4 = true
  const originCodes = dumbList.value?.map(item => item.ori_encode) || []
  const dumpList = dumbList.value?.map(item => item.dummy_variable_label) || []
  if (originCodes.includes('') || dumpList.includes('')) {
    flag2 = false
  } else {
    flag2 = true
  }
  const newOriginCodes = [...new Set(originCodes)] || []
  if (originCodes.length !== newOriginCodes.length) {
    flag3 = false
  } else {
    flag3 = true
  }
  const dumpLabels = dumbList.value.map(item => item.dummy_variable_label)
  const newDumpLabels = [...new Set(dumpLabels)] || []
  if (newDumpLabels.length !== 2) {
    flag4 = false
  } else {
    flag4 = true
  }
  if (flag1 && flag2 && flag3 && flag4) {
    callback()
  } else if (!flag1) {
    callback(new Error('请添加哑变量子项'))
  } else if (!flag2) {
    callback(new Error('信息不完整'))
  } else if (!flag3) {
    callback(new Error('原标签不能重复'))
  } else if (!flag4) {
    callback(new Error('哑变量标签不应一致'))
  }
}
const rules = reactive({
  metricName: [
    { required: true, message: '请填写', trigger: 'blur' },
    { max: 60, message: '最长60字符', trigger: 'blur' }
  ],
  type: { required: true, message: '请选择', trigger: 'change' },
  name: [
    { required: true, message: '请填写', trigger: 'blur' },
    { max: 60, message: '最长60字符', trigger: 'blur' }
    // { validator: metricNameValidate, trigger: 'blur' }
  ],
  createMethod: { required: true, message: '请选择', trigger: 'change' },
  groupLisValidate: { validator: groupLisValidate, trigger: 'blur' },
  dummyVariableValidate: { validator: dummyVariableValidate, trigger: 'blur' },
  nNum: { required: true, message: '请填写', trigger: 'blur' },
  arrayCeilType: { required: true, message: '请选择', trigger: 'change' }
})
const ruleForm = ref({
  metricName: '',
  type: '',
  name: '',
  createMethod: ''
})
const loadingBtnDom = ref()
const handleSure = (rewrite_ori_metric) => {
  ruleFormRef.value.validate(valid => {
    if (valid) {
      ElMessageBox.confirm(`生成新变量将直接作用到当前数据集上`, `生成新变量`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let params = {}
        let apiName = ''
        let metricList = []
        let colIdList = [currentVar.value.colId]
        switch (ruleForm.value.createMethod) {
          case 'step_group':
            // 分组
            apiName = 'step_groups'
            params = {
              metric_name: ruleForm.value.metricName,
              metric_name_new: ruleForm.value.name,
              step_group: groupList.value,
              rewrite_ori_metric: '1', // 生成
              createType: ruleForm.value.type
              // order_selection: this.isOrderly//是否有序
            }
            break
          case 'dummy_variable':
            apiName = 'generate_dummy_variable'
            params = {
              metric_name: ruleForm.value.metricName,
              metric_name_new: ruleForm.value.name,
              rewrite_ori_metric: '1', // 生成
              map_dict_res: dumbList.value,
              createType: ruleForm.value.type
            }
            // 分组
            break
          default:
            apiName = 'generate_metric'
            metricList = sumList.value.map(item => item.variable).filter(it => it !== '')
            params = {
              metric_name: ruleForm.value.metricName,
              generate_metric_name: ruleForm.value.name,
              rewrite_ori_metric: '1',
              generate_method: ruleForm.value.createMethod,
              metric_name_list: metricList,
              params: ruleForm.value.createMethod === 'array_npower' ? ruleForm.value.nNum : ruleForm.value.arrayCeilType,
              createType: ruleForm.value.type
            }
            if (ruleForm.value.createMethod !== 'Add') {
              delete params.metric_name_list
            }
            if (!['array_npower', 'array_ceil'].includes(ruleForm.value.createMethod)) {
              delete params.params
            }
            if (ruleForm.value.createMethod === 'Add') {
              colIdList = []
              metricList.forEach(item => {
                const arr = lodash.filter(chengJiOptions.value, { label: item })
                if (arr.length) {
                  colIdList.push(arr[0].colId)
                }
              })
            }
            break
        }
        postGeneratingVariable({
          apiName,
          bigGroup: '数据整理',
          colIdList,
          dataOperateId: dataOperateId.value,
          smallGroup: '生成变量',
          params: {
            ...params,
            colNumber: currentVar.value.colNumber,
            createMethod: ruleForm.value.createMethod,
            field: [
              {
                metric: currentVar.value.label,
                metric_type: currentVar.value.dataProperty
              }
            ]
          }
        }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('操作成功')
            dataOperateId.value = res.data.dataOperateId
            ruleForm.value = {}
            nextTick(() => {
              ruleFormRef.value.resetFields()
            })
            emits('clearJumpData')
            getDataList()
            colNumber.value = res.data.colNumber
            emits('updateDataOperateId', res.data.dataOperateId)
          }
        })
      }).catch(() => {
        loadingBtnDom.value.handleLoading()
      })
    } else {
      loadingBtnDom.value.handleLoading()
      console.log('没有通过')
    }
  })
}

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
  max-width: 1000px;
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
    .subTitleContaier {
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
  .subTitleContaier {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }
  .paramsContainer {
    overflow: hidden;
    flex: 1;
    height: 548px;
    .paramsF {
      box-sizing: border-box;
      width: 100%;
      padding: 16px;
      border: 1px solid #e8e8e8;
      .paramsItem {
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
        &:nth-last-of-type(1) {
          margin-bottom: 0;
        }
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
          height: 32px;
        }
      }
    }
    .subTitleContaier {
      margin-top: 16px;
      &:nth-of-type(1) {
        margin-top: 0;
      }
    }
    .blankDom {
      height: 16px;
    }
  }
}
.groupMethod {
  display: flex;
  align-items: center;
  flex: 1;
  margin-top: 16px;
  .tips {
    flex: 1;
    padding-left: 8px;
    font-weight: 400;
    font-size: 12px;
    color: var(--theme-text-3);
  }
  .addIcon {
    cursor: pointer;
    line-height: 20px;
    font-weight: 500;
    font-size: 14px;
    color: var(--theme-primary);
    .iconfont {
      margin-right: 6px;
      font-size: 12px;
    }
    .marginR {
      margin-right: 16px;
    }
  }
}
:deep(.flex-line-div) {
  .el-form-item__content {
    flex-direction: column;
  }
}
.groupMethod2 {
  justify-content: space-between;
  width: 100%;
}
.line-tips {
  width: 100%;
  height: 17px;
  margin-top: 5px;
  line-height: 17px;
  font-size: 12px;
  color: var(--theme-text-3);
}
.groupList {
  .groupItem {
    margin-top: 16px;
    .range,
    .labelContent {
      display: flex;
      &.range {
        flex-direction: column;
      }
      .groupLabel {
        margin-bottom: 16px;
        line-height: 20px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
      .paramsContent {
        display: flex;
        align-items: center;
      }
      .yueDeng {
        margin: 0 10px;
        line-height: 14px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-3);
      }
    }
    .labelContent {
      margin-top: 16px;
      .paramsContent:nth-of-type(1) {
        margin-right: 16px;
      }
      .paramsContent {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .groupLabel {
        &:nth-of-type(2) {
          margin-left: 10px;
        }
      }
    }
  }
}
.yaBianLiang {
  .paramsF {
    margin-top: 16px;
  }
  .dumbItem {
    .dumbOldLabel,
    .dumbLabelInput {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
      .groupLabel {
        margin-bottom: 16px;
        line-height: 20px;
        font-weight: 500;
        font-size: 14px;
        color: var(--theme-text);
      }
      .paramsContent {
        display: flex;
        align-items: center;
      }
      .originalCodeValue,
      .dumbNum {
        line-height: 20px;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-3);
        word-break: keep-all;
      }
      .originalCodeValue {
        margin-left: 9px;
        margin-right: 4px;
      }
      .dumbNum {
        color: var(--theme-text);
      }
    }
    .dumbLabelInput {
      margin-bottom: 0;
    }
  }
}
.multiVolumeMultiplication {
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  .nickLabel {
    margin-bottom: 16px;
    line-height: 14px;
    font-weight: 500;
    font-size: 14px;
    color: var(--theme-text);
  }
  .chengjiItem {
    flex: 1;
  }
}
.paramsF {
  overflow: hidden;
  position: relative;
  border-radius: 2px;
  &:hover {
    .deleteBtn {
      display: flex;
      z-index: 2;
      justify-content: center;
      align-items: center;
    }
  }
  .deleteBtn {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    width: 24px;
    height: 24px;
    margin-right: 6px;
    margin-top: 2px;
    // background: var(--theme-fill);
    cursor: pointer;
    font-size: 14px;
    color: #ff4e4e;
  }
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
