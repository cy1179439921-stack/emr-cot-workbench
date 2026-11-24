<template>
  <div class="medicalRecordIndex">
    <div class="main">
      <div class="treeContainer" v-show="leftSectionExpand">
        <div class="header">
          <div class="title">
            <div>显示指标</div>
            <div class="flexCenter" @click="leftSectionExpand = false">
              <el-tooltip class="box-item" effect="dark" content="收起指标栏" placement="bottom">
                <i class="iconfont icon-shouqiliebiao"></i>
              </el-tooltip>
            </div>
          </div>
          <CommonInput v-model="filterText" placeholder="搜索名称" class="search" clearable/>
        </div>
        <div class="leftTree treeClearFocuStyle">
          <el-scrollbar style="height: 100%;">
            <el-tree
              class="treeRef"
              ref="treeRef"
              :data="treeSource"
              show-checkbox
              :indent="indent"
              node-key="soleID"
              :draggable="true"
              default-expand-all
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @check="changeChecked"
              :allow-drag="allowDrag"
              @node-drag-start="onStart"
              @node-drag-end="onEnd"
              :allow-drop="() => false"
              :props="{
                children: 'children',
                label: 'label',
              }"
            >
              <template #default="{ node, data }">
                <div class="customTreeNode" v-show-tip>
                  <el-tooltip
                    class="box-item"
                    effect="dark"
                    :content="node.label"
                    placement="bottom"
                    :open-delay="400"
                    :enterable="false"
                    :hide-after="0"
                  >
                    <span :class="'treeLabel'+' '+'level'+data.levelClass">{{ node.label }}</span>
                  </el-tooltip>
                  <img v-if="!data.children && checkedIdsSet.has(data.soleID)" :src="hookImg" class="hookImg" alt="" />
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="treeContainer hideLeftSection" v-show="!leftSectionExpand">
        <div class="iconDiv" @click="leftSectionExpand = true">
          <el-tooltip class="box-item" effect="dark" content="展开指标栏" placement="bottom">
            <i class="iconfont icon-zhankailiebiao"></i>
          </el-tooltip>
        </div>
        <div class="hintDiv"></div>
      </div>
      <div class="tableAndSearch">
        <div class="searchContainer" :class="{ treeFull: !isTreeFull && queryWay === 2 }">
          <div class="searchTitle">
            <div class="dimensionality">
              <div class="label">查询维度：</div>
              <el-radio-group v-model="queryDimension" class="queryDimension">
                <el-radio-button :value="1">就诊维度</el-radio-button>
                <el-radio-button :value="2">患者维度</el-radio-button>
              </el-radio-group>
              <div class="label">查询方式：</div>
              <el-radio-group v-model="queryWay" class="queryWay">
                <el-radio-button :value="1">常规查询</el-radio-button>
                <el-radio-button :value="2">条件树</el-radio-button>
              </el-radio-group>
            </div>
            <div class="topOpr">
              <div class="inCommonUse" @click="handleSelctCommonUse">
                <i class="iconfont icon-xuanzechangyongxiang1"></i>
                <span class="label">常用查询项：</span>
                <span>{{ filterName }}</span>
              </div>
              <div class="saveCommonUse" @click="handelSaveCommonUse">
                <i class="iconfont icon-baocunweichangyong"></i>
                <span>保存为常用</span>
              </div>
              <div class="addConditions" v-if="queryWay === 1" @click="handelAddConditions">
                <i class="iconfont icon-tianjiaxuanzexiang1"></i>
                <span>添加查询条件</span>
              </div>
              <div class="addSearchBtn" v-if="queryWay === 2">
                <div class="common-btn" @click="handelReset">重置条件</div>
                <div class="common-btn primary btnSpace" @click="handleSub">查 询</div>
              </div>
            </div>
          </div>
          <div id="mySearchRef" v-show="queryWay === 1">
            <mySearch
              ref="mySearchRef"
              :search="search"
              :options="options"
              :needDel="true"
              @handleSearch="handleSub"
              @handelDel="handelDel"
              :value="echoValue"
            >
              <div class="whether no-select" v-if="showUnfoldBtn && queryWay === 1" @click="handelClickUnfoldBtn">
                <span>{{ unfold ? '收起' : '展开' }}</span>
                <i class="iconfont icon-xuanzekuang-xiala" :class="{rotate:unfold}"></i>
              </div>
              <div class="common-btn" @click="handelReset">重置条件</div>
              <div class="common-btn primary btnSpace" @click="handleSub">查&nbsp;询</div>
            </mySearch>
          </div>
          <div id="treeFilter" v-show="queryWay === 2">
            <rgpa ref="rgpaRef" :studyCohort="studyCohort" @fullScreen="fullScreen"></rgpa>
          </div>
          <div v-show="isStartMove" :class="['mask', { isMoveMask: isMoveMask }]" @dragleave="handleDrop($event)" @dragenter="onMove($event)">
            <span>{{ moveText }}</span>
          </div>
        </div>
        <div class="tableContainer" v-show="isTreeFull || queryWay === 1">
          <div class="topOpr">
            <div class="title">查询结果</div>
            <div class="line" v-show="isShowData"></div>
            <div class="jump" v-show="isShowData">
              {{`患者人数：${listInfo.patientTotal||0}，占全部患者的${listInfo.patientPercent||0}%；就诊数：${listInfo.recordTotal||0}，占全部就诊的${listInfo.recordPercent||0}%。`}}
            </div>
            <div class="flex1"></div>
            <el-button @click="handleHisExport(true)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('病历导出')">
              <i class="iconfont icon-daochu1"></i>
              <span>导出记录</span>
            </el-button>
            <el-button @click="handleExport(true)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('病历导出')">
              <i class="iconfont icon-daochu1"></i>
              <span>导 出</span>
            </el-button>
          </div>
          <div class="updateContainer" v-if="!userStore.needCheckPermission || hadPermissionList.includes('指标提取任务管理')">
            <SvgIcon iconName="icon-renwujindu"></SvgIcon>
            <div class="progressText">任务进度：</div>
            <div class="status noTask" v-if="status===0">
              暂无任务
            </div>
            <div class="status underWay" v-if="status===1">
              进行中
            </div>
            <div class="status paused" v-if="status===2">
              已暂停
            </div>
            <div class="status errorStatus" v-if="status===3">
              异常终止
            </div>
            <div class="allProgress" v-if="status!=0">
              <div :class="{progressContainer:true,errorStatus:status===3}">
                <el-progress :show-text="false" :percentage="percentage" ></el-progress>
              </div>
              <div class="progressLine">
              </div>
              <div class="progressTitle progressIndex">
                <div class="pointer"></div>
                <div class="title">指标数</div>
                <div class="progressNum" >
                  {{`${processObj.completeNum||0}`}}
                  <span>{{ `/${processObj.sumNum||0}` }}</span>
                </div>
              </div>

              <div class="progressTitle progressPatient">
                <div class="pointer"></div>
                <div class="title">患者人数</div>
                <div class="progressNum" >
                  {{`${processObj.searchPatientNum||0}`}}
                  <span>{{ `/${processObj.totalPatientNum||0}` }}</span>
                </div>
              </div>

              <div class="progressTitle progressMedical">
                <div class="pointer"></div>
                <div class="title">就诊数</div>
                <div class="progressNum" >
                  {{`${processObj.searchMedicalRecordNum||0}`}}
                  <span>{{ `/${processObj.totalMedicalRecordNum||0}` }}</span>
                </div>
              </div>

            </div>
            <div class="allProgress" v-if="status==0"></div>

            <div class="oprBtn" v-if="status===1||status===3" @click="handleTask(3)">
              结束任务
            </div>
            <div class="oprBtn" v-if="status===1" @click="handleTask(2)">
              暂停任务
            </div>
            <div class="oprBtn" v-if="status===2" @click="handleTask(4)">
              开始任务
            </div>
            <div class="oprBtn" @click="handleTask(1)">
              更新任务
            </div>
          </div>
          <v-table
            v-if="isUseVirtual"
            :columns="common.column"
            :tableData="common.tableData"
          >
          </v-table>
          <myTable2
            v-if="!isUseVirtual"
            ref="myTableRef"
            class="myTable"
            :tableData="common.tableData"
            :column="common.column"
            handlerName="操作"
            :handlerWidth="172"
            :showToolTip="common.showToolTip"
            :pagination="true"
            :pageResult="pageResult"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
          >
            <template #option="scope">
              <div class="oprContainer">
                <div class="oprBtn" @click="handleHomePage(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('患者主页')">
                  患者主页
                </div>
                <div class="oprBtn" @click="handleCurrent(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('查看就诊详情')">
                  当前就诊
                </div>
              </div>
            </template>
          </myTable2>
        </div>
      </div>
    </div>
    <HistoryExportRecord
      v-if="ishistoryExportRecord"
      :type="2"
      :studyCohort="studyCohort"
      @closure="handleHisExport(false)"
      @echo="echo"
      :treeSource="treeSource"
      :isMedicalRecord="false"
    ></HistoryExportRecord>
    <ExportMedicalRecords
      v-if="isExportMedicalRecords"
      @closure="handleExport(false)"
      :isMedicalRecord="false"
      :mySearchRef="mySearchRefValue"
      :studyCohort="studyCohort"
      :search="searchValue"
      :queryDimension="queryDimension"
      :studyName="studyName"
      :rgpaRef="rgpaRef"
      :pageResult="pageResult"
      :queryWay="queryWay"
    ></ExportMedicalRecords>
    <AddConditions
      v-if="isAddConditions"
      @close="handelClose"
      @handelSure="handelSure"
      :checkedIds="checkedIds"
      :treeSource="treeSource"
    ></AddConditions>
    <CommonUse
      :filterNamePa="filterName"
      :queryWay="queryWay"
      :studyCohort="studyCohort"
      :treeSource="treeSource"
      v-if="isSelectCommonUse"
      @close="handelClose"
      @reset="handelReset"
      @handelSure="handelEchoSearch"
      @restorationTree="restorationTree"
    >
    </CommonUse>
  </div>
</template>

<script setup>
defineOptions({
  name: 'MedicalRecordIndex',
  inheritAttrs: false
})
import { reactive, ref, watch, computed, onMounted, nextTick, onUnmounted, onDeactivated, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
import HistoryExportRecord from '@/components/medicalRecord/components/historyExportRecord.vue'
import ExportMedicalRecords from '@/components/medicalRecord/components/exportMedicalRecords.vue'
import AddConditions from '@/components/medicalRecord/components/AddConditions.vue'
import CommonUse from '@/components/medicalRecord/components/commonUse.vue'
import hookImg from '@/assets/hook.png'
import rgpa from '@/components/medicalRecord/components/rgpa.vue'
import { getMedicalRecordIndexList, saveCommonUse, medicalRecordIndexConditionTreeQuery, getUpdateProcess, postUpdateIndex, saveFixedQueryCondition, getCommonUse, pauseUpdateIndex, startUpdateIndex, finishUpdateIndex } from '@/api/api_homePage.js'
const emits = defineEmits('transferSearchExport')
import { useMedicalStore } from '@/store/medicalStore'
import router from '@/router'
import { useUserStore } from '@/store/user'
import { echartsToPx } from '@/utils/utils'
const isUseVirtual = ref(false)
const userStore = useUserStore()
const leftSectionExpand = ref(true)
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  if (item.url === '/research/researchQueue') {
    hadPermissionList.value.push(item.name)
  }
  // 从病历库取患者主页权限
  if (item.url === '/medicalRecordLibrary' && item.name === '患者主页') {
    hadPermissionList.value.push(item.name)
  }
  // 从就诊详情取查看权限
  if (item.url === '/medicalRecord/medicalDetails' && item.name === '查看') {
    hadPermissionList.value.push('查看就诊详情')
  }
})

const medicalStore = useMedicalStore()
const props = defineProps({
  studyCohort: {
    type: String,
    default: ''
  },
  studyName: {
    type: String,
    default: '空'
  },
  initTreeData: {
    type: Array,
    default: () => {
      return []
    }
  },
  diseaseTypeIds: {
    type: Array,
    default: () => {
      return []
    }
  },
  agencyIdList: {
    type: Array,
    default: () => {
      return []
    }
  },
  agencyIds: {
    type: Array,
    default: () => {
      return []
    }
  },
  queryWayNum: {
    type: Number,
    default: 1
  }
})
const filterText = ref('')
const treeRef = ref()
const mySearchRef = ref(null)
const myTableRef = ref(null)
const checkedIds = ref([])
const ishistoryExportRecord = ref(false)
const isExportMedicalRecords = ref(false)
const queryDimension = ref(1)
const queryWay = ref(1)
const routineFilterName = ref('无')
const treeFilterName = ref('无')

const filterName = computed(() => {
  if (queryWay.value === 1) {
    return routineFilterName.value
  } else {
    return treeFilterName.value
  }
})

// 使用 Set 替代数组 includes，避免树节点中 O(n) 查找导致的性能问题
const checkedIdsSet = computed(() => new Set(checkedIds.value))

const agencyIdListArr = ref([])

const searchInit = ref([
  {
    id: '0-1',
    type: 'positiveInteger',
    label: '就诊ID',
    value: 'id',
    maxlength: 19,
    init: true
  },
  {
    id: '0-2',
    type: 'positiveInteger',
    label: '患者ID',
    value: 'patientId',
    init: true,
    maxlength: 19
  },
  {
    label: '就诊医院',
    id: '1-1',
    soleID: '1-1',
    type: 'mulSelect',
    value: 'agencyIdList',
    minWidth: 140,
    init: true,
    EnumValues: agencyIdListArr
  }
])

const search = ref([])
const echoValue = ref({})
const treeSource = ref([])
const isAddConditions = ref(false)
const isSelectCommonUse = ref(false)
const searchValue = ref([])
const mySearchRefValue = ref(null)
const options = ref({
  formProps: {
    'label-position': 'left',
    'label-width': '70px'
  }
})
// 是否展示收缩展开按钮
const showUnfoldBtn = ref(false)
// 是否展开
const unfold = ref(true)
const rgpaRef = ref(null) // rgpa组件
const listInfo = ref({})
const common = reactive({
  showToolTip: false,
  text: '',
  tableData: [],
  initColumn: [
    { label: '就诊ID', value: 'id', fixed: 'left', minWidth: 140 },
    {
      label: '患者ID',
      value: 'patientId',
      fixed: 'left',
      minWidth: 140
    },
    {
      label: '就诊医院',
      value: 'agencyId',
      fixed: 'left',
      minWidth: 140,
      formatter: (row) => {
        const arr = lodash.filter(props.agencyIdList, { id: row.agencyId })
        return arr.length ? arr[0].name : '-'
      }
    }
  ],
  column: [
    { label: '就诊ID', value: 'id', fixed: 'left', minWidth: 140 },
    { label: '患者ID', value: 'patientId', fixed: 'left', minWidth: 140 },
    {
      label: '就诊医院',
      value: 'agencyId',
      fixed: 'left',
      minWidth: 140,
      formatter: (row) => {
        const arr = lodash.filter(props.agencyIdList, { id: row.agencyId })
        return arr.length ? arr[0].name : '-'
      }
    }
  ]
})
const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
onMounted(() => {
  search.value = lodash.cloneDeep(searchInit.value)
  if (props.queryWayNum === 1) {
    getList()
  }
  createInterval()
  window.addEventListener('resize', resizeHeight)
})
onActivated(() => {
  window.addEventListener('resize', resizeHeight)
  createInterval()
})
onDeactivated(() => {
  window.removeEventListener('resize', resizeHeight)
  if (intervalObj.value) {
    clearInterval(intervalObj.value)
  }
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeHeight)
  if (intervalObj.value) {
    clearInterval(intervalObj.value)
  }
  changeCheckedDebounced.cancel()
})
watch(
  () => props.studyCohort,
  (val) => {
    // '研究id发生变化,需要去重置相关的值'
    checkedIds.value = []
    unfold.value = false
    showUnfoldBtn.value = false
    common.tableData = []
    common.column = lodash.cloneDeep(common.initColumn)

    echoValue.value = {}
    listInfo.value = {}
    search.value = search.value = lodash.cloneDeep(searchInit.value)
    // mySearchRef.value.handleReset()
    pageResult.value.pageNum = 1
    routineFilterName.value = '无'
    treeFilterName.value = '无'
    rgpaRef.value.resetData()

    nextTick(() => {
      if (queryWay.value === 1) {
        getList()
      } else {
        getTreeList()
      }
    })
  }
)
watch(filterText, (val) => {
  treeRef.value.filter(val)
})
watch(queryWay, (val) => {
  // filterName.value = '无'
  if (val === 2) {
    nextTick(() => {
      rgpaRef.value.layout()
    })
  }
})
watch(() => props.agencyIdList, () => {
  agencyIdListArr.value = lodash.cloneDeep(props.agencyIdList)
  search.value = lodash.cloneDeep(searchInit.value)
}, {
  deep: true,
  immediate: true
})
const deepTreeData = (arr) => {
  const loop = (data, level) => {
    data.forEach(item => {
      const child = item.children
      if (child) {
        item.levelClass = item.level
        loop(child, item.level)
      } else {
        item.levelClass = level + 1
      }
    })
  }
  loop(arr, 0)
}
watch(
  () => props.initTreeData,
  (val) => {
    const arr = lodash.cloneDeep(props.initTreeData)
    deepTreeData(arr)
    treeSource.value = arr
    getCommonUse({ type: 5, queueId: props.studyCohort }).then(res => {
      if (res.data?.length && res.data[0].filterItemContent) {
        let arr = []
        try {
          arr = JSON.parse(res.data[0].filterItemContent)
        } catch (error) {
        }
        treeRef.value.setCheckedKeys(arr, false)
        const checkedNodes = treeRef.value.getCheckedNodes(false, false)
        lodash.remove(checkedNodes, (n) => {
          n.minWidth = 100
          return n.children
        })
        currentCheckedIdsArr.value = lodash.map(checkedNodes, 'id')
        handleTableHeader()
        // common.column = lodash.cloneDeep(common.initColumn).concat(checkedNodes)
        // console.log('这是啥', common.column)
        // common.column = [
        //   {
        //     label: '入院日期',
        //     value: 'customIndex-1015867090017587200'
        //   },
        //   {
        //     label: '分类1',
        //     children: [
        //       {
        //         label: '出生地',
        //         name: '出生地',
        //         value: 'customIndex-1074572319822843904'
        //       },
        //       {
        //         label: '婚姻',
        //         name: '婚姻',
        //         value: 'customIndex-1015867851438952448'
        //       },
        //       {
        //         label: '国籍（籍贯）',
        //         value: 'customIndex-1016872694454554624'
        //       },
        //       {
        //         label: '民族',
        //         value: 'customIndex-1016874226008854528'
        //       }
        //     ]
        //   }
        // ]
      }
    })
  },
  {
    deep: true,
    immediate: true
  }
)
watch(() => search.value,
  async (newval) => {
    await nextTick()
    const dom = document.getElementById('mySearchRef')
    if (dom.offsetHeight > 50) {
      showUnfoldBtn.value = true
    } else {
      showUnfoldBtn.value = false
    }
  },
  {
    deep: true
  })

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}
const currentCheckedIdsArr = ref([])
// 防抖处理，避免勾选全选时多次触发导致卡顿
const changeCheckedDebounced = lodash.debounce(() => {
  if (!treeRef.value) return
  const checkedNodes = treeRef.value.getCheckedNodes(false, false)
  lodash.remove(checkedNodes, (n) => {
    n.minWidth = 100
    return n.children
  })
  currentCheckedIdsArr.value = lodash.map(checkedNodes, 'id') || []
  handleTableHeader()
  const params = {
    filterItemContent: JSON.stringify(lodash.map(checkedNodes, 'soleID') || []),
    type: 5,
    queueId: props.studyCohort
  }
  saveFixedQueryCondition(params).then(() => {})
}, 150)

const changeChecked = () => {
  changeCheckedDebounced()
}
const isShowData = ref(false)
const handleSub = () => {
  pageResult.value.pageNum = 1
  if (queryWay.value === 1) {
    getList()
    mySearchRefValue.value = mySearchRef.value.formSearch
    searchValue.value = search.value
  } else {
    getTreeList()
  }
}
const isAllEmptyOrNull = (obj) => {
  return lodash.every(lodash.values(obj), value => {
    return lodash.isEmpty(value) || value === null || value === undefined || ['gt', 'ge', 'eq', 'lt', 'le', 'ne'].includes(value)
  })
}
const currentHeaderList = ref([])
// 使用_.reduce和_.filter来构建新树，ids 用 Set 实现 O(1) 查找
const filterTreeByIDs = (nodes, ids) => {
  const idSet = ids instanceof Set ? ids : new Set(ids)
  return lodash.reduce(nodes, (acc, node) => {
    // 先递归处理子节点
    let filteredChildren = []
    if (node.children && node.children.length > 0) {
      filteredChildren = filterTreeByIDs(node.children, idSet)
    }
    // 判断是否应该保留当前节点
    let shouldKeepNode = false
    // 如果当前节点的value在ids中，保留该节点
    if (idSet.has(node.value)) {
      shouldKeepNode = true
    } else if (filteredChildren.length > 0) {
      // 如果子节点中有任何一个被保留，则父节点也应该被保留
      shouldKeepNode = true
    }
    // 如果需要保留节点，则添加到结果中
    if (shouldKeepNode) {
      acc.push({
        ...node,
        width: isUseVirtual.value ? echartsToPx(node.width) : node.width,
        minWidth: isUseVirtual.value ? echartsToPx(node.minWidth) : node.minWidth,
        formatter: (row) => {
          if (isUseVirtual.value) {
            return lodash.isEmpty(row.row['customIndex-' + node.fullValue]) ? '-' : row.row['customIndex-' + node.fullValue]
          } else {
            return lodash.isEmpty(row['customIndex-' + node.fullValue]) ? '-' : row['customIndex-' + node.fullValue]
          }
        },
        children: filteredChildren.length ? filteredChildren : ''
      })
    }
    return acc
  }, [])
}

// 使用函数筛选树结构
const handleTableHeader = () => {
  const currentColumn = filterTreeByIDs(currentHeaderList.value, currentCheckedIdsArr.value)
  common.column = lodash.cloneDeep(common.initColumn).concat(currentColumn)
}

const getList = () => {
  if (queryWay.value === 1) {
    isShowData.value = !isAllEmptyOrNull(mySearchRef.value.formSearch)
    const params = {
      ...mySearchRef.value.formSearch,
      pageNum: pageResult.value.pageNum,
      pageSize: pageResult.value.pageSize,
      searchDimension: queryDimension.value,
      queueId: props.studyCohort,
      searchType: queryWay.value
    }
    switch (params.relationValue) {
      case 'gt':
      // 大于
        params.startAge = params.age
        break
      case 'eq':
      // 等于
        params.equalAge = params.age
        break
      case 'lt':
      // 小于
        params.endAge = params.age
        break
      case 'between':
      // 介于
        if (params.ageRange?.length) {
          params.startAge = params.ageRange[0]
          params.endAge = params.ageRange[1]
        }
        break
    }
    if (params.relationValue === 'between' && params.startAge > params.endAge) {
      ElMessage.warning('请填写完整年龄段')
      return
    }
    delete params.age
    delete params.ageRange
    delete params.relationValue
    const customConditionMap = []
    Object.keys(params).forEach(item => {
      if (item.includes('customIndex-')) {
        const obj = {}
        obj.indexId = item.split('-')[1]
        if (Array.isArray(params[item])) {
          obj.valueList = params[item]
        } else {
          obj.valueList = params[item] ? [params[item]] : []
        }
        if (!lodash.isEmpty(params['relationValue-' + obj.indexId])) {
          obj.searchSymbol = params['relationValue-' + obj.indexId]
          if (Array.isArray(params[obj.indexId])) {
            obj.valueList = params[obj.indexId]
          } else {
            obj.valueList = params[obj.indexId] ? [params[obj.indexId]] : []
          }
        }
        customConditionMap.push(obj)
        delete params[item]
        delete params['relationValue-' + obj.indexId]
        delete params[obj.indexId]
      }
    })
    params.searchConditionList = customConditionMap
    getMedicalRecordIndexList(params).then((res) => {
      if (res.code === 10000) {
        currentHeaderList.value = lodash.get(res.data, 'indexHeaderList', [])
        handleTableHeader()
        common.tableData = res.data.items || []
        common.tableData.forEach(item => {
          const customIndexList = lodash.get(item, 'indexValueList') || []
          customIndexList.forEach(v => {
            item['customIndex-' + v.fullIndexName] = v.indexValue
          })
        })
        pageResult.value.total = res.data.total
        const patientPercent = (res.data.searchPatientNum / res.data.totalPatientNum)
        const recordPercent = (res.data.searchMedicalRecordNum / res.data.totalMedicalRecordNum)
        listInfo.value = {
          patientPercent: patientPercent ? (patientPercent * 100).toFixed(2) : 0,
          patientTotal: res.data.searchPatientNum || 0,
          recordPercent: recordPercent ? (recordPercent * 100).toFixed(2) : 0,
          recordTotal: res.data.searchMedicalRecordNum || 0
        }
      }
    })
  } else {
    getTreeList()
  }
}

const getTreeList = () => {
  const whetherTheConditionsAreMet = rgpaRef.value.whetherTheConditionsAreMet('条件树未满足查询条件，请检查后再提交')
  if (!whetherTheConditionsAreMet) {
    return
  }

  const condition = rgpaRef.value.obtainFlattenedData()
  if (condition.length > 1) {
    isShowData.value = true
  } else {
    if (condition[0].condition) {
      isShowData.value = true
    } else {
      isShowData.value = false
    }
  }
  const params = {
    ...pageResult.value,
    searchDimension: Number(queryDimension.value),
    searchConditionTree: rgpaRef.value.getData(),
    queueId: props.studyCohort,
    searchType: 2
  }
  medicalRecordIndexConditionTreeQuery(params).then(res => {
    if (res.code === 10000) {
      currentHeaderList.value = lodash.get(res.data, 'indexHeaderList', [])
      handleTableHeader()
      common.tableData = res.data.items || []
      common.tableData.forEach(item => {
        const customIndexList = lodash.get(item, 'indexValueList') || []
        customIndexList.forEach(v => {
          item['customIndex-' + v.fullIndexName] = v.indexValue
        })
      })
      pageResult.value.total = res.data.total
      const patientPercent = (res.data.searchPatientNum / res.data.totalPatientNum)
      const recordPercent = (res.data.searchMedicalRecordNum / res.data.totalMedicalRecordNum)
      listInfo.value = {
        patientPercent: patientPercent ? (patientPercent * 100).toFixed(2) : 0,
        patientTotal: res.data.searchPatientNum || 0,
        recordPercent: recordPercent ? (recordPercent * 100).toFixed(2) : 0,
        recordTotal: res.data.searchMedicalRecordNum || 0
      }
    }
  })
}

const handleSizeChange = (val) => {
  getList()
}
const handleCurrentChange = (val) => {
  getList()
}
const intervalObj = ref('')
const processObj = ref({})
const percentage = ref(0)
const status = ref(0) // 0无任务  1进行中 2暂停 3异常
const createInterval = () => {
  getUpdateProcess({ id: props.studyCohort }).then(res => {
    processObj.value = res.data || {}
    status.value = processObj.value.taskFlag || 0
    if (processObj.value.taskFlag) {
      if (processObj.value.sumNum) {
        percentage.value = ((processObj.value.completeNum / processObj.value.sumNum) * 100).toFixed(0) - 0
      } else {
        percentage.value = 0
      }
      // intervalObj.value = setInterval(() => {
      //   getUpdateProcess({ id: props.studyCohort }).then(v => {
      //     const oldCompleteNum = processObj.value.completeNum
      //     processObj.value = v.data || {}
      //     status.value = processObj.value.taskFlag || 0
      //     if (!processObj.value.taskFlag) {
      //       clearInterval(intervalObj.value)
      //       percentage.value = 0
      //       handleSub()
      //     } else {
      //       if (processObj.value.sumNum) {
      //         percentage.value = ((processObj.value.completeNum / processObj.value.sumNum) * 100).toFixed(0) - 0
      //       } else {
      //         percentage.value = 0
      //       }
      //     }
      //     // 让列表更新
      //     if (v.data.completeNum > oldCompleteNum) {
      //       handleSub()
      //     }
      //   })
      // }, 5000)
    } else {
      if (intervalObj.value) {
        clearInterval(intervalObj.value)
      }
    }
  })
}
const handleTask = (type) => {
  switch (type) {
    case 1:
      // 更新任务
      ElMessageBox.confirm(`是否对本队列全部指标重新提取？历史指标结果将被覆盖`, '指标提取更新任务', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        postUpdateIndex({ id: props.studyCohort }).then(res => {
          if (res.code === 10000) {
            ElMessage.success('操作成功')
            handleSub()
            if (intervalObj.value) {
              clearInterval(intervalObj.value)
            }
            createInterval()
          }
        })
      })
      break
    case 2:
      // 暂停任务
      ElMessageBox.confirm(`是否对本队列全部指标暂停提取？历史指标结果保留`, '指标提取暂停任务', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        pauseUpdateIndex({ id: props.studyCohort }).then(res => {
          if (res.code === 10000) {
            status.value = 2
            ElMessage.success('操作成功')
          }
        })
      })
      break
    case 3:
      // 结束任务
      ElMessageBox.confirm(`是否对本队列全部指标结束提取？历史指标结果保留`, '指标提取结束任务', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        type: 'warning'
      }).then(() => {
        finishUpdateIndex({ id: props.studyCohort }).then(res => {
          if (res.code === 10000) {
            if (intervalObj.value) {
              clearInterval(intervalObj.value)
            }
            processObj.value = {}
            status.value = 0
            percentage.value = 0
            ElMessage.success('操作成功')
          }
        })
      })
      break
    case 4:
      // 开始任务
      startUpdateIndex({ id: props.studyCohort }).then(res => {
        if (res.code === 10000) {
          status.value = 1
          ElMessage.success('操作成功')
        }
      })
      break
  }
}

const handleHisExport = (type) => {
  ishistoryExportRecord.value = type
}
const handleExport = (type) => {
  isExportMedicalRecords.value = type
}

const dargValue = ref(null) // 拖拽数据
const isStartMove = ref(false) // 是否开始拖拽
const isMoveMask = ref(false) // 是否移动到mask上
const moveText = computed(() => {
  // 拖拽提示文字
  return isMoveMask.value ? '+松开鼠标左键即可添加' : '+拖入此区域添加筛选项'
})

// 拖拽开始的事件
const onStart = (node, event) => {
  console.log(node, event)
  dargValue.value = node.data
  isStartMove.value = true
}

// 拖拽中的事件
const onMove = lodash.throttle((event) => {
  event.preventDefault()
  const { target } = event
  if (target?.className === 'mask') {
    isMoveMask.value = true
  }
}, 300)

// 拖拽结束的事件
const onEnd = (before, after, inner, event) => {
  event.preventDefault()
  const container = document.querySelector('.mask')
  const { left, top, bottom, right } = container.getBoundingClientRect()
  const { clientX, clientY } = event
  if (
    clientX >= left &&
    clientX <= right &&
    clientY >= top &&
    clientY <= bottom &&
    dargValue.value
  ) {
    const obj = dargValue.value
    if (checkedIds.value.length < 20) {
      if (!checkedIdsSet.value.has(obj.soleID)) {
        checkedIds.value.push(obj.soleID)
        search.value.push(obj)
      } else {
        ElMessage.warning('该搜索项已存在!')
      }
    } else {
      ElMessage.warning('超过允许搜索项个数上限20个!')
    }
  }
  isStartMove.value = false
  isMoveMask.value = false
  dargValue.value = null
}

// 拖拽离开的事件
const handleDrop = () => {
  isMoveMask.value = false
}

// 拖拽是否允许
const allowDrag = (e) => {
  const { data } = e
  // 常规查询下才允许拖拽 && 并且是子级节点
  return queryWay.value === 1 && !(data?.children || false)
}
const indent = ref(echartsToPx(20))
// 点击展开 收缩按钮
const resizeHeight = () => {
  indent.value = echartsToPx(20)
  minHeight.value = Math.floor(echartsToPx(52))
}
const minHeight = ref(Math.floor(echartsToPx(52)))
const handelClickUnfoldBtn = () => {
  const dom = document.getElementById('mySearchRef')
  // el-form-item
  const domHeight = dom.offsetHeight
  if (domHeight > minHeight.value) {
    unfold.value = false
    dom.setAttribute('style', `height: ${minHeight.value}px;overflow: hidden`)
  } else {
    unfold.value = true
    dom.setAttribute('style', 'height: auto')
  }
}

// 点击添加条件搜索
const handelAddConditions = () => {
  isAddConditions.value = true
}
const handelClose = () => {
  isAddConditions.value = false
  isSelectCommonUse.value = false
}
const handelSure = async (obj) => {
  checkedIds.value = obj.ids
  search.value = search.value = lodash.cloneDeep(searchInit.value).concat(obj.nodes)
  isAddConditions.value = false
}
const handleHomePage = (row) => {
  row.key = props.studyName + row.patientId
  row.routerName = router.currentRoute.value.name
  medicalStore.handlerRouterKeepLiveList(router.currentRoute.value.name, 'del')
  medicalStore.setCurPatientDetail({
    ...row,
    studyCohort: props.studyCohort,
    studyName: props.studyName
  })
  if (medicalStore.curPatientDetailList.length !== 10 || medicalStore.curPatientDetailList.findIndex(item => item.key === row.key) !== -1) {
    router.push({ name: 'patientHomePage' })
  } else {
    ElMessage.error('患者主页已超过10条记录，请先清理历史记录后再查看')
  }
}
const handleCurrent = async (row) => {
  row.key = props.studyName + row.id
  row.routerName = router.currentRoute.value.name
  medicalStore.handlerRouterKeepLiveList(router.currentRoute.value.name, 'del')
  medicalStore.setmedicalList({ ...row, type: 0, studyCohort: props.studyCohort, studyName: props.studyName })
  if (medicalStore.medicalList.length !== 10 || medicalStore.medicalList.findIndex(item => item.key === row.key) !== -1) {
    router.push({ name: 'medicalDetails' })
  } else {
    ElMessage.error('当前就诊详情已超过10条记录，请先清理历史记录后再查看')
  }
}

const handelDel = (item, index) => {
  search.value.splice(index, 1)
  checkedIds.value.splice(checkedIds.value.indexOf(item.soleID), 1)
}
const handleSelctCommonUse = () => {
  isSelectCommonUse.value = true
}
const handelReset = () => {
  isSelectCommonUse.value = false
  pageResult.value.pageNum = 1
  if (queryWay.value === 2) {
    rgpaRef.value.resetData()
    getTreeList()
    treeFilterName.value = '无'
  } else {
    routineFilterName.value = '无'
    mySearchRef.value.handleReset()
    getList()
    mySearchRefValue.value = mySearchRef.value.formSearch
  }
}
const handelSaveCommonUse = () => {
  ElMessageBox.prompt('查询项名称：', '保存为常用查询项', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    inputPattern: /^.{1,20}$/,
    inputErrorMessage: '请填写正确的名称,最长20个字符',
    customClass: 'saveCommonUseDialog',
    beforeClose: (type, obj, done) => {
      if (type === 'cancel') {
        done()
      } else {
        const params = {
          type: queryWay.value,
          filterName: obj.inputValue,
          queueId: props.studyCohort
        }
        if (queryWay.value === 2) {
          params.filterItemContent = JSON.stringify(rgpaRef.value.getData())
        } else {
          params.filterItemContent = JSON.stringify({
            search: search.value,
            value: mySearchRef.value.formSearch
          })
        }
        saveCommonUse(params).then((res) => {
          console.log('保存结果', res)
          if (res.code === 10000) {
            ElMessage.success('已保存')
            done()
          }
        })
      }
    }
  })
}
const handelEchoSearch = (obj, isSearch) => {
  queryWay.value = 1
  if (obj.init) {
    search.value = lodash.cloneDeep(searchInit.value)
    echoValue.value = {}
    routineFilterName.value = '无'
    checkedIds.value = []
  } else {
    search.value = obj.searchItems
    echoValue.value = obj.values
    isSelectCommonUse.value = false
    routineFilterName.value = obj.filterName
    obj.searchItems?.forEach(item => {
      checkedIds.value.push(item.soleID)
    })
  }
  if (isSearch) {
    nextTick(() => {
      handleSub()
    })
  }
  handelClose()
}

const restorationTree = (data, name = '无') => {
  treeFilterName.value = name
  rgpaRef.value.reduction(data)
  isSelectCommonUse.value = false
}

const echo = (data) => {
  emits('transferSearchExport', data)
  handleHisExport(false)
}
const handelTreeSearch = (obj) => {
  queryWay.value = 2
  nextTick(() => {
    rgpaRef.value.reduction(obj)
  })
}

const isTreeFull = ref(true)

const fullScreen = (type) => {
  isTreeFull.value = type
  nextTick(() => {
    rgpaRef.value.layout()
  })
}

defineExpose({ handelEchoSearch, handelTreeSearch })
</script>
<style lang="scss" scoped>
.medicalRecordIndex {
  overflow: hidden;
  box-sizing: border-box;
  // display: flex;
  // flex-direction: column;
  height: 100%;
  padding: 16px;
}

.main {
  display: flex;
  // height: calc(100% - 47px - 14px);
  height: 100%;

  // flex: 1;
  .treeContainer {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;
    // flex-basis: 258px;
    min-width: 258px;
    height: 100%;
    margin-right: 16px;
    // padding-top: 10px;
    border-radius: 8px;
    background: var(--theme-card);
    &.hideLeftSection {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-basis: 48px;
      box-sizing: border-box;
      min-width: 0;
      padding: 12px 8px;
      .iconDiv {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;

        &:hover {
          background-color: var(--theme-primary-soft);
          i {
            color: var(--theme-primary);
          }
        }
        i {
          font-size: 26px;
          color: var(--theme-text-2);
        }
      }
      .hintDiv {
        width: 14px;
        margin-top: 8px;
      }
      &:hover {
        cursor: pointer;
        color: var(--theme-primary);
        i {
          color: var(--theme-primary);
        }
      }
    }
    .header {
      padding: 0 16px;
      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        div:nth-child(1) {
          margin-left: 6px;
        }
        div:nth-child(2) {
          position: relative;
          right: -4px;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          i {
            font-size: 26px;
            color: var(--theme-text-2);
          }
          &:hover {
            background-color: var(--theme-primary-soft);
            i {
              color: var(--theme-primary);
            }
          }
        }
      }
    }
    .leftTree {
      overflow: hidden;
      flex: 1;
      padding-bottom: 14px;
      .treeRef {
        display: inline-block;
        width: auto;
        min-width: 100%;
      }
    }
    :deep(.el-scrollbar) {
      padding: 0 10px;
    }

    .title {
      height: 55px;
      line-height: 55px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
    }

    .search {
      height: 28px;
      margin-bottom: 10px;
    }

    :deep(.el-tree-node__expand-icon.expanded) {
      position: absolute;
      right: 0;
      transform: rotate(90deg);
    }
    :deep(.el-tree-node__expand-icon) {
      position: absolute;
      right: 0;
      // transform: rotate(180deg);
    }

    :deep(.el-checkbox__input.is-checked .el-checkbox__inner,),
    :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
      border-color: var(--theme-primary) !important;
      background-color: var(--theme-primary) !important;
    }
    :deep(.el-tree-node__content) {
      margin-top: 8px;
      .el-checkbox {
        margin-left: 14px !important;
      }
    }
    :deep(.el-tree-node__content),
    .customTreeNode {
      display: flex;
      align-items: center;
      height: 36px;
      user-select: none;
      .hookImg {
        // margin-left: 10px;
        position: absolute;
        right: 6px;
        width: 10px;
        height: auto;
      }
    }
    .customTreeNode {
      padding-right: 24px;
    }

    .treeLabel {
      overflow: hidden; /* 隐藏溢出内容 */
      line-height: 44px;
      text-overflow: ellipsis; /* 当文本溢出时显示省略号 */
      font-weight: 400;
      font-size: 14px;
      white-space: nowrap;
      &.level1 {
        max-width: 280px;
      }
      &.level2 {
        max-width: 260px;
      }
      &.level3 {
        max-width: 240px;
      }
      &.level4 {
        max-width: 220px;
      }
      &.level5 {
        max-width: 200px;
      }
      &.level6 {
        max-width: 180px;
      }
      &.level7 {
        max-width: 160px;
      }
      &.level8 {
        max-width: 140px;
      }
      &.level9 {
        max-width: 120px;
      }
      &.level10 {
        max-width: 100px;
      }
      &.level11 {
        max-width: 80px;
      }
    }
  }

  .tableAndSearch {
    // display: flex;
    // overflow: hidden;
    // flex-direction: column;
    // width: calc(100% - 258px - 15px);
    // height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    width: 0;
    height: 100%;
    .searchContainer {
      position: relative;
      padding: 24px;
      padding-bottom: 2px;
      border-radius: 8px;
      background: var(--theme-card);

      &.treeFull {
        display: flex;
        flex-direction: column;
        flex: 1;
        #treeFilter {
          flex: 1;
        }
      }
      .searchTitle {
        @include childrenBetween;
      }

      .dimensionality {
        display: flex;
        align-items: center;
        margin-bottom: 20px;

        .queryDimension {
          margin-right: 45px;
        }
        .queryWay,
        .queryDimension {
          :deep(.el-radio-button) {
            background: var(--theme-card);
            font-size: 14px;
            color: var(--theme-text-2);
            &.is-active {
              .el-radio-button__inner {
                background: var(--theme-card);
                font-weight: 400;
                color: var(--theme-primary);
              }
            }
            .el-radio-button__inner {
              height: 32px;
              font-weight: 400;
              font-size: 14px;
              color: var(--theme-text-2);
            }
          }
        }
        .label {
          line-height: 20px;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }
        :deep(.el-radio-button) {
          width: 88px;
        }
        :deep(.el-radio-button__inner) {
          width: 88px;
          color: var(--theme-text-2);
        }
        :deep(.el-radio-button.is-active .el-radio-button__inner) {
          width: 100%;
          background-color: transparent;
          color: var(--theme-primary);
        }
      }

      .topOpr {
        display: flex;
        align-items: center;
        padding-bottom: 24px;

        .inCommonUse {
          display: flex;
          align-items: center;
          margin-right: 16px;
          padding-right: 16px;
          border-right: 1px solid #cbcfdc;
          cursor: pointer;
          line-height: 14px;
          font-size: 14px;
          color: var(--el-color-primary);

          .label {
            margin-left: 2px;
          }
        }

        .saveCommonUse {
          margin-right: 16px;
        }

        .addConditions,
        .saveCommonUse {
          cursor: pointer;
          line-height: 14px;
          font-size: 14px;
          color: var(--el-color-primary);

          span {
            margin-left: 6px;
          }
        }

        .addSearchBtn {
          @include childrenCenter;
        }

        .line {
          width: 0;
          height: 24px;
          margin-left: 14px;
          margin-right: 26px;
          border-right: 1px solid #cbcfdc;
          opacity: 1;
        }

        .resetConditions {
          width: 120px;
          height: 28px;
          margin-right: 14px;
          border: 1px solid #d9d9d9;
          border-radius: 14px 14px 14px 14px;
          cursor: pointer;
          line-height: 28px;
          text-align: center;
          font-size: 12px;
          color: #646464;
        }

        .submit {
          width: 120px;
          height: 28px;
          border-radius: 14px 14px 14px 14px;
          background: var(--theme-primary);
          cursor: pointer;
          line-height: 28px;
          text-align: center;
          font-weight: 500;
          font-size: 12px;
          color: #fff;
        }
      }

      .mask {
        display: flex;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border: 1px dashed var(--el-color-primary);
        border-radius: 16px 16px 16px 16px;
        background-color: rgba(70, 126, 255, 0.1);
        opacity: 1;
        color: white;
        backdrop-filter: blur(5px);
        span {
          pointer-events: none;
          font-weight: 400;
          font-size: 14px;
          color: var(--el-color-primary);
        }

        .ghost {
          display: none !important;
          cursor: pointer;
        }
      }

      .isMoveMask {
        border: 1px solid var(--el-color-primary);
        background-color: rgba(70, 126, 255, 0.2);
      }

      #treeFilter {
        height: 144px;
        padding-bottom: 16px;
      }
    }

    .tableContainer {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      margin-top: 16px;
      // padding: 0 24px;
      border-radius: 8px;
      background: var(--theme-card);
      .topOpr {
        display: flex;
        align-items: center;
        height: 69px;
        padding: 0 24px;
        .title {
          margin-right: 16px;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }

        .line {
          width: 0;
          height: 24px;
          border-right: 1px solid #cbcfdc;
          opacity: 1;
        }

        .jump {
          margin-left: 14px;
          cursor: pointer;
          line-height: 14px;
          line-height: 20px;
          font-size: 16px;
          color: #646464;
        }

        .flex1 {
          flex: 1;
        }
        .updateProgress {
          margin-right: 12px;
          line-height: 19px;
          font-weight: 400;
          font-size: 16px;
          color: var(--theme-primary);
        }

        .el-button {
          i {
            margin-right: 10px;
            font-size: 12px;
          }
        }
        .el-button {
          i {
            margin-right: 10px;
            font-size: 12px;
          }
        }
      }

      .myTable {
        overflow: hidden;
        flex: 1;
        padding-left: 24px;
        padding-right: 24px;
      }

      .oprContainer {
        display: flex;
        align-items: center;

        .oprBtn {
          margin-right: 14px;
          cursor: pointer;
          line-height: 14px;
          font-size: 14px;
          color: var(--el-color-primary);
        }
      }
    }
    .updateContainer {
      display: flex;
      align-items: center;
      height: 66px;
      padding: 0 24px;
      border-top: 1px solid #e8e8e8;
      .status {
        display: flex;
        align-items: center;
        height: 25px;
        margin-right: 16px;
        padding: 0 7px;
        border-radius: 2px;
        // font-weight: 600;
        font-size: 16px;
        &.noTask {
          color: var(--theme-text-2);
        }
        &.underWay {
          color: #2c67ff;
        }
        &.paused,
        &.errorStatus {
          color: #ff4e4e;
        }
      }
      .allProgress {
        display: flex;
        align-items: center;
        flex: 1;
      }
      :deep(.svg-icon) {
        font-size: 16px;
      }
      .progressText {
        margin-left: 8px;
        font-weight: 600;
        font-size: 16px;
        color: var(--theme-text);
      }
      .progressTitle {
        display: flex;
        align-items: center;
        &.progressIndex {
          .pointer {
            background: #2c67ff;
          }
          .progressNum {
            border: 1px solid #2c67ff;
            color: #2c67ff;
          }
        }
        &.progressPatient {
          .pointer {
            background: #06b5d1;
          }
          .progressNum {
            border: 1px solid #06b5d1;
            background: var(--theme-primary-soft);
            color: #06b5d1;
          }
        }
        &.progressMedical {
          .pointer {
            background: #ffa100;
          }
          .progressNum {
            border: 1px solid #ffa100;
            background: var(--theme-fill);
            color: #ffa100;
          }
        }
        .progressNum {
          display: flex;
          align-items: center;
          width: auto;
          height: 25px;
          margin-left: 10px;
          padding: 0 10px;
          border: 1px solid #2c67ff;
          border-radius: 4px 4px 4px 4px;
          background: #eaf2ff;
          font-size: 14px;
          color: #2c67ff;
          span {
            color: var(--theme-text);
          }
        }
        .pointer {
          width: 5px;
          height: 5px;
          margin-left: 18px;
          margin-right: 9px;
          border-radius: 50%;
        }
        .title {
          font-weight: 400;
          font-size: 16px;
          color: var(--theme-text-2);
        }
      }
      .progressLine {
        width: 0;
        height: 22px;
        border-right: 1px solid #d8d8d8;
      }
      .progressContainer {
        width: 56px;
        margin-left: 12px;
        margin-right: 16px;
        &.errorStatus {
          :deep(.el-progress-bar__inner) {
            background-color: #ff4e4e;
          }
        }
      }
      .oprBtn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 96px;
        height: 32px;
        margin-right: 14px;
        border: 1px solid rgba(44, 103, 255, 0.2);
        border-radius: 2px;
        background: var(--theme-primary-soft);
        cursor: pointer;
        font-weight: 400;
        font-size: 14px;
        color: #2c67ff;
        &:nth-last-of-type(1) {
          margin-right: 0;
        }
      }
    }
  }

  :deep(.search .el-input__wrapper) {
    box-sizing: border-box;
  }
}
:deep(.whether) {
  display: flex;
  align-items: center;
  width: 46px;
  height: 32px;
  margin-right: 16px;
  cursor: pointer;
  span {
    color: var(--theme-primary);
    word-wrap: keep-all;
  }
  i {
    margin-left: 5px;
    font-size: 7px;
    color: var(--theme-primary);
  }
  .rotate {
    transform: rotate(180deg);
    transition: transform 0.3s;
  }
}
.beHospitalized,
.outpatientService {
  margin-right: 8px;
  font-size: 14px;
  color: var(--theme-primary);
}
</style>
<style lang="scss">
.saveCommonUseDialog {
  .el-message-box__content {
    display: flex;
    align-items: baseline;
    .el-message-box__input {
      flex: 1;
    }
    .el-message-box__message {
      padding-top: 12px;
      label {
        height: 32px;
        margin-right: 10px;
        font-size: 14px;
        color: var(--theme-text);
      }
    }
  }
}
</style>
