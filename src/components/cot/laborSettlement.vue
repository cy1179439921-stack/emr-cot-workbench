<template>
  <div class="labor-settlement warmTheme">
    <template v-if="!detailVisible">
      <!-- 温暖开场 + 结算流程说明 -->
      <div class="warmCard introCard">
        <div class="introMain">
          <h2 class="introTitle">每一份标注，都会被认真结算</h2>
          <p class="introDesc">任务确认完成后，结算会沿着下面的流程自动流转，进度在列表里随时可见，不用反复催问。</p>
          <div class="introChips">
            <span class="introChip"><i class="iconfont icon-shijian"></i>提交后一般 7 个工作日内到款</span>
            <span class="introChip"><i class="iconfont icon-xianshangxuexi"></i>结算明细随时可查</span>
          </div>
        </div>
        <div class="introSteps">
          <div v-for="(step, index) in flowSteps" :key="step.title" class="introStep">
            <span class="stepIndex">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="stepBody">
              <div class="stepTitle">{{ step.title }}</div>
              <div class="stepDesc">{{ step.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算列表 -->
      <div v-loading="loading" class="warmCard listCard">
        <div class="listHead">
          <div class="listHeadText">
            <h2 class="warmSectionTitle">结算列表</h2>
            <p class="listSub">共 {{ total }} 笔结算 · 点开任意一笔都能查看结算进度</p>
          </div>
        </div>

        <div class="listToolbar">
          <el-select v-model="statusFilter" clearable placeholder="全部状态" class="filterSelect">
            <el-option v-for="item in SETTLE_STATUS_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-model="keyword" class="filterInput" placeholder="搜索结算单编号 / 任务ID" clearable />
          <el-button type="primary" class="filterBtn" @click="onSearch">查询</el-button>
        </div>

        <CommonTable class="singleTable settlementTable" :data="tableData">
          <el-table-column label="结算单编号" min-width="170">
            <template #default="{ row }">
              <span class="codeCell">{{ row.settlementNo || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="任务ID" min-width="190">
            <template #default="{ row }">
              <span class="mutedCell">{{ row.allocateId || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总病历数" min-width="96" align="center">
            <template #default="{ row }">{{ row.totalCount ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="已完成" min-width="90" align="center">
            <template #default="{ row }">{{ row.completedCount ?? '-' }}</template>
          </el-table-column>
          <el-table-column label="结算状态" min-width="132">
            <template #default="{ row }">
              <span class="statusTag" :class="statusClass(row.settlementStatus)">
                <i class="dot" />{{ SETTLE_STATUSALL[row.settlementStatus] || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="150" fixed="right">
            <template #default="{ row }">
              <div class="rowActions">
                <el-button link type="primary" @click="openDetailModal(row)">查看</el-button>
                <el-button
                  v-if="row.settlementStatus === 'UNSETTLED' && (!needCheckPermission || hadPermissionList.includes('发起结算申请'))"
                  link
                  type="primary"
                  @click="openApplyModal(row)">申请结算</el-button>
                <el-button
                  v-if="row.settlementStatus === 'WAITING_EXPERT_CONFIRM' && (!needCheckPermission || hadPermissionList.includes('确认结算单'))"
                  link
                  type="primary"
                  @click="openAgreementModal(row)">通过</el-button>
                <el-button
                  v-if="row.settlementStatus === 'WAITING_EXPERT_CONFIRM' && (!needCheckPermission || hadPermissionList.includes('驳回结算单'))"
                  link
                  type="danger"
                  @click="openRejectModal(row)">驳回</el-button>
              </div>
            </template>
          </el-table-column>
        </CommonTable>

        <div class="tabel_pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="limit"
            :total="total"
            layout="slot, total, prev, pager, next, sizes, jumper"
            @current-change="onSearch"
            @size-change="onSearch"
          />
        </div>
      </div>
    </template>

    <!-- 结算单详情（全屏视图，覆盖原列表内容，显示底部操作栏） -->
    <SettlementDetailModal
      v-if="detailVisible"
      :row="detailRow"
      :show-footer="true"
      @back="closeDetailModal"
      @confirm="onDetailConfirm"
      @reject="onDetailReject"
    />

    <!-- 申请结算确认弹窗 -->
    <ApplySettlementConfirmModal v-model="applyVisible" :row="applyRow" @success="onApplySuccess" />

    <!-- 结算协议弹窗 -->
    <SettlementConfirmModal v-model="agreementVisible" :row="actionRow" @success="onAgreementSuccess" />

    <!-- 驳回弹窗 -->
    <el-dialog v-model="rejectVisible" title="驳回原因" :width="pxToRem(600)">
      <div class="reject-form">
        <label class="reject-label">
          <span class="required-mark">*</span>备注内容：
        </label>
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="7"
          maxlength="500"
          placeholder="请填写驳回原因，方便对方修改后重新提交"
        />
      </div>
      <template #footer>
        <el-button @click="rejectVisible = false">关闭</el-button>
        <el-button type="primary" :loading="rejectLoading" @click="confirmReject">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default { name: 'LaborSettlement' }
</script>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getSettlementList,
  expertRejectSettlement
} from '@/api/api_cot'
import SettlementConfirmModal from '@/components/cot/settlementConfirmModal.vue'
import SettlementDetailModal from '@/components/cot/settlementDetailModal.vue'
import ApplySettlementConfirmModal from '@/components/cot/applySettlementConfirmModal.vue'
import { SETTLE_STATUS_OPTIONS, SETTLE_STATUSALL } from '@/utils/cotEnums'
import { getPagePermission } from '@/hooks/permissionHooks'
import { SETTLEMENT_LIST } from '@/mock/demoModules'
import { withTimeout } from '@/utils/requestFallback'
const { needCheckPermission, hadPermissionList } = getPagePermission('/laborSettlement')

// 结算流程步骤说明（静态展示，前两步高亮）
const flowSteps = [
  { title: '专家发起结算', desc: '提交任务结算申请' },
  { title: '待确认', desc: '专家确认任务和金额' },
  { title: '打款中', desc: '财务处理打款' },
  { title: '已结清', desc: '补充打款信息并归档' }
]

// 状态胶囊配色：待申请/打款中=暖色，流转中=蓝色，已结清=绿色，已驳回=红色
const STATUS_TAG_CLASS = {
  UNSETTLED: 'is-warn',
  PENDING_CONFIRM: 'is-info',
  WAITING_EXPERT_CONFIRM: 'is-wait',
  WAITING_PAYMENT: 'is-warn',
  SETTLED: 'is-done',
  ARCHIVED: 'is-done',
  REJECTED: 'is-danger'
}
const statusClass = (status) => STATUS_TAG_CLASS[status] || 'is-info'

// 状态筛选（数字状态码，空字符串表示全部）
const statusFilter = ref('')
// 关键字搜索（结算单号 / 任务ID）
const keyword = ref('')
// 当前页码
const currentPage = ref(1)
// 每页条数
const limit = ref(20)
// 总条数
const total = ref(0)
// 表格数据
const tableData = ref([])
// 列表加载态
const loading = ref(false)

// 申请结算弹窗显隐
const applyVisible = ref(false)
// 申请结算弹窗当前行
const applyRow = ref(null)
// 结算单详情弹窗显隐
const detailVisible = ref(false)
// 结算单详情当前行
const detailRow = ref(null)
// 结算协议弹窗显隐
const agreementVisible = ref(false)
// 驳回弹窗显隐
const rejectVisible = ref(false)
// 驳回提交加载态
const rejectLoading = ref(false)
// 驳回原因
const rejectReason = ref('')
// 确认 / 驳回当前行
const actionRow = ref(null)

// 调用结算列表接口（返回 data，兼容详情页全量查询）
async function fetchList(params) {
  const res = await withTimeout(getSettlementList(params))
  if (res && res.code === 10000) {
    const data = res.data || {}
    // mock 模式下接口无数据：用演示数据按状态/关键字本地筛选，覆盖各结算状态
    if (!data.items || !data.items.length) {
      return buildDemoList(params)
    }
    return data
  }
  // 演示环境没有后端时接口会挂起或报错，直接回落到演示数据，避免一直转圈
  return buildDemoList(params)
}

// 演示数据 + 本地筛选
function buildDemoList(params) {
  const filtered = SETTLEMENT_LIST.filter((item) => {
    if (params.settlementStatus && item.settlementStatus !== params.settlementStatus) return false
    const keyword = String(params.search || '').trim()
    if (keyword && !`${item.settlementNo}${item.allocateId}`.includes(keyword)) return false
    return true
  })
  return { items: filtered, total: filtered.length }
}

// 查询 / 刷新结算列表
function onSearch() {
  loading.value = true
  const params = {
    settlementStatus: statusFilter.value !== '' ? statusFilter.value : undefined,
    search: keyword.value,
    pageNum: currentPage.value,
    pageSize: limit.value
  }
  fetchList(params)
    .then((data) => {
      tableData.value = data.items || []
      total.value = data.total || 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 打开申请结算弹窗
function openApplyModal(row) {
  applyRow.value = row
  applyVisible.value = true
}

// 申请结算已确认后回调：关闭详情页（如打开）并刷新列表
function onApplySuccess() {
  if (detailVisible.value) {
    detailVisible.value = false
  }
  onSearch()
}

// 打开结算协议弹窗（记录当前行）
function openAgreementModal(row) {
  actionRow.value = row
  agreementVisible.value = true
}

// 打开驳回弹窗（记录当前行，清空原因）
function openRejectModal(row) {
  actionRow.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

// 提交驳回：校验必填项 → 调用接口 → 成功后关闭驳回弹窗与结算单详情
async function confirmReject() {
  if (!actionRow.value) return
  if (!rejectReason.value || !rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因，方便对方修改后重新提交')
    return
  }
  rejectLoading.value = true
  try {
    const res = await expertRejectSettlement({
      id: actionRow.value.id,
      rejectReason: rejectReason.value.trim()
    })
    if (res.code === 10000) {
      rejectVisible.value = false
      // 若结算单详情打开则一并关闭
      if (detailVisible.value) {
        detailVisible.value = false
      }
      ElMessage.success('已驳回')
      onSearch()
    }
  } finally {
    rejectLoading.value = false
  }
}

// 打开结算单详情全屏视图
function openDetailModal(row) {
  detailRow.value = row
  detailVisible.value = true
}

// 关闭结算单详情，返回列表
function closeDetailModal() {
  detailVisible.value = false
}

// 详情页确认结算，打开结算协议弹窗
function onDetailConfirm(row) {
  actionRow.value = row
  agreementVisible.value = true
}

// 结算协议确认成功后回调：关闭详情页（如打开）并刷新列表
function onAgreementSuccess() {
  if (detailVisible.value) {
    detailVisible.value = false
  }
  onSearch()
}

// 详情页驳回结算，打开驳回弹窗
function onDetailReject(row) {
  actionRow.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

onMounted(() => {
  onSearch()
})
</script>

<style lang="scss" scoped>
.labor-settlement {
  display: flex;
  position: relative;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 16px;
  background: var(--theme-bg);
  gap: 14px;
}

/* ===================== 温暖开场 + 流程 ===================== */
.introCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  padding: 20px 22px;
  background: linear-gradient(120deg, #fffaf3 0%, #fffdfa 58%, #fdf1e3 100%);
  gap: 32px;
}

.introMain {
  flex: 0 0 320px;
  min-width: 0;
}

.introTitle {
  margin: 0;
  font-weight: 700;
  font-size: 20px;
  color: var(--theme-text);
  letter-spacing: 0.2px;
}

.introDesc {
  margin: 10px 0 0;
  line-height: 22px;
  font-size: 13px;
  color: var(--theme-text-2);
}

.introChips {
  display: flex;
  flex-wrap: wrap;
  margin-top: 14px;
  gap: 8px;
}

.introChip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(201, 118, 47, 0.1);
  font-size: 12px;
  color: var(--theme-primary);
  gap: 6px;

  .iconfont {
    font-size: 13px;
  }
}

.introSteps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  gap: 12px;
}

.introStep {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  background: var(--theme-card);
  gap: 10px;
}

.stepIndex {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 9px;
  background: var(--theme-primary-soft);
  line-height: 26px;
  text-align: center;
  font-weight: 700;
  font-size: 13px;
  color: var(--theme-primary);
}

.stepBody {
  min-width: 0;
}

.stepTitle {
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 14px;
  color: var(--theme-text);
  white-space: nowrap;
}

.stepDesc {
  line-height: 18px;
  font-size: 12px;
  color: var(--theme-text-3);
}

/* ===================== 结算列表 ===================== */
.listCard {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 20px 22px 18px;
  gap: 14px;
}

.listHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
  gap: 16px;
}

.listHeadText {
  min-width: 0;
}

.listSub {
  margin: 6px 0 0;
  font-size: 12.5px;
  color: var(--theme-text-3);
}

/* 筛选行：单独一行，和标题拉开，不再挤在标题右侧 */
.listToolbar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--theme-border);
  gap: 12px;

  .filterSelect {
    width: 138px;
  }

  .filterInput {
    width: 240px;
  }

  .filterBtn {
    height: 32px;
    padding: 0 18px;
    border-radius: 8px;
    font-size: 13px;
  }
}

.tableMain,
:deep(.el-table) {
  flex: 1;
  min-height: 0;
}

.settlementTable {
  :deep(.el-table__header th.el-table__cell) {
    height: 44px;
    border-bottom: 1px solid var(--theme-border);
    background: var(--theme-fill);
    font-weight: 500;
    font-size: 13px;
    color: var(--theme-text-2);
  }

  :deep(.el-table__body td.el-table__cell) {
    height: 52px;
    border-bottom: 1px solid var(--theme-border);
    font-size: 13.5px;
    color: var(--theme-text-2);
  }

  :deep(.el-table__body tr:hover > td.el-table__cell) {
    background: var(--theme-primary-soft);
  }

  :deep(.el-table__inner-wrapper::before) {
    display: none;
  }
}

.codeCell {
  font-weight: 500;
  color: var(--theme-text);
}

.mutedCell {
  font-size: 13px;
  color: var(--theme-text-3);
  font-variant-numeric: tabular-nums;
}

/* 状态胶囊 */
.statusTag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 12.5px;
  gap: 6px;

  .dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentcolor;
  }

  &.is-warn {
    border-color: rgba(224, 138, 30, .3);
    background: rgba(224, 138, 30, .1);
    color: var(--theme-warning);
  }

  &.is-info {
    border-color: var(--theme-primary-border);
    background: var(--theme-primary-soft);
    color: var(--theme-primary);
  }

  &.is-wait {
    border-color: rgba(123, 97, 255, .25);
    background: rgba(123, 97, 255, .09);
    color: #6a56d8;
  }

  &.is-done {
    border-color: rgba(4, 162, 115, .28);
    background: var(--theme-success-soft);
    color: var(--theme-success);
  }

  &.is-danger {
    border-color: rgba(255, 78, 78, .28);
    background: var(--theme-danger-soft);
    color: var(--theme-danger);
  }
}

.rowActions {
  display: flex;
  align-items: center;
  gap: 14px;

  :deep(.el-button) {
    margin: 0;
    padding: 0;
    font-size: 13px;
  }
}

// .singleTable {
//   flex: 1;
//   width: 100%;
//   min-height: 0;
// }

// :deep(.el-table__header-wrapper .el-table__header th.el-table__cell) {
//   height: 54px;
//   padding: 0;
//   background: #5571df0d;
//   font-weight: 400;
//   font-size: 16px;
//   color: #000;
// }

// :deep(.el-table__body-wrapper .el-table__body .el-table__cell) {
//   height: 54px;
//   padding: 0;
//   font-size: 16px;
//   color: var(--theme-text-2);
// }

.tabel_pagination {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  padding: 16px 0 0;
}
:deep(.el-overlay-dialog .el-dialog .el-dialog__header) {
  padding-bottom: 10px !important;
  .el-dialog__title {
    font-size: 18px;
  }
}
:deep(.settlement-confirm-overlay) {
  .el-dialog__title {
    font-size: 20px !important;
  }
}

/* ===================== 驳回弹窗 ===================== */
.reject-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0;
}

.reject-label {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
}

.required-mark {
  margin-right: 4px;
  font-size: 16px;
  color: var(--theme-danger);
}
</style>
