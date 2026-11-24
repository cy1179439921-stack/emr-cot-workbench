<template>
  <div class="data-cleansing">
    <div class="content">
      <div class="main leftPanel">
        <div class="subTitleContainer">
          <commonSubTitle text="选择变量">
          </commonSubTitle>
        </div>

        <div class="variableSelectionContainer">
          <variableSelection
            ref="variableSelectionRefDom"
            :uniSaveFilterList="uniSaveFilterList"
            :filteredList="filteredList"
            :titleObj="titleObj"
            dataType="2"
            :colNumber="currentVar.colNumber"
            @handleChange="handleChange"
            :initDataList="dataList"
            showToolTip
          >
          </variableSelection>
        </div>
        <div class="subTitleContainer chartsSubtitle">
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
      <div class="paramsContainer">
        <div>
          <el-tooltip
            class="box-item"
            effect="dark"
            placement="bottom-start"
          >
            <div class="subTitleContainer">
              <commonSubTitle v-show="currentVar.dataProperty!=0" text="筛选区间">
              </commonSubTitle>
              <commonSubTitle v-show="currentVar.dataProperty==0" text="筛选类别">
              </commonSubTitle>
              <i class="iconfont icon-querentishi headerIcon"></i>
            </div>
            <template #content>
              <div class="toolTipContent">
                “x”代表被选的数据。您可以通过选择符号
                <br/>
                和修改数字来控制被选中值域的范围。
              </div>
            </template>
          </el-tooltip>
        </div>
        <div class="paramsF">
          <el-scrollbar>
            <div
              v-if="currentVar?.dataProperty == '0'"
              class="handleContent"
            >
              <div class="title">
                <div class="labelText">已选类别</div>
                <el-checkbox
                  v-model="isCheckAll"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                >
                  全选
                </el-checkbox>
              </div>
              <div class="filterContent">
                <template v-for="(item, index) in pageSelected">
                  <div
                    v-if="item.colId == colId"
                    :key="index + 'pageSelected'"
                    class="filterItem"
                  >
                    <div class="renderDom">
                      <div class="left">
                        <div v-show-tip class="content">
                          <el-tooltip
                            class="box-item"
                            effect="dark"
                            :content="item.labelValue"
                            placement="bottom"
                            :open-delay="400"
                            :enterable="false"
                            :hide-after="0"
                          >
                            <div class="treeLabel">{{ '标签名：'+item.labelValue }}</div>
                          </el-tooltip>
                        </div>
                        <div v-show-tip class="content">
                          <el-tooltip
                            class="box-item"
                            effect="dark"
                            :content="item.indexValue"
                            placement="bottom"
                            :open-delay="400"
                            :enterable="false"
                            :hide-after="0"
                          >
                            <div class="treeLabel">{{ '编码值：'+item.indexValue }}</div>
                          </el-tooltip>
                        </div>
                      </div>
                      <i class="iconfont deleteIcon icon-jianshao-1"
                         @click="cancel(item, index)"
                      ></i>
                    </div>
                  </div>
                </template>
              </div>
              <div class="title unselected">
                <div class="labelText">未选类别</div>
              </div>
              <div class="filterContent">
                <template v-for="(item, index) in pageUnSelected">
                  <div
                    :key="index + 'pageUnSelected'"
                    v-if="item.colId == colId"
                    class="filterItem"
                  >
                    <div class="renderDom">
                      <div class="left">
                        <!-- <span></span> -->
                        <div v-show-tip class="content">
                          <el-tooltip
                            class="box-item"
                            effect="dark"
                            :content="item.labelValue"
                            placement="bottom"
                            :open-delay="400"
                            :enterable="false"
                            :hide-after="0"
                          >
                            <div class="treeLabel">{{ '标签名：'+item.labelValue }}</div>
                          </el-tooltip>
                        </div>
                        <div v-show-tip class="content">
                          <el-tooltip
                            class="box-item"
                            effect="dark"
                            :content="item.indexValue"
                            placement="bottom"
                            :open-delay="400"
                            :enterable="false"
                            :hide-after="0"
                          >
                            <div class="treeLabel">{{ '编码值：'+item.indexValue }}</div>
                          </el-tooltip>
                        </div>
                        <!-- <span>编码值：{{ item.indexValue }}</span> -->

                      </div>
                      <i
                        class="iconfont icon-tianjia-1"
                        @click="add(item, index)"
                      ></i>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <div
              v-if="currentVar?.dataProperty =='1'"
              class="handleContent"
            >
              <el-scrollbar>
                <div class="title">
                  <div class="labelText">已选区间</div>
                  <el-checkbox
                    v-model="isCheckAll"
                    :indeterminate="isIndeterminate"
                    @change="handleCheckAllChange"
                  >
                    全选
                  </el-checkbox>
                </div>
                <div class="filterContent">
                  <template v-for="(item, index) in pageSelected">
                    <div
                      v-if="item.colId == colId"
                      :key="index + 'pageSelected'"
                      class="filterItem range"
                    >
                      <div class="renderDom">
                        <span class="label">值域：</span>
                        <el-input
                          type="number"
                          :class="{ customInput:true,warning: !item.startValue }"
                          @blur="editRange(item.startValue)"
                          v-model.trim="item.startValue"
                        />
                        <el-select
                          v-model="item.startSymbol"
                          @change="editRange(item.startValue)"
                          placeholder=""
                          class="customSelect"
                        >
                          <el-option
                            v-for="item in startComputingOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                          >
                          </el-option>
                        </el-select>
                        <i class="iconfont icon-zimuX aks"></i>
                        <el-select
                          v-model="item.endSymbol"
                          @change="editRange(item.endValue)"
                          class="customSelect"
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
                          type="number"
                          :class="{
                            customInput:true,
                            warning: !item.endValue
                          }"
                          @blur="editRange(item.endValue)"
                          v-model.trim="item.endValue"
                        />
                        <i class="iconfont deleteIcon icon-jianshao-1" @click="cancel(item, index)"
                        ></i>
                      </div>
                    </div>
                  </template>
                </div>
                <div class="title unselected">
                  <div class="labelText">未选区间</div>
                </div>
                <div class="filterContent">
                  <template v-for="(item, index) in pageUnSelected">
                    <div
                      :key="index + 'pageUnSelected'"
                      v-if="item.colId == colId"
                      class="filterItem range"
                    >
                      <div class="renderDom">
                        <span class="label">值域：</span>
                        <el-input
                          type="number"
                          :class="{ customInput:true,warning: !item.startValue }"
                          v-model.trim="item.startValue"
                        />
                        <el-select
                          class="customSelect"
                          v-model="item.startSymbol"
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
                        <i class="iconfont icon-zimuX aks"></i>
                        <el-select
                          class="customSelect"
                          v-model="item.endSymbol"
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
                          type="number"
                          :class="{
                            customInput:true,
                            warning: !item.endValue
                          }"
                          v-model.trim="item.endValue"
                        />
                        <i class="iconfont icon-tianjia-1" @click="add(item, index)"
                        ></i>
                      </div>
                    </div>
                  </template>
                </div>
              </el-scrollbar>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>
    <!-- <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose(false)">取&nbsp;消</el-button>
          <loading-btn
            type="primary"
            @handleSubmit="saveDataFilterFn"
            ref='loadingBtnDom'
          >
            筛选并覆盖数据集
          </loading-btn>
        </div>
      </template> -->
  </div>
</template>
<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import variableSelection from '@/components/dataAnalysis/engineeringLibrary/common/variableSelection.vue'
import commonEchartsTitle from '@/components/dataAnalysis/engineeringLibrary/common/commonEchartsTitle.vue'
import echartsEmpty from '@/components/dataAnalysis/engineeringLibrary/common/echartsEmpty.vue'
import { useDataFilterHook } from '@/hooks/dataFilterHook.js'
import fileDownload from 'js-file-download'
import html2canvas from 'html2canvas'
import { nowDate } from '@/utils/utils.js'
import lodash from 'lodash'
const loadingBtnDom = ref()
const resetLoading = () => {
  loadingBtnDom.value.handleLoading()
}
// eslint-disable-next-line no-unused-vars
const {
  startComputingOptions,
  endComputingOptions,
  getChartsDataFn,
  pageSelected,
  pageUnSelected,
  checkAll,
  editRange,
  cancel,
  add,
  filteredList,
  saveDataFilterFn,
  uniSaveFilterList,
  getDataList,
  dataList,
  currentVar,
  echartsOptions,
  dataOperateId,
  isCheckAll,
  isShowCharts
} = useDataFilterHook(resetLoading)
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
// const currentVar = ref({})
const metricName = ref('')
const colId = ref('')

const isIndeterminate = ref(false)
const handleCheckAllChange = () => {
  if (isCheckAll.value) {
    checkAll(true)
  } else {
    checkAll(false)
  }
}
const xAxisName = ref('')
const yAxisName = ref('')
const { selectColumn } = props.titleObj
if (selectColumn) {
  currentVar.value = selectColumn
}

const handleChange = (obj) => {
  currentVar.value = obj
  metricName.value = obj.label
  colId.value = obj.colId
  xAxisName.value = metricName.value
  yAxisName.value = '样本量'
  getChartsDataFn({
    colId: obj.colId,
    operateId: dataOperateId.value,
    params: pageSelected.value
  })
}
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
const variableSelectionRefDom = ref(null)
onMounted(() => {
  if (props.jumpData) {
    dataOperateId.value = props.jumpData?.pid
    pageSelected.value = []
    props.jumpData?.organizeHistoryViewVO.forEach(item => {
      pageSelected.value = pageSelected.value.concat(item.params || [])
    })
    currentVar.value = lodash.get(pageSelected.value, '[0]')
  } else {
    dataOperateId.value = props.engineeringInfo?.dataOperateId
  }
  nextTick(() => {
    getDataList(dataOperateId.value, variableSelectionRefDom.value)
  })
})
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
@use '@/style/element/analysisCommon.scss';
.data-cleansing {
  :deep(.el-overlay-dialog) {
    .el-dialog {
      display: flex;
      flex-direction: column;
      height: 691px;
      .el-dialog__body {
        overflow: hidden;
      }
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
  // width: 630px;
  // width: 100%;
  height: 0;
  .dataNameContent {
    // max-width: 500px !important;
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
  overflow: hidden;
  width: 100%;
  height: 100%;
  .main {
    display: flex;
    flex-direction: column;
    .subTitleContainer {
      height: 22px;
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
      // width: 100%;
      // width: 630px;
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
    .subTitleContainer {
      width: 90px;
    }
    .paramsF {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      // width: 341px;
      // width: 100%;
      max-height: 545px;
      // padding: 16px;
      // border: 1px solid #e8e8e8;
      :deep(.el-scrollbar) {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .handleContent {
        .title {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          &.unselected {
            margin-top: 16px;
          }
          .labelText {
            flex: 1;
            line-height: 14px;
            font-weight: 500;
            font-size: 14px;
            color: var(--theme-text);
          }
          :deep(.el-checkbox) {
            height: auto;
          }
        }
        .filterContent {
          box-sizing: border-box;
          // width: 305px;
          min-height: 52px;
          padding: 10px;
          // border: 1px solid #d8d8d8;
          border-radius: 2px;
          background: var(--theme-card);
          .filterItem {
            display: flex;
            overflow: hidden;
            align-items: center;
            box-sizing: border-box;
            // width: 100%;
            min-height: 32px;
            margin-bottom: 10px;
            padding: 0 12px;
            border-radius: 2px;
            background: var(--theme-fill);
            &:nth-last-of-type(1) {
              margin-bottom: 0;
            }
            &.range {
              height: 50px;
            }
            .renderDom {
              display: flex;
              overflow: hidden;
              flex-wrap: wrap;
              align-items: center;
              flex: 1;
              .left {
                display: flex;
                overflow: hidden;
                flex-wrap: wrap;
                align-items: center;
                flex: 1;
                width: 100%;
                .content {
                  display: flex;
                  box-sizing: border-box;
                  width: 50%;
                  padding-right: 16px;
                }
                span,
                div {
                  line-height: 22px;
                  font-weight: 400;
                  font-size: 14px;
                  color: var(--theme-text-2);
                }
              }
              .label {
                font-size: 14px;
                color: var(--theme-text-2);
                word-break: keep-all;
              }
              .customSelect,
              .customInput {
                width: 42px;
                margin-right: 3px;
              }
              .aks {
                margin-right: 3px;
              }
              .iconfont {
                flex-shrink: 0;
                margin-left: 8px;
                cursor: pointer;
                font-size: 15px;
                color: var(--theme-primary);
                &.aks {
                  margin-left: 0;
                }
                &.icon-zimuX {
                  color: var(--theme-text);
                }
                &.deleteIcon {
                  color: rgb(230, 162, 60);
                }
              }
            }
          }
        }
      }
    }
  }
  .subTitleContainer {
    display: flex;
    position: relative;
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
  // max-width: 50px;
  line-height: 20px;
  text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
}
</style>
