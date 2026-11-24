<template>
  <div class="engineering-library-home">
    <databaseTable v-if="isShowDataSet" :id="curDataSetId" :projectId="projectActiveDataBaseId" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" @goBack="isShowDataSet = false"></databaseTable>
    <div class="home-init" v-show="!isShowDataSet">
      <el-tabs v-model="editableTabsValue" type="card" class="topTabs" :class="[{'not-home': editableTabsValue !== 'home'}, {'morethan9': editableTabs.length > 9}]" closable @tab-click="handleTabClick">
        <el-tab-pane v-for="(item, index) in editableTabs" :key="item.id" :label="item.name" :name="item.id">
          <template #label>
            <div class="label-container">
              <i class="iconfont icon-gongchengku" v-if="index === 0"></i>
              <img :src="engineeringLogo" v-else>
              <div class="span-title">
                <CommonTooltip :content="item.name">
                  <span>{{ item.name }}</span>
                </CommonTooltip>
              </div>
              <i class="iconfont icon-dankuang-shanchu" @click.stop="removeTab(item.id)" v-if="index > 0"></i>
            </div>
          </template>
          <engineeringFrame :engineeringInfo="item" :tabIndex="index" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :otherPermissions="otherPermissions" @updateList="updateList" @updateName="updateItemName" @viewDataSet="viewDataBase" v-if="index !== 0"/>
        </el-tab-pane>
      </el-tabs>
      <div class="home-content" v-show="editableTabsValue === 'home'">
        <analysisHeader title="工程" v-model:showWay="showWay" :type="0" :options="options" @header-click="handleHeaderClick" @handleJumpObj="handleJumpObj"/>
        <analysisCardsOrTable ref="analysisCardsOrTableRef" :options="options" :type="0" :showWay="showWay" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" :otherPermissions="otherPermissions" @handleNew="handleHeaderClick" @handleEdit="handleHeaderClick" @handleDelete="handleHeaderClick" @handleAdd="handleHeaderClick" @handleRemove="handleHeaderClick" @handleClickCard="handleClickCard" @handleClickFolder="handleClickFolder" @viewDataBase="viewDataBase"/>
        <NewEngineering ref="newEngineeringDom" v-if="dialogVisibleNew" v-model:dialogVisibleNew="dialogVisibleNew" @updateList="updateList" @handle-close="dialogVisibleNew = false" @header-click="handleHeaderClick" :allData="allData" />
        <addFolder ref="addFolderDom" v-if="isAddFolder" @updateList="updateList" @handleClose="handleClose"></addFolder>
        <addDataSet v-if="isAddSet" type="2" ref="addDataSetDom" @updateList="updateListSet" @handleClose="handleClose"></addDataSet>
        <deleteFolder ref="deleteFolderDom" v-if="dialogVisibleDelete" v-model:dialogVisibleDelete="dialogVisibleDelete" @updateList="updateList" @deleteId="deleteId" @handle-close="dialogVisibleDelete = false" :deleteData="deleteData" :type="0"></deleteFolder>
        <removeFolder ref="removeFolderDom" v-if="dialogVisibleRemove" v-model:dialogVisibleRemove="dialogVisibleRemove" @updateList="updateList" @handle-close="dialogVisibleRemove = false" :allData="allData" :removeData="removeData" :type="0"></removeFolder>
      </div>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'EngineeringLibraryHome',
  inheritAttrs: false
})
import { ref, nextTick, onMounted, watch, onUnmounted } from 'vue'
import analysisHeader from '@/components/dataAnalysis/common/analysisHeader.vue'
import analysisCardsOrTable from '@/components/dataAnalysis/common/analysisCardsOrTable.vue'
// import analysisTable from '@/components/dataAnalysis/common/analysisTable.vue'
import NewEngineering from '@/components/dataAnalysis/common/newEngineering.vue'
import addFolder from '../common/addFolder.vue'
import deleteFolder from '../common/deleteFolder.vue'
import removeFolder from '../common/removeFolder.vue'
import addDataSet from '../dataSetLibrary/addDataSet.vue'
import engineeringFrame from '@/components/dataAnalysis/engineeringLibrary/engineeringFrame.vue'
import engineeringLogo from '@/assets/dataSet.png'
import { ElMessage } from 'element-plus'
import { useAnalysisStore } from '@/store/analysisStore'
import databaseTable from '@/components/dataAnalysis/dataSetLibrary/components/databaseTable.vue'
import { getPagePermission, getOtherPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/dataAnalysis/engineeringLibrary')
const { OtherPagePermissionList } = getOtherPagePermission(['/dataAnalysis/operationLog'])
const otherPermissions = ref([])
if (OtherPagePermissionList.value.length > 0) {
  otherPermissions.value = OtherPagePermissionList.value[0].permission
}
const analysisStore = useAnalysisStore()
const options = ref([
  {
    name: '新增工程',
    icon: new URL(`/src/assets/dataSetIcon.png`, import.meta.url).href
  },
  {
    name: '新增文件夹',
    icon: new URL(`/src/assets/newFloaderIcon.png`, import.meta.url).href
  }
  // {
  //   name: '批量管理'
  // }
])
if (needCheckPermission && !hadPermissionList.value.includes('新增')) {
  options.value = []
}
const editableTabs = ref([
  {
    name: '工程库',
    id: 'home'
  }
])
const editableTabsValue = ref('home')
const projectActiveDataBaseId = ref('')
const showWay = ref(1)
const addFolderDom = ref('')
const removeData = ref('')
const deleteData = ref('')
const deleteFolderDom = ref('')
const removeFolderDom = ref('')
const newEngineeringDom = ref('')
const addDataSetDom = ref('')
const analysisCardsOrTableRef = ref(null)
const allData = ref(null) // 总数据
const curPageData = ref(null) // 当前页数据
const dialogVisibleNew = ref(false)
const dialogVisibleRemove = ref(false)
const dialogVisibleDelete = ref(false)
const isAddFolder = ref(false)
const isAddSet = ref(false)
const isShowDataSet = ref(false) // 是否显示数据集详情
const curDataSetId = ref('') // 当前数据集
// 使用 onMounted 和 onUnmounted 来处理保存和恢复状态
onMounted(() => {
  // 从 localStorage 中读取当前选中的 tab 的值
  const savedTab = localStorage.getItem('selectedTab')
  if (savedTab) {
    editableTabsValue.value = savedTab
  }
  // 恢复时也需要恢复之前的 tabs 列表
  const savedTabs = localStorage.getItem('tabsList')
  if (savedTabs) {
    editableTabs.value = JSON.parse(savedTabs)
  }
})

// 监听变化并保存状态
watch(editableTabsValue, (newValue) => {
  localStorage.setItem('selectedTab', newValue)
})

watch(editableTabs, (newTabs) => {
  localStorage.setItem('tabsList', JSON.stringify(newTabs))
}, { deep: true })

onUnmounted(() => {
  // 销毁时清空数据
  localStorage.removeItem('selectedTab')
  localStorage.removeItem('tabsList')
})
// 点击文件夹
const handleClickFolder = (option) => {
  // option下的allData是总数据，curPageData是当前页数据
  console.log('点击文件夹', option.allData)
  allData.value = option.allData
  curPageData.value = option.curPageData
  analysisStore.setData(option.curPageData?.children || [])
  analysisStore.setPid(option.curPageData?.id || 0)
  analysisStore.setLevel(option.curPageData?.level || 0)
}
// 点击选项
const handleHeaderClick = (option) => {
  console.log(isAddSet.value)
  console.log(option)
  switch (option.name) {
    case '新增工程':
      console.log('新增工程')
      dialogVisibleNew.value = true
      break
    case '新增数据集':
      isAddSet.value = true
      nextTick(() => {
        addDataSetDom.value.handleDialog()
      })
      break
    case '新增文件夹':
      isAddFolder.value = true
      if (analysisStore.level < 5) {
        nextTick(() => {
          addFolderDom.value.handleDialog(3)
        })
      } else {
        ElMessage.error('层级已达上限!')
      }
      break
    case '批量管理':
      console.log('批量管理')
      break
    case '编辑':
      // addFolderDom.value.handleDialog(4, option.data)
      isAddFolder.value = true
      nextTick(() => {
        addFolderDom.value.handleDialog(4, option.data)
      })
      break
    case '删除':
      console.log('删除')
      // deleteFolderDom.value.handleDialog(option.data)
      dialogVisibleDelete.value = true
      deleteData.value = option.data
      break
    case '移动至文件夹':
      dialogVisibleRemove.value = true
      removeData.value = option.data
      break
    default:
      break
  }
}
// 切换tab
const handleTabClick = (tab, event) => {
  // 获取tab的name
  if (tab.paneName) {
    analysisCardsOrTableRef.value.getData()
  }
}
// 提交成功
const updateList = (data) => {
  if (analysisCardsOrTableRef.value) {
    analysisCardsOrTableRef.value.getData()
    if (data) {
      // 有参数，更新editableTabs的name和describe
      const index = editableTabs.value.findIndex(item => item.id === data.id)
      if (index !== -1) {
        editableTabs.value[index].name = data.name
        editableTabs.value[index].describe = data.describe
      }
    }
  }
}

const updateItemName = (data) => {
  console.log('更新工程名称', data)
  if (editableTabs.value.length > 1) {
    const index = editableTabs.value.findIndex(item => item.id === data.id)
    if (index !== -1) {
      editableTabs.value[index].name = data.name
    }
  }
}

const updateListSet = (data) => {
  if (newEngineeringDom.value) {
    handleClose()
    newEngineeringDom.value.getTreeData()
  }
}

// 点击卡片事件
const handleClickCard = (data) => {
  // 判断data.id是否在tabs中已存在
  const index = editableTabs.value.findIndex(item => item.id === data.id)
  if (index === -1) {
    // 选项卡除工程库外，其他选项卡数量限制10个
    if (editableTabs.value.length < 11) {
      editableTabs.value.push({
        ...data
      })
      editableTabsValue.value = data.id
    } else {
      ElMessage.warning('最多能打开10个工程，请关闭其他工程。')
    }
  } else {
    editableTabsValue.value = data.id
  }
}
// 移除tab
const removeTab = (targetName) => {
  console.log('移除tab', targetName)
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.id === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.id
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter((tab) => tab.id !== targetName)
}

const deleteId = (data) => {
  const processNode = (node) => {
    // 如果当前节点有 ID，调用 removeTab
    if (node.id) {
      console.log('删除数据', node.id)
      removeTab(node.id)
    }
    // 如果当前节点有 children，递归处理
    if (Array.isArray(node.children)) {
      node.children.forEach(processNode)
    }
  }
  processNode(data)
}

// 查看数据集
const viewDataBase = (data) => {
  console.log('查看数据集', data)
  curDataSetId.value = data?.dataSetId
  projectActiveDataBaseId.value = data?.id
  isShowDataSet.value = true
}
const handleJumpObj = (obj) => {
  console.log('跳转目标', obj)
  if (obj.type === 1) {
    analysisStore.setData(obj?.children || [])
    analysisStore.setPid(obj?.id || 0)
    analysisStore.setLevel(obj?.level || 0)
  }
  analysisCardsOrTableRef.value.jumpObj(obj)
}
const handleClose = () => {
  isAddFolder.value = false
  isAddSet.value = false
}
</script>
<style scoped lang="scss">
.engineering-library-home {
  display: flex;
  height: 100%;
  .home-init {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    :deep(.topTabs) {
      height: 48px;
      border-left: 1px solid #f3f3f3;
      &.not-home {
        display: flex;
        flex-direction: column;
        height: 100%;
        .el-tab-pane {
          height: 100%;
        }
      }
      &.morethan9 {
        &>.el-tabs__header {
          .el-tabs__nav {
            .el-tabs__item {
              max-width: calc((100% - 120px) / 10);
            }
          }
        }
      }
      &>.el-tabs__header {
        height: 48px;
        border: none;
        background-color: var(--theme-card);
        .el-tabs__nav {
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 0;
          transform: initial !important;
          .el-tabs__item {
            box-sizing: border-box;
            max-width: 174px;
            height: 100%;
            padding-left: 24px !important;
            padding-right: 0 !important;
            border: none;
            font-weight: normal;
            color: var(--theme-text);
            &:first-child {
              width: 120px;
              font-weight: 500;
              font-size: 16px;
              .label-container {
                box-sizing: initial;
                .span-title {
                  margin-right: 0 !important;
                }
              }
            }
            &.is-active {
              background-color: rgba(54, 112, 248, 0.05);
            }
            .label-container {
              display: flex;
              align-items: center;
              box-sizing: border-box;
              width: 100%;
              height: 23px;
              padding-right: 20px;
              border-right: 1px solid #e8e8e8;
              .span-title {
                overflow: hidden;
                flex: 1;
                margin-right: 6px;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .icon-dankuang-shanchu {
                padding: 4px;
                font-size: 9px;
                color: var(--theme-text-3);
              }
            }
            .icon-gongchengku {
              margin-right: 8px;
              cursor: pointer;
              font-size: 16px;
              color: var(--theme-primary);
            }
            img {
              width: 18px;
              margin-right: 6px;
            }
            .is-icon-close {
              display: none;
            }
          }
        }
      }
      .el-tabs__header {
        margin-bottom: 0;
        .el-tabs__nav-wrap {
          height: 100%;
          margin-bottom: 0;
          padding: 0 !important;
          .el-tabs__nav-prev,
          .el-tabs__nav-next {
            display: none;
          }
          .el-tabs__nav-scroll {
            height: 100%;
          }
        }
      }
      .el-tabs__content {
        flex: 1;
        height: 0;
      }
    }
    .home-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      height: 0;
      padding: 16px;
    }
  }
}
</style>
