<template>
  <div class="task-detail-wrap">
    <div class="task-detail-header">
      <el-breadcrumb :separator-icon="ArrowRight" class="task-breadcrumb">
        <el-breadcrumb-item :to="{ path: '/proofreadingManagement/taskManagement' }">任务管理</el-breadcrumb-item>
        <el-breadcrumb-item>任务详情</el-breadcrumb-item>
      </el-breadcrumb>
      <el-button class="back-btn" @click="goBack">
        <i class="iconfont icon-fanhui"></i>
        <span>返回</span>
      </el-button>
    </div>

    <!-- 任务信息卡片 -->
    <div class="task-cards">
      <div class="task-card">
        <div class="card-label">任务ID</div>
        <div class="card-value">{{ allocateId }}</div>
      </div>
      <div class="task-card">
        <div class="card-label">病历数</div>
        <div class="card-value accent">{{ recordTotal }}</div>
      </div>
      <div class="task-card">
        <div class="card-label">任务状态</div>
        <div class="card-value">
          <el-tag
            :type="taskStatusConfig.type"
            effect="light"
            round
            size="large"
          >{{ taskStatusConfig.label }}</el-tag>
        </div>
      </div>
      <div class="task-card">
        <div class="card-label">开始时间</div>
        <div class="card-value">{{ earliestTime || '-' }}</div>
      </div>
    </div>

    <div class="record-section-title">病历列表（含校对数据）</div>
    <MedicalRecordList
      :need-check-permission="needCheckPermission"
      :had-permission-list="hadPermissionList"
      :allocate-id="allocateId"
      :task-status="taskStatus"
      :hide-query-header="true"
      @data-change="onDataChange"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import MedicalRecordList from '@/components/research/medicalRecordList.vue'
import { getPagePermission } from '@/hooks/permissionHooks'

const route = useRoute()
const router = useRouter()
const { needCheckPermission, hadPermissionList } = getPagePermission('/proofreadingManagement')

// 从路由 query 获取任务 ID，用于查询该任务下的病历
const allocateId = computed(() => route.query.allocateId || '')
const taskStatus = computed(() => route.query.taskStatus ?? '')

const recordTotal = ref(0)
const earliestTime = ref('')
const recordStatuses = ref([])

const onDataChange = (payload) => {
  recordTotal.value = payload.total || 0
  earliestTime.value = payload.earliestTime || ''
  recordStatuses.value = payload.proofreadStatuses || []
}

const TASK_STATUS_OPTIONS = [
  { value: 0, label: '进行中', type: 'primary' },
  { value: 1, label: '已完成', type: 'success' },
  { value: 2, label: '待审核', type: 'warning' },
  { value: 3, label: '审核中', type: 'danger' }
]

const taskType = computed(() => {
  const queryStatus = Number(route.query.taskStatus)
  if ([0, 1, 2, 3].includes(queryStatus)) return queryStatus
  // 兜底：从病历状态反推任务状态
  const statuses = recordStatuses.value
  if (statuses.length && statuses.every(status => status === 7)) return 1 // 已完成
  if (statuses.length && statuses.every(status => status === 5)) return 2 // 待审核
  if (statuses.length && statuses.some(status => [7, 8].includes(status)) && statuses.every(status => [5, 7, 8].includes(status))) return 3 // 审核中
  return 0 // 进行中
})

const taskStatusConfig = computed(() => {
  return TASK_STATUS_OPTIONS.find(s => s.value === taskType.value) || TASK_STATUS_OPTIONS[0]
})

const goBack = () => {
  router.push({ name: 'taskManagement' })
}
</script>

<style lang="scss" scoped>
.task-detail-wrap {
  .record-section-title {
    padding: 16px 16px 0;
    background: var(--theme-bg)#f5f7fa;
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  :deep(.task-detail-header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: var(--theme-card);
    border-bottom: 1px solid #f0f0f0;

    .task-breadcrumb {
      font-size: 14px;
    }

    .back-btn {
      padding: 8px 16px;
    }
  }

  .task-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 16px;
    background: var(--theme-bg)#f5f7fa;

    .task-card {
      background: var(--theme-card);
      border-radius: 6px;
      padding: 20px 24px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

      .card-label {
        font-size: 13px;
        color: #8a909c;
        margin-bottom: 10px;
      }

      .card-value {
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
        word-break: break-all;

        &.accent {
          color: #3b82f6;
          font-size: 24px;
        }
      }
    }
  }
}
</style>
