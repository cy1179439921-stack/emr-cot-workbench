<template>
  <div class="addIP-dialogDIV">
    <el-dialog :title="title" v-model="showDialog" class="userDialog" :width="pxToRem(786)" :before-close="handleClose" :append-to-body="true">
      <header class="searchTop">
        <commonInput type="text" class="searchInput" v-model="searchText" placeholder="输入关键词，如姓名或工号" clearable/>
      </header>
      <div class="content">
        <el-scrollbar>
          <commonTable :height="pxToRem(500)" class="singleTable dialogEmptyTable" :row-key="getRowKey" @selection-change="handleSelectionChange" :data="filteredData" @row-click="handleRowClick">
            <el-table-column width="70" align="center">
              <template #default="scope">
                <el-radio :label="scope.row.id" v-model="selectedRowId">
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="姓名">
              <template #default="scope">
                {{ scope.row.userName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="departmentName" label="科室">
              <template #default="scope">
                {{ scope.row.departmentName || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="agencyName" label="医院">
              <template #default="scope">
                {{ scope.row.agencyName || '-' }}
              </template>
            </el-table-column>
          </commonTable>
        </el-scrollbar>
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
import { getUserSelectList } from '@/api/api_scientific.js'
const showDialog = ref(false)
const tableData = ref([])
const selectedRowId = ref()
const searchText = ref('')
const open = () => {
  showDialog.value = true
}
open()
const title = ref('请选择参与人')

// 请求页面列表
const getData = async() => {
  const res = await getUserSelectList()
  if (res.code === 10000) {
    tableData.value = res.data
  }
}

// 过滤表格数据
const filteredData = computed(() => {
  if (tableData.value.length > 0) {
    const searchTerm = searchText.value.trim()
    return tableData.value.filter(row => row.department?.includes(searchTerm) || row.userName?.includes(searchTerm) || row.agencyName?.includes(searchTerm))
  } else {
    return []
  }
})
// 加载时请求页面列表
getData()

const emit = defineEmits(['handle-close', 'handle-edit', 'handle-sure'])
// 搜索后表格勾选不取消
const getRowKey = (row) => {
  return row.id
}
// 选中行变化时触发的方法
const handleSelectionChange = (selection) => {
  if (selection.length > 0) {
    selectedRowId.value = selection[0].id
  } else {
    selectedRowId.value = null
  }
}
// 处理行点击事件
const handleRowClick = (row) => {
  selectedRowId.value = row.id
  // if (selectedRowId.value === row.id) {
  //   selectedRowId.value = null
  // } else {
  //   selectedRowId.value = row.id
  // }
}

// 提交表单
const submitForm = async () => {
  if (selectedRowId.value === null) {
    ElMessage.warning('请选择人员')
  }
  // 定位到selectedRowId所在的row对象
  const row = filteredData.value.find(item => item.id === selectedRowId.value)
  console.log('row', row)
  emit('handle-sure', row)
  // const params = {
  //   queueId: researchStore.curResearchQueueDetail.id,
  //   userIds: selectedRowId.value
  // }
  // const res = await addParticipantsData(params)
  // if (res.code === 10000) {
  //   showDialog.value = false
  //   ElMessage.success('已新增')
  //   emit('handle-sure')
  // }
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
    .el-dialog__body {
      .searchTop {
        display: flex;
        justify-content: space-between;
        width: 100%;
        margin-bottom: 21px;
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
          width: 100%;
        }
      }
      .content {
        .el-table {
          height: 432px;
          tbody :empty:not(span)::before {
            color: #000;
            content: '-';
          }
          .cell {
            .el-radio {
              .el-radio__label {
                display: none;
              }
            }
          }
        }
      }
    }
  }
}
</style>
