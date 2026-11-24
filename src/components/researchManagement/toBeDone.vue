<template>
  <div class="dataHomePage" v-show="!showApprove">
    <div class="topNav">
      <ul>
        <li
          v-for="item in tabs"
          :key="item.value"
          class="flexCenter"
          :class="{ active: activeTab === item.value }"
          @click="handleClickTab(item.value)"
        >
          <div>{{ item.label }}</div>
          <div class="bottomLine"></div>
        </li>
      </ul>
    </div>
    <div class="main">
      <div class="leftNav">
        <div class="title">{{ tabs[activeTab]?.leftNavTitle }}</div>
        <div class="matterContainer">
          <div v-for="(item,index) in leftNavConfig" :key="index" :class="{matterItem:true,active:item.id===matterItem}" @click="handleMateer(item)">
            {{item.label}}{{`（${item.numberKey[activeTab]==='all'?totalList[activeTab]:(tobeDoneStore.tobeDoneNum[item.numberKey[activeTab]]||0)}）`}}
          </div>
        </div>
      </div>
      <div class="tableContainer">
        <div class="tableTitle">
          {{ tabs[activeTab]?.tableTitle }}
        </div>
        <myTable
          ref="myTableRef"
          :border="true"
          class="myTable"
          :tableData="tableData"
          :column="currentColumns"
          :pagination="true"
          handlerName="查看"
          :handlerWidth="70"
          :pageResult="pageResult"
          @handleSizeChange="handleSizeChange"
          @handleCurrentChange="handleCurrentChange"
        >
          <template #auditStatus="scope">
            <template v-if="activeTab!==2">
              <div class="point" :style="{backgroundColor:statusGroupOptions[scope.row.auditStatus-1]?.color}"></div>
              <div>{{ statusGroupOptions[scope.row.auditStatus-1||0]?.label||'-' }}</div>
            </template>
            <template v-else>
              <div class="point" :style="{backgroundColor:approveStatusOptions[scope.row.auditRes]?.color}"></div>
              <div>{{ approveStatusOptions[scope.row.auditRes]?.label||'-' }}</div>
            </template>

          </template>
          <template #option="scope">
            <div class="oprContainer">
              <div class="oprBtn" @click="handleRow('Look',scope.row)" v-if="activeTab!==1 && (!needCheckPermission || hadPermissionList.includes('查看'))">
                查看
              </div>
              <div class="oprBtn" @click="handleRow('Approval',scope.row)" v-else-if="!needCheckPermission || hadPermissionList.includes('审批')">
                审批
              </div>
            </div>
          </template>
        </myTable>
      </div>
    </div>
  </div>
  <projectApproveForm :mode="mode" :curEditRow="curEditRow" @handleBack="handleBack" v-if="showApprove"/>
</template>
<script setup>
import { ref } from 'vue'
import { getTobeDoneList } from '@/api/api_scientific'
import lodash from 'lodash'
import { useTobeDoneStore } from '@/store/tobeDoneStore'
import {
  enum_status as statusGroupOptions,
  approve_status as approveStatusOptions
} from '@/components/researchManagement/enum/enum_researchManagement.js'
import projectApproveForm from '@/components/researchManagement/projectApproveForm.vue'
import { useRoute } from 'vue-router'
import { getPagePermission } from '@/hooks/permissionHooks'
const route = useRoute()

// eslint-disable-next-line no-unused-vars
const { needCheckPermission, hadPermissionList } = getPagePermission(route.path)
const tobeDoneStore = useTobeDoneStore()
const tabs = ref([
  {
    label: '我的申请',
    leftNavTitle: '我的申请',
    tableTitle: '申请列表',
    value: 0
  },
  {
    label: '我的待办',
    leftNavTitle: '我的待办',
    tableTitle: '待办列表',
    value: 1
  },
  {
    label: '我的已办',
    leftNavTitle: '我的已办',
    tableTitle: '已办列表',
    value: 2
  }
])
const activeTab = ref(1)
const handleClickTab = (index) => {
  activeTab.value = index
  handleColumns()
  getListDataFn()
  tobeDoneStore.setTobeDoneNum()
}
const matterItem = ref(0)
const totalList = ref([0, 0, 0])
const leftNavConfig = ref([
  {
    label: '全部',
    numberKey: ['all', 'all', 'all'],
    id: 0
  },
  {
    label: '项目立项',
    numberKey: ['applyProjInitNum', 'todoProjInitNum', 'edProjInitNum'],
    id: 1
  },
  {
    label: '项目研究',
    numberKey: ['applyProjResearchNum', 'todoProjResearchNum', 'edProjResearchNum'],
    id: 2
  },
  {
    label: '项目变更',
    numberKey: ['applyProjChangeNum', 'todoProjChangeNum', 'edProjChangeNum'],
    id: 3
  },
  {
    label: '项目中检',
    numberKey: ['applyProjCheckNum', 'todoProjCheckNum', 'edProjCheckNum'],
    id: 4
  },
  {
    label: '项目结题',
    numberKey: ['applyProjConclusionNum', 'todoProjConclusionNum', 'edProjConclusionNum'],
    id: 5
  },

  {
    label: '论文管理',
    numberKey: ['applyThesisNum', 'todoThesisNum', 'edThesisNum'],
    id: 6
  },
  {
    label: '著作管理',
    numberKey: ['applyBookNum', 'todoBookNum', 'edBookNum'],
    id: 7
  },
  {
    label: '专利管理',
    numberKey: ['applyPatentNum', 'todoPatentNum', 'edPatentNum'],
    id: 8
  },
  {
    label: '获奖管理',
    numberKey: ['applyAwardNum', 'todoAwardNum', 'edAwardNum'],
    id: 9
  }
])
const handleMateer = (obj) => {
  if (matterItem.value === obj.id) {
    return
  }
  matterItem.value = obj.id
  pageResult.value.pageNum = 1
  getListDataFn()
  tobeDoneStore.setTobeDoneNum()
}
const tableData = ref([])
const intColumns = ref([
  {
    label: '项目阶段/成果阶段',
    value: 'businessType',
    showTab: [0, 1, 2],
    formatter: (row) => {
      const index = lodash.findIndex(leftNavConfig.value, { id: row.businessType })
      if (index > -1) {
        return leftNavConfig.value[index].label
      }
      return '-'
    }
  },
  { label: '项目名称/成果名称', value: 'projectName', showTab: [0, 1, 2], formatter: (row) => { return row.projectName || '-' } },
  { label: '项目编号', value: 'projectCode', showTab: [0, 1, 2], formatter: (row) => { return row.projectCode || '-' } },
  { label: '项目负责人', value: 'projectDirectorName', showTab: [0, 1, 2], formatter: (row) => { return row.projectDirectorName || '-' } },
  { label: '提交人', value: 'submitPersonName', showTab: [0, 1, 2], formatter: (row) => { return row.submitPersonName || '-' } },
  { label: '提交时间', value: 'submitTime', showTab: [0, 1, 2], formatter: (row) => { return row.submitTime || '-' } },
  { label: '审批时间', value: 'createTime', showTab: [2], formatter: (row) => { return row.createTime || '-' } },
  { label: '审批状态', value: 'auditStatus', showTab: [0, 2], html: true }
])
const currentColumns = ref([])
const handleColumns = () => {
  currentColumns.value = lodash.cloneDeep(intColumns.value.filter(item => {
    return item.showTab.includes(activeTab.value)
  }))
}
const initFn = () => {
  handleColumns()
  getListDataFn()
  tobeDoneStore.setTobeDoneNum()
}

const pageResult = ref({
  pageNum: 1,
  pageSize: 20,
  total: 0
})
const handleSizeChange = (val) => {
  getListDataFn()
}
const handleCurrentChange = (val) => {
  getListDataFn()
}
const getListDataFn = () => {
  tableData.value = []
  const params = {
    businessType: matterItem.value || '',
    pageNum: pageResult.value.pageNum,
    pageSize: pageResult.value.pageSize,
    tabType: activeTab.value + 1
  }
  getTobeDoneList(params).then(res => {
    if (res.code === 10000) {
      tableData.value = res.data?.items || []
      pageResult.value.total = res.data.total
      if (!matterItem.value) {
        totalList.value[activeTab.value] = res.data.total
      }
    }
  })
}
initFn()
const showApprove = ref(false)
const mode = ref('')
const curEditRow = ref(null)
// 查看或审批
const handleRow = (type, row) => {
  if (type === 'Look') {
    // 查看
    mode.value = 'view'
  } else if (type === 'Approval') {
    // 审批
    console.log('row', row)
    mode.value = 'approve'
  }
  // row.businessType = 9
  curEditRow.value = {
    ...row,
    commitTime: row.createTime,
    projectCommitterName: row.creator
  }
  showApprove.value = true
}
// 返回
const handleBack = () => {
  showApprove.value = false
  getListDataFn()
}
</script>
<style lang="scss" scoped>
.dataHomePage {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.topNav {
  display: flex;
  overflow: hidden;
  align-items: center;
  box-sizing: border-box;
  height: 58px;
  margin-bottom: 0;
  border-radius: 8px;
  background: var(--theme-card);

  ul {
    display: flex;
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    padding: 0 32px;
    font-size: 16px;
    li {
      display: flex;
      position: relative;
      flex-direction: column;
      width: 70px;
      height: 100%;
      margin-right: 32px;
      cursor: pointer;
      font-size: 16px;
      color: var(--theme-text-2);

      .bottomLine {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 3px;
        background-color: var(--theme-card);
      }

      &.active {
        font-weight: 600;
        color: var(--theme-primary);
        .bottomLine {
          background-color: var(--theme-primary);
        }
      }
    }
  }
}
.main {
  display: flex;
  overflow: hidden;
  flex: 1;
  width: 100%;
  margin-top: 16px;
  .leftNav {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex-shrink: 0;
    box-sizing: border-box;
    width: 259px;
    height: 100%;
    padding: 8px;
    border-radius: 8px;
    background-color: var(--theme-card);
    .title {
      padding: 16px;
      line-height: 23px;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
    }
    .matterContainer {
      .matterItem {
        display: flex;
        align-items: center;
        height: 36px;
        margin-bottom: 8px;
        padding: 0 16px;
        border-radius: 2px 2px 2px 2px;
        cursor: pointer;
        font-weight: 400;
        font-size: 14px;
        color: var(--theme-text-2);
        &.active {
          background: rgba(54, 112, 248, 0.05);
          font-weight: 600;
          color: var(--theme-primary);
        }
      }
    }
  }
  .tableContainer {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    margin-left: 16px;
    padding: 24px;
    padding-bottom: 0;
    border-radius: 8px;
    background-color: var(--theme-card);
    .tableTitle {
      margin-bottom: 24px;
      line-height: 19px;
      font-weight: 600;
      font-size: 16px;
      color: var(--theme-text);
    }
    :deep(.myTable) {
      flex: 1;
      width: 100%;
    }
    :deep(.paginationContainer) {
      padding: 0;
    }
  }
}
.point {
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
}
.oprContainer {
  .oprBtn {
    cursor: pointer;
    line-height: 22px;
    font-size: 14px;
    color: var(--theme-primary);
  }
}
</style>
