<template>
  <div class="library-container">
    <databaseTable v-if="isShowDataSet" :projectId="projectActiveDataBaseId" :id="curDataSetId" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" @goBack="isShowDataSet = false"></databaseTable>
    <div class="data-set-library-home" v-show="!isShowDataSet">
      <analysisHeader title="数据集库" v-model:showWay="showWay" :type="1" :options="options" @header-click="handleHeaderClick" @handleJumpObj="handleJumpObj"/>
      <analysisCardsOrTable ref="analysisCardsOrTableDom" :options="options" :type="1" :showWay="showWay" :needCheckPermission="needCheckPermission" :hadPermissionList="hadPermissionList" @handleEdit="handleHeaderClick" @handleDelete="handleHeaderClick" @handleAdd="handleHeaderClick" @handleRemove="handleHeaderClick" @handleClickFolder="handleClickFolder" @viewDataBase="viewDataBase"/>
      <addFolder v-if="isAddFolder" ref="addFolderDom" @updateList="updateList" @handleClose="handleClose"></addFolder>
      <addDataSet v-if="isAddSet" ref="addDataSetDom" @updateList="updateList" @handleClose="handleClose"></addDataSet>
      <deleteFolder ref="deleteFolderDom" v-if="dialogVisibleDelete" v-model:dialogVisibleDelete="dialogVisibleDelete" @updateList="updateList" @handle-close="dialogVisibleDelete = false" :deleteData="deleteData" :type="1"></deleteFolder>
      <removeFolder ref="removeFolderDom" v-if="dialogVisibleRemove" v-model:dialogVisibleRemove="dialogVisibleRemove" @updateList="updateList" @handle-close="dialogVisibleRemove = false" :allData="allData" :removeData="removeData" :type="1"></removeFolder>
    </div>
  </div>
</template>
<script setup>
defineOptions({
  name: 'DataSetLibraryHome',
  inheritAttrs: false
})
import { nextTick, ref, onMounted } from 'vue'
import analysisHeader from '@/components/dataAnalysis/common/analysisHeader.vue'
import analysisCardsOrTable from '@/components/dataAnalysis/common/analysisCardsOrTable.vue'
// import analysisTable from '@/components/dataAnalysis/common/analysisTable.vue'
import addFolder from '../common/addFolder.vue'
import addDataSet from './addDataSet.vue'
import deleteFolder from '../common/deleteFolder.vue'
import removeFolder from '../common/removeFolder.vue'
import databaseTable from '@/components/dataAnalysis/dataSetLibrary/components/databaseTable.vue'

import { useAnalysisStore } from '@/store/analysisStore'
import { ElMessage } from 'element-plus'
import { getPagePermission } from '@/hooks/permissionHooks'
const { needCheckPermission, hadPermissionList } = getPagePermission('/dataAnalysis/dataSetLibrary')
const analysisStore = useAnalysisStore()
const options = ref([
  {
    name: '新增数据集',
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
const showWay = ref(1)
const addFolderDom = ref('')
const addDataSetDom = ref('')
const deleteFolderDom = ref('')
const removeFolderDom = ref('')
const dialogVisibleDelete = ref(false)
const dialogVisibleRemove = ref(false)
const deleteData = ref(null) // 待删除数据
const removeData = ref(null) // 待移动数据
const allData = ref(null) // 总数据
const curPageData = ref(null) // 当前页数据
const isShowDataSet = ref(false) // 是否显示数据集详情
const curDataSetId = ref('') // 当前数据集
const isAddSet = ref(false)
const isAddFolder = ref(false)
const projectActiveDataBaseId = ref('')
// 点击文件夹
const handleClickFolder = (option) => {
  // option下的allData是总数据，curPageData是当前页数据
  allData.value = option.allData
  curPageData.value = option.curPageData
  analysisStore.setData(option.curPageData?.children || [])
  analysisStore.setPid(option.curPageData?.id || 0)
  analysisStore.setLevel(option.curPageData?.level || 0)
}
// 点击选项
const handleHeaderClick = (option) => {
  switch (option.name) {
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
          addFolderDom.value.handleDialog(1)
        })
      } else {
        ElMessage.error('层级已达上限!')
      }
      break
    case '批量管理':
      console.log('批量管理')
      break
    case '编辑':
      isAddFolder.value = true
      nextTick(() => {
        addFolderDom.value.handleDialog(2, option.data)
      })
      break
    case '删除':
      console.log('删除')
      // deleteFolderDom.value.handleDialog(option.data)
      dialogVisibleDelete.value = true
      deleteData.value = option.data
      break
    case '移动至文件夹':
      // removeFolderDom.value.handleDialog(option.data)
      dialogVisibleRemove.value = true
      removeData.value = option.data
      break
    default:
      break
  }
}

const viewDataBase = (data) => {
  curDataSetId.value = data?.id
  isShowDataSet.value = true
}

const analysisCardsOrTableDom = ref('')
const updateList = () => {
  handleClose()
  analysisCardsOrTableDom.value.getData()
}
const handleJumpObj = (obj) => {
  if (obj.type === 1) {
    curPageData.value = obj
    analysisStore.setData(curPageData.value?.children || [])
    analysisStore.setPid(curPageData.value?.id || 0)
    analysisStore.setLevel(curPageData.value?.level || 0)
  }
  analysisCardsOrTableDom.value.jumpObj(obj)
}
const handleClose = () => {
  isAddFolder.value = false
  isAddSet.value = false
}

// 是否三方数据
const isThirdData = () => {
  const threeDataFileData = localStorage.getItem('threeDataFileData')
  if (threeDataFileData) {
    isAddSet.value = true
    nextTick(() => {
      addDataSetDom.value.handleDialog(true, JSON.parse(threeDataFileData))
      localStorage.removeItem('threeDataFileData')
    })
  }
}

onMounted(() => {
  isThirdData()
})

</script>
<style scoped lang="scss">
.library-container {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 100%;
}
.data-set-library-home {
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
}
</style>
