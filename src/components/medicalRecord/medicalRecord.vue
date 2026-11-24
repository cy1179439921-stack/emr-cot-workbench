<template>
  <div class="medicalRecord">
    <div class="main">
      <div class="treeContainer" v-show="leftSectionExpand">
        <div class="header">
          <div class="title">
            <div>显示指标</div>
            <div class="flexCenter" @click="leftSectionExpand = false">
              <el-tooltip
                class="box-item"
                effect="dark"
                content="收起指标栏"
                placement="bottom"
              >
                <i class="iconfont icon-shouqiliebiao"></i>
              </el-tooltip>
            </div>
          </div>
          <CommonInput
            v-model="filterText"
            placeholder="搜索名称"
            class="search"
            clearable
          />
        </div>

        <div class="leftTree treeClearFocuStyle">
          <el-scrollbar style="height: 100%;">
            <el-tree
              ref="treeRef"
              :indent="indent"
              :data="treeSource"
              show-checkbox
              node-key="id"
              :draggable="true"
              default-expand-all
              :default-checked-keys="['1-1', '1-2', '1-3', '1-4','1-6']"
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
                <div class="customTreeNode">
                  <span class="treeLabel">{{ node.label }}</span>
                  <img
                    v-if="!data.children && checkedIds.includes(data.id)"
                    :src="hookImg"
                    class="hookImg"
                    alt=""
                  />
                </div>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
      </div>
      <div class="treeContainer hideLeftSection" v-show="!leftSectionExpand">
        <div class="iconDiv" @click="leftSectionExpand = true">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="展开指标栏"
            placement="bottom"
          >
            <i class="iconfont icon-zhankailiebiao"></i>
          </el-tooltip>
        </div>
        <div class="hintDiv"></div>
      </div>
      <div class="tableAndSearch">
        <div class="searchContainer">
          <div class="topOpr">
            <div class="title">查询条件</div>
            <div class="addConditions" @click="handelAddConditions">
              <i class="iconfont icon-tianjiaxuanzexiang1"></i>
              <span>添加查询条件</span>
            </div>
            <!-- <div class="line"></div> -->
          </div>
          <div id="mySearchRef">
            <mySearch
              ref="mySearchRef"
              :search="search"
              :options="options"
              :needDel="true"
              @handleSearch="handleSub"
              @handelDel="handelDel"
              :value="echoValue"
            >
              <div class="whether no-select" v-if="showUnfoldBtn" @click="handelClickUnfoldBtn">
                <span>{{ unfold ? '收起' : '展开' }}</span>
                <i class="iconfont icon-xuanzekuang-xiala" :class="{rotate:unfold}"></i>
              </div>
              <el-button @click="handelReset">重置条件</el-button>
              <el-button type="primary" @click="handleSub">查&nbsp;询</el-button>
            </mySearch>
          </div>

          <div
            v-show="isStartMove"
            :class="['mask', { isMoveMask: isMoveMask }]"
            @dragleave="handleDrop($event)"
            @dragenter="onMove($event)"
          >
            <span>{{ moveText }}</span>
          </div>
        </div>
        <div class="blank"></div>
        <div class="tableContainer">
          <div class="topOpr">
            <div class="title">查询结果</div>
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
          <myTable
            ref="myTableRef"
            :border="true"
            class="myTable"
            :showToolTip="common.showToolTip"
            :tableData="common.tableData"
            :column="common.column"
            :pagination="true"
            handlerName="查看"
            :handlerWidth="160"
            :pageResult="pageResult"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
          >
            <template #status="scope">
              <span>{{ scope.row }}</span>
            </template>
            <template #option="scope">
              <div class="oprContainer">
                <el-button type="primary" link @click="handleHomePage(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('患者主页')">患者主页</el-button>
                <el-button type="primary" link @click="handleCurrent(scope.row)" v-if="!userStore.needCheckPermission || hadPermissionList.includes('查看就诊详情')">当前就诊</el-button>
              </div>
            </template>
            <template #medicalRecordTypeList="scope">
              <template v-if="scope.row.medicalRecordType == 1">
                <i class="iconfont icon-zhuyuan1 beHospitalized"></i
                ><span>住院</span>
              </template>
              <template v-if="scope.row.medicalRecordType == 2">
                <i class="iconfont icon-menjizhen outpatientService"></i>
                <span>门急诊</span>
              </template>
              <template v-if="scope.row.medicalRecordType == 3">
                <i class="iconfont icon-tijian outpatientService"></i>
                <span>体检</span>
              </template>
            </template>
            <template #diseaseTypeIdList="scope">
              <template v-if="scope.row.diseaseTypeNames">
                <CommonTooltipWithSlotContent className="diseaseTooltip" >
                  <div class="singleLineTooltipText">
                    <span v-for="(item, index) in scope.row.diseaseTypeNames.split('；')" :key="'disease' + index" class="itemTag">{{ item }}</span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.diseaseTypeNames.split('；')" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
          </myTable>
        </div>
      </div>
    </div>
    <HistoryExportRecord
      v-if="ishistoryExportRecord"
      :type="1"
      :treeSource="treeSource"
      :studyCohort="studyCohort"
      :isMedicalRecord="true"
      @closure="handleHisExport(false)"
      @echo="echo"
      :queryWay="1"
    ></HistoryExportRecord>
    <ExportMedicalRecords
      v-if="isExportMedicalRecords"
      :pageResult="pageResult"
      :studyName="studyName"
      :search="searchValue"
      :isMedicalRecord="true"
      :queryWay="1"
      :studyCohort="studyCohort"
      :mySearchRef="mySearchRefValue"
      @closure="handleExport(false)"
    ></ExportMedicalRecords>
    <AddConditionsAndFixed
      v-if="isAddConditions"
      @close="handelClose"
      @handelSure="handelSure"
      :checkedIds="checkedIds"
      :searchArr="search"
      :treeSource="treeSource"
      :searchInit="fixedArr"
      :length="searchInit.length"
      :fixedType="4"
    ></AddConditionsAndFixed>
  </div>
</template>
<script>
export default {
  name: 'medicalRecord'
}
</script>
<script setup>
import { reactive, ref, watch, computed, onMounted, nextTick, onUnmounted, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import lodash from 'lodash'
import HistoryExportRecord from '@/components/medicalRecord/components/historyExportRecord.vue'
import ExportMedicalRecords from '@/components/medicalRecord/components/exportMedicalRecords.vue'
// import AddConditions from '@/components/medicalRecord/components/AddConditions.vue'
import AddConditionsAndFixed from '@/components/medicalRecord/components/AddConditionsAndFixed.vue'
import hookImg from '@/assets/hook.png'
import { getMedicalRecords, getCommonUse } from '@/api/api_homePage.js'
import { useMedicalStore } from '@/store/medicalStore'
import router from '@/router'
import { useUserStore } from '@/store/user'
import { echartsToPx } from '@/utils/utils'
const userStore = useUserStore()
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach((item) => {
  // 从病历库取患者主页权限
  if (router.currentRoute.value.name === 'researchQueueDetail' && item.url === '/medicalRecordLibrary' && item.name !== '病历导出') {
    hadPermissionList.value.push(item.name)
  }
  // 取自身研究队列权限
  if (item.url === '/research/researchQueue') {
    hadPermissionList.value.push(item.name)
  }
  // 从就诊详情取查看权限
  if (item.url === '/medicalRecord/medicalDetails' && item.name === '查看') {
    hadPermissionList.value.push('查看就诊详情')
  }
})
const medicalStore = useMedicalStore()
const leftSectionExpand = ref(true)
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
  agencyIds: {
    type: Array,
    default: () => {
      return []
    }
  },
  diseaseTypeIdList: {
    type: Array,
    default: () => {
      return []
    }
  }
})
const emits = defineEmits('transferSearch', 'transferSearchExport')
const filterText = ref('')
const treeRef = ref()
const mySearchRef = ref({})
const myTableRef = ref(null)
const checkedIds = ref([])
const ishistoryExportRecord = ref(false)
const isExportMedicalRecords = ref(false)
const searchInit = ref([
  {
    id: '0-1',
    type: 'positiveInteger',
    label: '就诊ID',
    maxlength: 19,
    value: 'id',
    init: true
  },
  {
    id: '0-2',
    label: '患者ID',
    maxlength: 19,
    type: 'positiveInteger',
    value: 'patientId',
    init: true
  },
  {
    id: '0-3',
    label: '文件ID',
    maxlength: 19,
    type: 'positiveInteger',
    value: 'fileId',
    init: true
  }
])
const fixedArr = ref([])
const getSearchInit = () => {
  return new Promise((resolve, reject) => {
    getCommonUse({ type: 4 }).then((res) => {
      if (res.code === 10000) {
        if (res.data?.length && res.data[0].filterItemContent) {
          const fixedQuery = JSON.parse(res.data[0].filterItemContent) || []
          // fixedArr.value = fixedQuery || []
          fixedQuery.forEach((item) => {
            checkedIds.value.push(item.id)
          })
          const newArr = []
          const result = treeToArr(props.initTreeData)
          result.forEach(v => {
            if (lodash.findIndex(fixedQuery, { id: v.id }) > -1) {
              newArr.push({ ...v, init: true })
            }
          })
          fixedArr.value = newArr
        }
        resolve()
      }
    })
  })
}
function treeToArr(data) {
  const result = []
  data.forEach(item => {
    const loop = data => {
      result.push(data)
      const child = data.children
      if (child) {
        for (let i = 0; i < child.length; i++) {
          loop(child[i])
        }
      }
    }
    loop(item)
  })
  return result
}

const search = ref([])
const searchValue = ref([])
const mySearchRefValue = ref(null)
const treeSource = ref([])
const isAddConditions = ref(false)
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

const common = reactive({
  showToolTip: false,
  text: '',
  tableData: [],
  initColumn: [
    { label: '就诊ID', value: 'id', fixed: 'left', minWidth: 140 },
    { label: '患者ID', value: 'patientId', fixed: 'left', minWidth: 140 },
    { label: '文件ID', value: 'fileId', minWidth: 140 }
  ],
  column: [
    { label: '就诊ID', value: 'id', fixed: 'left', minWidth: 140 },
    { label: '患者ID', value: 'patientId', fixed: 'left', minWidth: 140 },
    { label: '文件ID', value: 'fileId', minWidth: 140 }
  ]
})
common.column = common.column.concat(
  props.initTreeData[0].children[0].children
)
const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
const indent = ref(echartsToPx(20))
const resizeHeight = () => {
  minHeight.value = Math.floor(echartsToPx(52))
  indent.value = echartsToPx(20)
}
onMounted(async() => {
  search.value = lodash.cloneDeep(searchInit.value)
  await getSearchInit()
  search.value = lodash.cloneDeep(searchInit.value).concat(fixedArr.value)
  searchValue.value = lodash.cloneDeep(searchInit.value).concat(fixedArr.value)
  treeSource.value = props.initTreeData
  getList()
  window.addEventListener('resize', resizeHeight)
})
onDeactivated(() => {
  window.removeEventListener('resize', resizeHeight)
})
onUnmounted(() => {
  window.removeEventListener('resize', resizeHeight)
})
watch(filterText, (val) => {
  treeRef.value.filter(val)
})
watch(
  () => props.studyCohort,
  (val) => {
    mySearchRef.value.formSearch.agencyIdList = []
    mySearchRef.value.formSearch.diseaseTypeIdList = []
    pageResult.value.pageNum = 1
    getList()
  }
)
// 监听treedata,里面有异步获取的数据,网络/接口慢的情况下同步不及时,会造成搜索下拉项为空的情况
watch(
  () => props.initTreeData,
  (val) => {
    const result = treeToArr(props.initTreeData)
    result.forEach(v => {
      const index = lodash.findIndex(fixedArr.value, { id: v.id })
      if (index > -1) {
        fixedArr.value[index] = { ...v, init: true }
      }
    })
    search.value = lodash.cloneDeep(searchInit.value).concat(fixedArr.value)
    searchValue.value = lodash.cloneDeep(searchInit.value).concat(fixedArr.value)
  },
  {
    deep: true
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
const changeChecked = () => {
  const checkedNodes = treeRef.value.getCheckedNodes(false, false)
  lodash.remove(checkedNodes, (n) => {
    return n.children
  })
  common.column = common.initColumn.concat(checkedNodes)
}
const handelReset = () => {
  mySearchRef.value.handleReset()
  pageResult.value.pageNum = 1
  getList()
  mySearchRefValue.value = mySearchRef.value.formSearch
}
const handleSub = () => {
  pageResult.value.pageNum = 1
  getList()
  searchValue.value = search.value
  mySearchRefValue.value = mySearchRef.value.formSearch
}
const getList = () => {
  const params = {
    ...mySearchRef.value.formSearch,
    pageNum: pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize,
    queueId: props.studyCohort
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
  if (props.studyCohort) {
    if (!params.agencyIdList || !params.agencyIdList.length) {
      // params.agencyIdList = props.agencyIds
      params.agencyIdList = []
    }
    if (!params.diseaseTypeIdList || !params.diseaseTypeIdList.length) {
      // params.diseaseTypeIdList = props.diseaseTypeIds
      params.diseaseTypeIdList = []
    }
  }
  getMedicalRecords(params).then((res) => {
    if (res.code === 10000) {
      common.tableData = res.data.items
      pageResult.value.total = res.data.total
    }
  })
}
const handleSizeChange = (val) => {
  getList()
}
const handleCurrentChange = (val) => {
  getList()
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
      if (!checkedIds.value.includes(obj.id)) {
        checkedIds.value.push(obj.id)
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
  return !data?.children && !checkedIds.value.includes(data.id)
}
// 点击展开 收缩按钮
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
// eslint-disable-next-line no-unused-vars
const handelAddConditions = () => {
  isAddConditions.value = true
}
const handelClose = () => {
  isAddConditions.value = false
}
const handelSure = async (obj) => {
  checkedIds.value = obj.ids
  search.value = searchInit.value.concat(obj.nodes)
  isAddConditions.value = false
  fixedArr.value = obj.fixedArr
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
  // if (userStore.needCheckPermission && !hadPermissionList.value.includes('查看就诊详情')) {
  //   ElMessage.warning('暂无就诊详情查看权限，请联系管理员')
  //   return false
  // }
  row.key = props.studyName + row.id
  row.routerName = router.currentRoute.value.name
  medicalStore.handlerRouterKeepLiveList(router.currentRoute.value.name, 'del')
  medicalStore.setmedicalList({
    ...row,
    type: 0,
    studyCohort: props.studyCohort,
    studyName: props.studyName
  })

  if (medicalStore.medicalList.length !== 10 || medicalStore.medicalList.findIndex(item => item.key === row.key) !== -1) {
    router.push({ name: 'medicalDetails' })
  } else {
    ElMessage.error('当前就诊详情已超过10条记录，请先清理历史记录后再查看')
  }
}
const handelDel = (item, index) => {
  search.value.splice(index, 1)
  checkedIds.value.splice(checkedIds.value.indexOf(item.id), 1)
}
const echo = (data) => {
  emits('transferSearchExport', data)
  handleHisExport(false)
}

const echoValue = ref({})
const handelEchoSearch = (obj) => {
  search.value = obj.searchItems
  echoValue.value = obj.values
}
defineExpose({ handelEchoSearch })
</script>
<style lang="scss" scoped>
.medicalRecord {
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
    // overflow-y: auto;
    flex-basis: 258px;
    box-sizing: border-box;
    height: 100%;
    margin-right: 16px;
    border-radius: 8px;
    background: var(--theme-card);
    &.hideLeftSection {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-basis: 48px;
      box-sizing: border-box;
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
    .title {
      height: 55px;
      line-height: 55px;
      font-weight: 500;
      font-size: 16px;
      color: var(--theme-text);
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
    .search {
      height: 28px;
      margin-bottom: 10px;
      // :deep(.el-input__wrapper) {
      //   // background: var(--theme-fill);
      // }
    }
    .leftTree {
      overflow: hidden;
      flex: 1;
      padding-bottom: 14px;
    }
    :deep(.el-scrollbar) {
      padding: 0 10px;
    }
    // :deep(.el-tree-node__expand-icon.expanded),
    // :deep(.el-tree-node__expand-icon) {
    //   position: absolute;
    //   right: 0;
    // }
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

    .treeLabel {
      line-height: 44px;
      font-weight: 400;
      font-size: 14px;
    }
  }

  .tableAndSearch {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    width: 0;
    // width: calc(100% - 258px - 15px);
    height: 100%;

    .searchContainer {
      position: relative;
      padding: 24px;
      padding-bottom: 2px;
      border-radius: 8px;
      background: var(--theme-card);
      .topOpr {
        display: flex;
        align-items: center;
        padding-bottom: 24px;
        .title {
          flex: 1;
          font-weight: 500;
          font-size: 16px;
          color: var(--theme-text);
        }

        .addConditions {
          cursor: pointer;
          line-height: 14px;
          font-size: 14px;
          color: var(--el-color-primary);
          span {
            margin-left: 2px;
          }
        }
        .line {
          width: 0;
          height: 24px;
          margin-left: 14px;
          margin-right: 26px;
          border-right: 1px solid #cbcfdc;
          opacity: 1;
        }
      }

      .unfoldBtn {
        position: absolute;
        left: 50%;
        bottom: -12px;
        z-index: 2;
        width: 64px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-radius: 16px 16px 16px 16px;
        background: var(--theme-card);
        opacity: 1;
        cursor: pointer;
        line-height: 20px;
        text-align: center;
        font-weight: 500;
        font-size: 16px;
        color: var(--theme-primary);
        transform: translateX(-50%);
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
    }

    .blank {
      height: 16px;
    }

    .tableContainer {
      display: flex;
      overflow: hidden;
      flex-direction: column;
      flex: 1;
      padding: 0 24px;
      border-radius: 8px;
      background: var(--theme-card);

      .topOpr {
        display: flex;
        align-items: center;
        padding: 18px 0;

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
          font-size: 14px;
          color: var(--el-color-primary);
        }

        .flex1 {
          flex: 1;
        }
        .el-button {
          i {
            margin-right: 10px;
            font-size: 12px;
          }
        }
        .common-btn {
          margin-right: 12px;
        }
      }

      .myTable {
        overflow: hidden;
        flex: 1;
      }

      .oprContainer {
        display: flex;
        align-items: center;
        // .oprBtn {
        //   margin-right: 14px;
        //   cursor: pointer;
        //   line-height: 14px;
        //   font-size: 14px;
        //   color: var(--el-color-primary);
        //   word-break: keep-all;
        // }
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
.singleLineTooltipText {
  overflow: hidden;
  flex: 1;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.itemTag {
  display: inline-block;
  overflow: hidden;
  max-width: 100%;
  height: 20px;
  margin-right: 8px;
  padding: 0 8px;
  border-radius: 2px;
  background: var(--theme-fill);
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--theme-text);
  white-space: nowrap;
}
</style>
