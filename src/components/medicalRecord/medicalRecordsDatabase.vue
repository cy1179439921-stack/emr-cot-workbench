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
          <!-- v-show 暂时改成v-if避免报错 -->
          <div id="treeFilter" v-show="queryWay === 2">
            <rgpa ref="rgpaRef" :menuList="treeSelectList" @fullScreen="fullScreen" valueFileds="label"></rgpa>
          </div>
          <div v-show="isStartMove" :class="['mask', { isMoveMask: isMoveMask }]" @dragleave="handleDrop($event)" @dragenter="onMove($event)">
            <span>{{ moveText }}</span>
          </div>
        </div>
        <div class="tableContainer" v-show="isTreeFull || queryWay === 1">
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
          <div class="updateContainer" v-if="!userStore.needCheckPermission || hadPermissionList.includes('指标提取任务管理')">
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
            <div class="progressText">
              任务进度：
            </div>
            <div class="noProgressNum" v-if="status===0">
              -&nbsp;-
            </div>
            <div :class="{progressNum:true,errorStatus:status===3}" v-if="status!==0">
              {{`更新进度：${processObj.completeNum||0}/${processObj.sumNum||0}`}}
            </div>
            <div :class="{progressContainer:true,errorStatus:status===3}">
              <el-progress :show-text="false" :percentage="percentage" ></el-progress>
            </div>
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
          <myTable
            ref="myTableRef"
            class="myTable"
            :tableData="common.tableData"
            :column="common.column"
            handlerName="查看"
            :handlerWidth="172"
            :showToolTip="common.showToolTip"
            :pagination="true"
            :pageResult="pageResult"
            @handleSizeChange="handleSizeChange"
            @handleCurrentChange="handleCurrentChange"
          >
            <template #status="scope">
              <span>{{ scope.row }}</span>
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
            <template #otherDiagnosisList="scope">
              <template v-if="scope.row.otherDiagnosisList?.length">
                <CommonTooltipWithSlotContent className="diseaseTooltip" >
                  <div class="singleLineTooltipText">
                    <span class="itemTag" v-for="(item,index) in scope.row.otherDiagnosisList" :key="index">
                      {{ item }}
                    </span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.otherDiagnosisList" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
            <template #otherDiagnosisIcd10List="scope">
              <template v-if="scope.row.otherDiagnosisIcd10List?.length">
                <CommonTooltipWithSlotContent className="diseaseTooltip" >
                  <div class="singleLineTooltipText">
                    <span class="itemTag" v-for="(item,index) in scope.row.otherDiagnosisIcd10List" :key="index">
                      {{ item }}
                    </span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.otherDiagnosisIcd10List" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
            <template #operateCodeList="scope">
              <template v-if="scope.row.operateCodeList?.length">
                <CommonTooltipWithSlotContent className="diseaseTooltip" >
                  <div class="singleLineTooltipText">
                    <span class="itemTag" v-for="(item,index) in scope.row.operateCodeList" :key="index">
                      {{ item }}
                    </span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.operateCodeList" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
            <template #operateDateList="scope">
              <template v-if="scope.row.operateDateList?.length">
                <CommonTooltipWithSlotContent className="diseaseTooltip" >
                  <div class="singleLineTooltipText">
                    <span class="itemTag" v-for="(item,index) in scope.row.operateDateList" :key="index">
                      {{ item }}
                    </span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.operateDateList" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
            <template #operateNameList="scope">
              <template v-if="scope.row.operateNameList?.length">
                <CommonTooltipWithSlotContent className="diseaseTooltip" >
                  <div class="singleLineTooltipText">
                    <span class="itemTag" v-for="(item,index) in scope.row.operateNameList" :key="index">
                      {{ item }}
                    </span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in scope.row.operateNameList" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template>
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
            <template #diseaseTypeIdList="scope">
              <template v-if="scope.row.diseaseTypeNames">
                <CommonTooltipWithSlotContent className="diseaseTooltip" :content="scope.row.diseaseTypeNames">
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

                  <!-- <div class="singleLineTooltipText">
                    <span class="itemTag" v-for="(item,index) in formatterDisease(scope.row.diseaseTypeIdList)" :key="index">
                      {{ item }}
                    </span>
                  </div>
                  <template #content>
                    <div class="tooltip-custom">
                      <div class="item" v-for="(item, index) in formatterDisease(scope.row.diseaseTypeIdList)" :key="'tooltip' + index">
                        {{ item }}
                      </div>
                    </div>
                  </template> -->
                </CommonTooltipWithSlotContent>
              </template>
              <div v-else>-</div>
            </template>
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
          </myTable>
        </div>
      </div>
    </div>
    <HistoryExportRecord
      v-if="ishistoryExportRecord"
      :type="1"
      :treeSource="treeSource"
      :studyCohort="studyCohort"
      @closure="handleHisExport(false)"
      @echo="echo"
    ></HistoryExportRecord>
    <ExportMedicalRecords
      v-if="isExportMedicalRecords"
      :pageResult="pageResult"
      :studyName="studyName"
      :search="searchValue"
      :queryWay="queryWay"
      :isMedicalRecord="true"
      :rgpaRef="rgpaRef"
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
      :fixedType="3"
    ></AddConditionsAndFixed>
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
      :isCaseBase="true"
    >
    </CommonUse>
  </div>
</template>

<script setup>
defineOptions({
  name: 'MedicalRecordDatabase3',
  inheritAttrs: false
})
import { reactive, ref, watch, computed, onMounted, nextTick, onUnmounted, onDeactivated, onActivated } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import lodash from 'lodash'
import HistoryExportRecord from '@/components/medicalRecord/components/historyExportRecord.vue'
import ExportMedicalRecords from '@/components/medicalRecord/components/exportMedicalRecords.vue'
// import AddConditions from '@/components/medicalRecord/components/AddConditions.vue'
import AddConditionsAndFixed from '@/components/medicalRecord/components/AddConditionsAndFixed.vue'
import CommonUse from '@/components/medicalRecord/components/commonUse.vue'
import hookImg from '@/assets/hook.png'
import rgpa from '@/components/medicalRecord/components/rgpa.vue'
import { getMedicalRecords, saveCommonUse, getCommonUse, getMedicalTree } from '@/api/api_homePage.js'
import { useMedicalStore } from '@/store/medicalStore'
import router from '@/router'
import { useUserStore } from '@/store/user'
import { echartsToPx } from '@/utils/utils'
const userStore = useUserStore()
const leftSectionExpand = ref(true)
// 权限
const hadPermissionList = ref([])
userStore.userPermissionMenu.forEach(item => {
  // 从病历库取患者主页权限
  if (router.currentRoute.value.name === 'medicalRecordLibrary' && item.url === '/medicalRecordLibrary') {
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
  diseaseTypeIdList: {
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
  }
})
const filterText = ref('')
const treeRef = ref()
const mySearchRef = ref(null)
const myTableRef = ref(null)
const checkedIds = ref([])
const ishistoryExportRecord = ref(false)
const isExportMedicalRecords = ref(false)
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

const treeSelectList = computed(() => {
  const collectedItems = props.initTreeData.reduce((acc, item) => {
    if (item.codomainType !== undefined) {
      acc.push({ label: item.label, name: item.label, indexSearchType: item.type, codomainType: item.codomainType, id: item.id, enumOptionsString: item.EnumValues })
    }
    if (item.children && item.children.length > 0) {
      return acc.concat((function collect(items) {
        return items.reduce((accInner, itemInner) => {
          if (itemInner.codomainType !== undefined) {
            accInner.push({ label: itemInner.label, name: itemInner.label, indexSearchType: itemInner.type, codomainType: itemInner.codomainType, id: itemInner.id, enumOptionsString: itemInner.EnumValues })
          }
          if (itemInner.children && itemInner.children.length > 0) {
            return accInner.concat(collect(itemInner.children))
          }
          return accInner
        }, [])
      })(item.children))
    }
    return acc
  }, [])

  return collectedItems
})

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
    getCommonUse({ type: 3 }).then((res) => {
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
            if (lodash.findIndex(fixedQuery, { id: v.id }) > -1 && !v.children) {
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
// const formatterDisease = (arr = []) => {
//   const nameList = []
//   arr.forEach(item => {
//     const index = lodash.findIndex(props.diseaseTypeIdList, { id: item })
//     if (index > -1) {
//       nameList.push(props.diseaseTypeIdList[index].name)
//     }
//   })
//   return nameList
// }
const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
onMounted(async() => {
  search.value = lodash.cloneDeep(searchInit.value)
  await getSearchInit()
  search.value = lodash.cloneDeep(searchInit.value).concat(fixedArr.value)
  searchValue.value = lodash.cloneDeep(searchInit.value).concat(fixedArr.value)
  treeSource.value = props.initTreeData
  getList()
  window.addEventListener('resize', resizeHeight)
})
onActivated(() => {
  window.addEventListener('resize', resizeHeight)
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
// 防抖处理，避免勾选全选时多次触发导致卡顿
const changeCheckedDebounced = lodash.debounce(() => {
  if (!treeRef.value) return
  const checkedNodes = treeRef.value.getCheckedNodes(false, false)
  lodash.remove(checkedNodes, (n) => n.children)
  common.column = common.initColumn.concat(checkedNodes)
}, 150)

const changeChecked = () => {
  changeCheckedDebounced()
}
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
const getList = () => {
  if (queryWay.value === 1) {
    const params = {
      ...mySearchRef.value.formSearch,
      pageNum: pageResult.value.pageNum,
      pageSize: pageResult.value.pageSize,
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
    getMedicalRecords(params).then((res) => {
      if (res.code === 10000) {
        common.tableData = res.data.items
        pageResult.value.total = res.data.total
      }
    })
  } else {
    getTreeList()
  }
}

const getTreeList = () => {
  // const nullSearch = JSON.stringify({
  //   nodeType: 1,
  //   leafCondition: {
  //     indexId: '',
  //     name: '',
  //     value: '',
  //     condition: '',
  //     dataType: 3
  //   },
  //   id: '9999999999'
  // })
  const whetherTheConditionsAreMet = rgpaRef.value.whetherTheConditionsAreMet('条件树未满足查询条件，请检查后再提交')
  if (!whetherTheConditionsAreMet) {
    return
  }

  const search = rgpaRef.value.getData()

  const params = {
    ...pageResult.value,
    searchConditionTree: search,
    queueId: props.studyCohort,
    searchType: 2
  }
  getMedicalTree(params).then(res => {
    if (res.code === 10000) {
      common.tableData = res.data.items || []
      common.tableData.forEach(item => {
        const customIndexList = lodash.get(item, 'indexValueList') || []
        customIndexList.forEach(v => {
          item['customIndex-' + v.indexId] = v.indexValue
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
      if (!checkedIds.value.includes(obj.soleID)) {
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
  search.value = JSON.parse(JSON.stringify(searchInit.value)).concat(obj.nodes)
  fixedArr.value = obj.fixedArr
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
          type: queryWay.value === 1 ? 6 : 7,
          filterName: obj.inputValue,
          queueId: props.studyCohort
        }
        if (queryWay.value === 2) {
          params.filterItemContent = JSON.stringify(rgpaRef.value.getData())
        } else {
          const searchArr = lodash.cloneDeep(search.value)
          searchArr.forEach(item => {
            if (lodash.findIndex(searchInit.value, { id: item.id }) < 0) {
              // 将非初始固定查询项的init设置为false
              item.init = false
            }
          })
          params.filterItemContent = JSON.stringify({
            // search: search.value,
            search: searchArr,
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
    search.value = search.value = JSON.parse(JSON.stringify(searchInit.value))
    echoValue.value = {}
    routineFilterName.value = '无'
    checkedIds.value = []
  } else {
    obj.searchItems.forEach(item => {
      if (item.soleID && lodash.findIndex(fixedArr.value, { soleID: item.soleID }) > -1) {
        // 回显搜索项的时候如果额外添加的固定搜索项内有这一项置为固定项
        item.init = true
      } else if (item.soleID && lodash.findIndex(fixedArr.value, { soleID: item.soleID }) < 0) {
        // 没有的设置为可删除的
        item.init = false
      }
    })
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
  nextTick(() => {
    rgpaRef.value.layout()
  })
}

const echo = (data) => {
  const { treeValue, isTree } = data
  queryWay.value = isTree ? 2 : 1
  nextTick(() => {
    if (isTree) {
      handelTreeSearch(treeValue)
    } else {
      handelEchoSearch({ searchItems: treeValue.search, values: treeValue.value, filterName: '无' })
    }
    handleHisExport(false)
  })
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
        margin-right: 12px;
        padding: 0 7px;
        border-radius: 2px;
        // font-weight: 500;
        font-size: 14px;
        &.noTask {
          border: 1px solid #d8d8d8;
          background: var(--theme-fill);
          color: var(--theme-text-2);
        }
        &.underWay {
          border: 1px solid #ffa100;
          background: var(--theme-fill);
          color: #ff8c00;
        }
        &.paused,
        &.errorStatus {
          border: 1px solid #ff4e4e;
          background: rgba(255, 78, 78, 0.05);
          color: #ff4e4e;
        }
      }
      .progressText {
        font-weight: 400;
        font-size: 16px;
        color: var(--theme-text);
      }
      .progressNum {
        font-weight: 400;
        font-size: 16px;
        color: #2c67ff;
        &.errorStatus {
          color: var(--theme-text-2);
        }
      }
      .noProgressNum {
        line-height: 19px;
        font-size: 16px;
        color: var(--theme-text);
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
.content {
  display: flex;
  overflow: hidden;
  flex: 1;
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

.tooltipText {
  display: -webkit-box;
  overflow: hidden;
  flex: 1;
  line-height: 20px;
  -webkit-line-clamp: 3; /* 显示两行 */
  font-weight: 400;
  font-size: 14px;
  -webkit-box-orient: vertical;
}
.singleLineTooltipText {
  overflow: hidden;
  flex: 1;
  width: 100%;
  // height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
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
