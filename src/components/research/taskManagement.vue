<template>
  <div class="taskManagement">
    <header class="queryPanel">
      <el-form :inline="true" :model="searchInfo" @submit.prevent>
        <el-form-item label="任务ID">
          <el-input v-model="searchInfo.taskId" clearable placeholder="请填写任务ID" @keyup.enter="loadData" />
        </el-form-item>
        <el-form-item label="分配标注人">
          <el-select v-model="searchInfo.targetUserId" clearable filterable placeholder="请选择一项" style="width: 220px">
            <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-select v-model="searchInfo.operatorId" clearable filterable placeholder="请选择一项" style="width: 220px">
            <el-option v-for="item in userOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchInfo.operationTime"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
          />
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="searchInfo.taskStatus" clearable placeholder="请选择一项" style="width: 220px" @change="handleTaskStatusChange">
            <el-option v-for="item in taskStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </header>

    <section class="tablePanel">
      <div class="tableTitle">任务列表</div>
      <el-table v-loading="loading" :data="tableData" row-key="_rowKey" height="100%">
        <el-table-column prop="id" label="任务ID" min-width="150" />
        <el-table-column label="分配标注人" min-width="150">
          <template #default="scope">{{ (scope.row.targetUserNames || []).join('、') || '-' }}</template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" min-width="120" />
        <el-table-column prop="createTime" label="操作时间" min-width="180" />
        <el-table-column label="任务状态" min-width="110">
          <template #default="scope">
            <el-tag :type="getTaskStatusConfig(scope.row.taskStatus)?.tagType || 'info'">
              {{ getTaskStatusConfig(scope.row.taskStatus)?.label || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="100">
          <template #default="scope">
            <el-button type="primary" link @click="goDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="暂无任务" /></template>
      </el-table>
      <el-pagination
        v-model:current-page="pageNum"
        :page-size="pageSize"
        layout="total, prev, pager, next"
        :total="total"
        @current-change="loadData"
        @size-change="handleSizeChange"
      />
    </section>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DEMO_TASKS, DEMO_USER_OPTIONS } from '@/mock/proofreadDemo'

const router = useRouter()

const taskStatusList = [
  { value: 0, label: '进行中', tagType: 'primary' },
  { value: 1, label: '已完成', tagType: 'success' },
  { value: 2, label: '待审核', tagType: 'warning' },
  { value: 3, label: '审核中', tagType: 'danger' }
]
const taskStatusOptions = taskStatusList
const getTaskStatusConfig = (value) => taskStatusList.find(item => item.value === value)

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
// Demo 中四种状态各提供 5 条任务，统一列表展示。
const pageSize = 20
const userOptions = ref(DEMO_USER_OPTIONS)
const searchInfo = reactive({
  taskId: '',
  targetUserId: undefined,
  operatorId: undefined,
  operationTime: [],
  taskStatus: undefined
})

const loadData = async () => {
  loading.value = true
  const currentStatus = searchInfo.taskStatus
  const [startDate, endDate] = searchInfo.operationTime || []
  tableData.value = DEMO_TASKS
    .filter(item => currentStatus === undefined || currentStatus === null || currentStatus === '' || item.taskStatus === Number(currentStatus))
    .filter(item => !searchInfo.taskId || item.id.toLowerCase().includes(String(searchInfo.taskId).toLowerCase()))
    .filter(item => !searchInfo.targetUserId || item.targetUserNames.includes(searchInfo.targetUserId))
    .filter(item => !searchInfo.operatorId || item.operatorName === searchInfo.operatorId)
    .filter(item => !startDate || item.createTime.slice(0, 10) >= startDate)
    .filter(item => !endDate || item.createTime.slice(0, 10) <= endDate)
    .map((item, index) => ({ ...item, _rowKey: `${item.id}-${index}` }))
  total.value = tableData.value.length
  loading.value = false
}

const resetSearch = () => {
  Object.assign(searchInfo, { taskId: '', targetUserId: undefined, operatorId: undefined, operationTime: [], taskStatus: undefined })
  pageNum.value = 1
  loadData()
}

const handleTaskStatusChange = (value) => {
  pageNum.value = 1
  loadData()
}

// 进入任务详情：展示该任务下的病历列表
const goDetail = (row) => {
  router.push({ name: 'taskDetail', query: { allocateId: row.id, taskStatus: row.taskStatus }})
}

const handleSizeChange = () => {
  // 保留分页组件事件兼容性。
  pageNum.value = 1
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.taskManagement { display: flex; flex-direction: column; height: 100%; }
.queryPanel, .tablePanel { padding: 20px; background: var(--theme-card); border-radius: 8px; }
.queryPanel { margin-bottom: 16px; }
.tablePanel { display: flex; flex: 1; flex-direction: column; min-height: 0; }
.tableTitle { margin-bottom: 16px; font-size: 16px; font-weight: 500; color: var(--theme-text); }
.el-table { flex: 1; }
.el-pagination { justify-content: flex-end; margin-top: 16px; }
</style>
