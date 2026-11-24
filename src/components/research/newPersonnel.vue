<template>
  <div class="addIP-dialogDIV">
    <el-dialog :title="title" v-model="showDialog" class="addIP_Dialog" :width="pxToRem(740)" :before-close="handleClose">
      <header class="searchTop">
        <span class="title"><i></i>人员列表</span>
        <div>
          <commonInput type="text" class="searchInput" v-model="searchText" placeholder="输入关键词，如姓名或工号" clearable/>
        </div>
      </header>
      <div class="content">
        <commonTable class="singleTable dialogEmptyTable" :row-key="getRowKey" @selection-change="handleSelectionChange" :data="filteredData" >
          <el-table-column type="selection" reserve-selection="true" min-width="30" />
          <el-table-column prop="account" label="账号" min-width="105"></el-table-column>
          <el-table-column prop="userName" label="姓名"></el-table-column>
          <el-table-column prop="agencyName" label="医院"></el-table-column>
          <!-- <el-table-column prop="useraccount" label="科室"></el-table-column>
          <el-table-column prop="useraccount" label="状态"></el-table-column> -->
        </commonTable>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submitForm"> 确 定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'NewPersonnel'
}
</script>
<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { addParticipant } from '@/api/api_proofread'
import { unshiftParticipantsData } from '@/api/api_research'
import { useResearchStore } from '@/store/researchStore'
const researchStore = useResearchStore()
const showDialog = ref(false)
const tableData = ref([])
const selectedRowIds = ref([])
const searchText = ref('')
const open = () => {
  showDialog.value = true
}
open()
const title = ref('新增人员')

// 请求页面列表
const getData = async() => {
  const params = {
    batchId: researchStore.curResearchQueueDetail.id,
    pageNum: 1,
    pageSize: 10000
  }
  const res = await unshiftParticipantsData(params)
  if (res.code === 10000) {
    tableData.value = res.data.items
  }
}

// 过滤表格数据
const filteredData = computed(() => {
  if (tableData.value.length > 0) {
    const searchTerm = searchText.value.trim()
    return tableData.value.filter(row => row.account?.includes(searchTerm) || row.userName?.includes(searchTerm) || row.agencyName?.includes(searchTerm))
  } else {
    return []
  }
})
// 加载时请求页面列表
getData()

const emit = defineEmits(['handle-close', 'handle-edit', 'handle-submit'])
// 搜索后表格勾选不取消
const getRowKey = (row) => {
  return row.id
}
// 选中行变化时触发的方法
const handleSelectionChange = (selection) => {
  selectedRowIds.value = selection.map(item => item.id)
}

// 提交表单
const submitForm = async () => {
  if (selectedRowIds.value.length === 0) {
    ElMessage.warning('请选择人员')
    return
  }
  const params = {
    batchId: researchStore.curResearchQueueDetail.id,
    userIds: selectedRowIds.value
  }
  const res = await addParticipant(params)
  if (res.code === 10000) {
    showDialog.value = false
    ElMessage.success('已新增')
    emit('handle-submit')
  }
}
const handleClose = () => {
  showDialog.value = false
  emit('handle-close')
}
</script>
<style scoped lang="scss">
.addIP-dialogDIV {
  :deep(.addIP_Dialog) {
    .el-dialog__close {
      color: #91b9cd;
    }
    .el-dialog__header {
      padding-bottom: 12px !important;
    }
    .el-dialog__body {
      .searchTop {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 16px;
        .title {
          display: flex;
          align-items: center;
          font-weight: 500;
          font-size: 14px;
          color: var(--theme-text);
          i {
            display: block;
            width: 2px;
            height: 15px;
            margin-right: 7px;
            background: var(--theme-primary);
          }
        }
        .searchInput {
          width: 220px;
        }
      }
      .content {
        .el-table {
          height: 432px;
          tbody :empty:not(span)::before {
            color: #000;
            content: '-';
          }
        }
      }
    }
  }
}
</style>
