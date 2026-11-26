<template>
  <div class="cot-annotation-page">
    <!-- 查询条件 -->
    <div class="filter-card cot-filter-card">
      <div class="card-header">
        <span class="card-title">查询条件</span>
      </div>
      <div class="filter-form-wrap">
        <el-form
          ref="filterFormRef"
          class="filter-form"
          :inline="true"
          :model="searchInfo"
          @submit.prevent
        >
          <el-form-item label="文件ID">
            <el-input v-model="searchInfo.fileId" placeholder="请填写内容" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item label="病历ID">
            <el-input v-model="searchInfo.recordId" placeholder="请填写内容" clearable @keyup.enter="onSearch" />
          </el-form-item>
          <el-form-item label="病历状态">
            <el-select v-model="searchInfo.cotStatus" clearable placeholder="请选择一项">
              <el-option
                v-for="item in COT_RECORD_STATUS_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始标注时间">
            <el-date-picker
              v-model="searchInfo.annotateStartRange"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledAfterNow"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
              :disabled-seconds="disabledSeconds"
            />
          </el-form-item>
          <el-form-item label="结束标注时间">
            <el-date-picker
              v-model="searchInfo.annotateEndRange"
              type="datetimerange"
              format="YYYY-MM-DD HH:mm:ss"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabled-date="disabledAfterNow"
              :disabled-hours="disabledHours"
              :disabled-minutes="disabledMinutes"
              :disabled-seconds="disabledSeconds"
            />
          </el-form-item>
        </el-form>
        <div class="btnDiv">
          <el-button @click="onReset">重置条件</el-button>
          <el-button type="primary" @click="onSearch">查 询</el-button>
        </div>
      </div>
    </div>

    <!-- 病历列表 -->
    <div v-loading="loading" class="list-card cot-list-card">
      <div class="card-header">
        <span class="card-title">病历列表</span>
        <el-button type="primary" @click="onStartAnnotation" v-if="!needCheckPermission || hadPermissionList.includes('编辑')">开始标注</el-button>
      </div>
      <CommonTable class="singleTable" :data="tableData" row-key="recordId">
        <el-table-column prop="taskId" label="任务ID" min-width="190" />
        <el-table-column prop="recordId" label="文件ID" min-width="190" />
        <el-table-column prop="documentId" label="病历ID" min-width="120" />
        <el-table-column prop="departmentName" label="科室" min-width="120" />
        <el-table-column prop="cotStatus" label="病历状态" min-width="110">
          <template #default="{ row }">
            <el-tag :type="COT_RECORD_STATUS_TAG[row.cotStatus] || 'info'" size="small">{{ COT_RECORD_STATUS_LABEL[row.cotStatus] || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始标注时间" min-width="170">
          <template #default="{ row }">
            <span>{{ formatEmpty(row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束标注时间" min-width="170">
          <template #default="{ row }">
            <span>{{ formatEmpty(row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewCotRecord(row)">查看</el-button>
          </template>
        </el-table-column>
      </CommonTable>
      <div class="tabel_pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="limit"
          :total="total"
          layout="slot, total, prev, pager, next, sizes, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default { name: 'CotAnnotationPage' }
</script>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import router from '@/router'
import { loadPendingRecords } from '@/api/api_cot.js'
import { getPagePermission } from '@/hooks/permissionHooks'
import { ensureAnnotateTime } from '@/utils/annotateTime'
import {
  DEMO_TASKS,
  COT_RECORD_STATUS_OPTIONS,
  COT_RECORD_STATUS_TAG,
  COT_RECORD_STATUS_LABEL,
  COT_RECORD_STATUS_SORT,
  toCotRecordStatus
} from '@/mock/proofreadDemo'
const { needCheckPermission, hadPermissionList } = getPagePermission('/medicalRecordProofreading')

// 查询条件（cotStatus 为空字符串表示全部）
const searchInfo = ref({
  fileId: '', // 文件ID（对应 recordId）
  recordId: '', // 病历ID（对应 documentId）
  cotStatus: '', // COT 病历状态：0-未完成 1-标注中 2-待审核 3-审核通过 4-审核未通过
  annotateStartRange: [],
  annotateEndRange: []
})

// 当前页码
const currentPage = ref(1)
// 每页条数
const limit = ref(20)
// 总条数
const total = ref(0)
// 列表加载态
const loading = ref(false)

// 表格数据
const tableData = ref([])

// ===================== 时间选择限制（禁止选当前时间之后） =====================
// 禁用「当前时间」之后的日期与时间：未来日期整体不可选；当日仅可选当前时刻之前
function disabledAfterNow(date) {
  return date.getTime() > Date.now()
}

// 仅当所选日期为「今天」时才限制时分秒，过去日期不受限制
function disabledHours(role, comparingDate) {
  if (!comparingDate || !comparingDate.isSame(dayjs(), 'day')) return []
  const hour = dayjs().hour()
  const arr = []
  for (let h = hour + 1; h < 24; h++) arr.push(h)
  return arr
}

function disabledMinutes(hour, role, comparingDate) {
  if (!comparingDate || !comparingDate.isSame(dayjs(), 'day')) return []
  const now = dayjs()
  const arr = []
  if (hour > now.hour()) {
    for (let m = 0; m < 60; m++) arr.push(m)
  } else if (hour === now.hour()) {
    for (let m = now.minute() + 1; m < 60; m++) arr.push(m)
  }
  return arr
}

function disabledSeconds(hour, minute, role, comparingDate) {
  if (!comparingDate || !comparingDate.isSame(dayjs(), 'day')) return []
  const now = dayjs()
  const arr = []
  if (hour > now.hour() || (hour === now.hour() && minute > now.minute())) {
    for (let s = 0; s < 60; s++) arr.push(s)
  } else if (hour === now.hour() && minute === now.minute()) {
    for (let s = now.second() + 1; s < 60; s++) arr.push(s)
  }
  return arr
}

// ===================== Mock 数据（参考病历池 DEMO_TASKS） =====================
// 将病历池的 DEMO_TASKS 展平为 COT 标注列表行，
// 通过 toCotRecordStatus 将文件状态映射为 COT 病历状态
const buildMockCotRecords = () => DEMO_TASKS.flatMap(task =>
  task.records.map(record => {
    const cotStatus = toCotRecordStatus(record.proofreadStatus)
    return {
      taskId: task.id,
      recordId: record.id,
      documentId: record.documentId,
      departmentName: record.departmentName,
      proofreadStatus: record.proofreadStatus,
      cotStatus,
      rejectReason: record.rejectReason || '',
      startTime: record.proofreadStartTime || record.createTime,
      endTime: record.proofreadStatus >= 5 ? (record.reviewStartTime !== '-' ? record.reviewStartTime : record.createTime) : '-'
    }
  })
)

// 对 mock 数据应用本地筛选（与查询条件保持一致）
function filterMockRecords(records) {
  const { fileId, recordId, cotStatus, annotateStartRange, annotateEndRange } = searchInfo.value
  const [startBegin, startEnd] = annotateStartRange || []
  const [endBegin, endEnd] = annotateEndRange || []
  return records.filter(item => {
    if (fileId && !String(item.recordId).toLowerCase().includes(String(fileId).toLowerCase())) return false
    if (recordId && !String(item.documentId).toLowerCase().includes(String(recordId).toLowerCase())) return false
    if (cotStatus !== '' && Number(item.cotStatus) !== Number(cotStatus)) return false
    if (startBegin && (!item.startTime || item.startTime < startBegin)) return false
    if (startEnd && (!item.startTime || item.startTime > startEnd)) return false
    if (endBegin && (!item.endTime || item.endTime === '-' || item.endTime < endBegin)) return false
    if (endEnd && (!item.endTime || item.endTime === '-' || item.endTime > endEnd)) return false
    return true
  })
}

// 加载 COT 标注列表数据（demo 模式，纯 mock 数据，不调后端接口）
// 列表按状态顺序展示：标注中 > 未完成 > 审核未通过 > 待审核 > 审核通过
async function onSearch() {
  loading.value = true
  try {
    const filtered = filterMockRecords(buildMockCotRecords())
    filtered.sort((a, b) => (COT_RECORD_STATUS_SORT[a.cotStatus] ?? 99) - (COT_RECORD_STATUS_SORT[b.cotStatus] ?? 99))
    tableData.value = filtered
    total.value = tableData.value.length
  } finally {
    loading.value = false
  }
}

function viewCotRecord(row) {
  // demo 模式：所有病历均为 mock 数据，传 demo=1 让详情页直接走 initDemoData，不调后端接口
  router.push({
    name: 'viewProofreadMedical',
    query: { recordId: row.recordId, demo: '1', backTo: '/medicalRecordProofreading' }
  })
}

// 重置查询条件并刷新
function onReset() {
  searchInfo.value = {
    fileId: '',
    recordId: '',
    cotStatus: '',
    annotateStartRange: [],
    annotateEndRange: []
  }
  currentPage.value = 1
  onSearch()
}

// 翻页
function handleCurrentChange(value) {
  currentPage.value = value
  onSearch()
}

// 切换每页条数后回到第一页并刷新
function handleSizeChange() {
  currentPage.value = 1
  onSearch()
}

// 跳转至标注页
async function onStartAnnotation() {
  // 不在可标注时段内时先提醒，避免进去后发现无法操作
  if (!ensureAnnotateTime()) return
  try {
    const data = await loadPendingRecords()
    if (data.code === 10000 && data.data?.recordId && data.data?.userAllocateId) {
      router.push({ name: 'cotAnnotation' })
    }
  } catch (e) {
    // demo 模式：接口不可用时静默处理
  }
}

// 空值显示占位符 '-'
function formatEmpty(value) {
  return value || '-'
}

onMounted(() => {
  onSearch()
})
</script>

<style lang="scss" scoped>
.cot-annotation-page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: var(--theme-bg)#f5f7fa;
}

.filter-card,
.list-card {
  box-sizing: border-box;
  padding: 0 24px;
  border-radius: 8px;
  background: var(--theme-card);
}

.cot-filter-card {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.cot-list-card {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;

  .card-title {
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }
}

.filter-form-wrap {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding-bottom: 24px;

  .filter-form {
    flex: 1;
    min-width: 0;

    :deep(.el-form-item) {
      width: 22%;
      margin-right: 32px;
      margin-bottom: 16px;

      .el-form-item__label {
        padding-right: 12px;
        font-size: 14px;
        color: var(--theme-text);
      }

      .el-form-item__content {
        width: 220px;

        .el-date-editor {
          width: 100%;
        }
      }
    }
  }

  .btnDiv {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 24px;
    margin-top: 2px;

    .el-button {
      &:nth-child(2) {
        margin-left: 14px;
      }
    }
  }
}

.singleTable {
  flex: 1;
  min-height: 0;
}

.tabel_pagination {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

:deep(.el-table__cell .cell) {
  min-height: 43px;
  line-height: 22px;
}

// 审核未通过原因在列表中的展示
.reject-reason {
  margin-left: 6px;
  color: #f56c6c;
  font-size: 12px;
}
</style>
