<template>
  <div class="settlement-detail-page">
    <!-- 顶部返回栏 -->
    <div class="detail-topbar">
      <div class="back-btn" @click="emit('back')">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <span class="topbar-title">结算单详情</span>
    </div>

    <div v-loading="loading" class="detail-layout">
      <!-- 左侧导航 -->
      <aside class="detail-sidebar">
        <div class="sidebar-title">结算单</div>
        <nav class="sidebar-menu">
          <a
            v-for="item in menuList"
            :key="item.key"
            :class="['menu-item', { 'is-active': activeMenu === item.key }]"
            @click="scrollToSection(item.key)"
          >
            <i class="iconfont icon-wancheng-11" :class="item.icon" />
            <span>{{ item.label }}</span>
          </a>
        </nav>
      </aside>

      <!-- 右侧内容 -->
      <main ref="contentRef" class="detail-content" @scroll="onContentScroll">
        <!-- 单据基础信息 -->
        <section id="basic" class="detail-card">
          <div class="card-header">
            <span class="section-title">单据基础信息</span>
          </div>
          <div class="card-body">
            <div class="bill-header">
              <div class="bill-icon">
                <i class="iconfont icon-jiesuandan"></i>
              </div>
              <div class="bill-meta">
                <div class="bill-row">
                  <span class="bill-label">结算单号：</span>
                  <span class="bill-value">{{ detail.settlementNo || '-' }}</span>
                  <span
                    v-if="detail.settlementStatusDesc"
                    class="status-tag"
                    :class="getStatusConfig(detail?.settlementStatus)?.dotClass"
                  >
                    {{ getStatusConfig(detail?.settlementStatus)?.label || '-' }}
                  </span>
                </div>
                <div class="bill-row sub">
                  <span class="bill-label">任务ID：</span>
                  <span class="bill-value">{{ detail.allocateId || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="info-grid grid-3">
              <div class="info-item">
                <span class="info-label">医师姓名：</span>
                <span class="info-value">{{ detail.doctorName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">医师职称：</span>
                <span class="info-value">{{ detail.doctorTitle || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">科室名称：</span>
                <span class="info-value">{{ detail.deptName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">单据生成时间：</span>
                <span class="info-value">{{ detail.createTime || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建人：</span>
                <span class="info-value">{{ detail.creator || '-' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 薪酬核算 -->
        <section id="salary" class="detail-card">
          <div class="card-header">
            <span class="section-title">薪酬核算</span>
          </div>
          <div class="card-body">
            <div class="info-grid grid-3">
              <div class="info-item">
                <span class="info-label">标注病历数：</span>
                <span class="info-value">{{ formatNumber(detail.annotationCount) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">税前合计总额：</span>
                <span class="info-value">{{ formatMoney(detail.beforeTaxAmount) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">总病历数：</span>
                <span class="info-value">{{ formatNumber(detail.totalCount) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">标注单价：</span>
                <span class="info-value">{{ formatMoney(detail.unitPrice) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 收款账户信息 -->
        <section id="receipt" class="detail-card">
          <div class="card-header">
            <span class="section-title">收款账户信息</span>
          </div>
          <div class="card-body">
            <div class="info-grid grid-3">
              <div class="info-item">
                <span class="info-label">开户人姓名：</span>
                <span class="info-value">{{ detail.accountName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">银行卡号：</span>
                <span class="info-value">{{ detail.bankNo || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">完整开户行：</span>
                <span class="info-value">{{ detail.bankBranch || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">银行预留手机号：</span>
                <span class="info-value">{{ detail.bankPhone || '-' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 打款信息：待申请结算 / 已申请结算 / 待确认结算 / 待打款 阶段不展示 -->
        <section v-if="showPaymentInfo" id="payment" class="detail-card">
          <div class="card-header">
            <span class="section-title">打款信息</span>
          </div>
          <div class="card-body">
            <div class="info-grid grid-3">
              <div class="info-item">
                <span class="info-label">银行打款流水号：</span>
                <span class="info-value">{{ detail.transferNo || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">单据归档标记：</span>
                <span class="info-value">{{ detail.isArchivedDesc || '-' }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- 底部操作栏：固定在页面底部，内容滚动时不跟随 -->
    <div v-if="showFooter" class="detail-footer">
      <el-button class="footer-btn footer-reject" v-if="(!needCheckPermission || hadPermissionList.includes('驳回结算单'))" type="danger" :disabled="!actionable" @click="onReject">驳回</el-button>
      <el-button class="footer-btn footer-confirm" v-if="(!needCheckPermission || hadPermissionList.includes('确认结算单'))" type="primary" :disabled="!actionable" @click="onConfirm">确认</el-button>
    </div>
  </div>
</template>

<script>
export default { name: 'SettlementDetailModal' }
</script>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getSettlementDetail } from '@/api/api_cot'
import { getPagePermission } from '@/hooks/permissionHooks'
import { withTimeout } from '@/utils/requestFallback'
const { needCheckPermission, hadPermissionList } = getPagePermission('/laborSettlement')

const props = defineProps({
  row: {
    type: Object,
    default: () => ({})
  },
  // 是否显示底部按钮操作栏（劳务结算: true，专家工作台: false）
  showFooter: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['back', 'confirm', 'reject'])

const loading = ref(false)
const detail = ref({})
const contentRef = ref(null)
const activeMenu = ref('basic')

// 待申请 / 已申请 / 待确认结算 / 待打款 这四个阶段还没有打款动作，不展示打款信息
const NO_PAYMENT_STATUSES = ['UNSETTLED', 'PENDING_CONFIRM', 'WAITING_EXPERT_CONFIRM', 'WAITING_PAYMENT']

const currentStatus = computed(() => detail.value.settlementStatus || props.row?.settlementStatus || '')

// 是否展示打款信息（打款流水号、归档标记）
const showPaymentInfo = computed(() => !NO_PAYMENT_STATUSES.includes(currentStatus.value))

const menuList = computed(() => {
  const list = [
    { key: 'basic', label: '单据基础信息', icon: 'icon-danjujichuxinxi' },
    { key: 'salary', label: '薪酬核算', icon: 'icon-xinchouhesuan' },
    { key: 'receipt', label: '收款账户信息', icon: 'icon-shoukuanzhanghuxinxi' }
  ]
  if (showPaymentInfo.value) {
    list.push({ key: 'payment', label: '打款信息', icon: 'icon-dakuanxinxi' })
  }
  return list
})

// 单据状态选项配置
const statusOption = [
  { label: '已申请结算', value: 'PENDING_CONFIRM', dotClass: 'statusDot1' },
  { label: '待确认结算', value: 'WAITING_EXPERT_CONFIRM', dotClass: 'statusDot2' },
  { label: '待打款', value: 'WAITING_PAYMENT', dotClass: 'statusDot2' },
  { label: '待申请结算', value: 'UNSETTLED', dotClass: 'statusDot3' },
  { label: '已结清', value: 'SETTLED', dotClass: 'statusDot4' },
  { label: '已结清', value: 'ARCHIVED', dotClass: 'statusDot4' },
  { label: '已驳回', value: 'REJECTED', dotClass: 'statusDot5' }
]
const getStatusConfig = (status) => {
  return statusOption.find(item => item.value === status)
}

const actionable = computed(() => {
  const status = detail.value.settlementStatus || props.row?.settlementStatus
  return status === 'WAITING_EXPERT_CONFIRM'
})

function formatNumber(val) {
  if (val === undefined || val === null || val === '') return '-'
  return String(val)
}

function formatMoney(val) {
  if (val === undefined || val === null || val === '') return '-'
  return `¥${Number(val).toFixed(2)}`
}

async function fetchDetail() {
  const row = props.row || {}
  // 先用列表行数据打底：接口超时或没有详情时页面也有内容，不会白屏
  detail.value = { ...row }
  if (!row.id) return
  loading.value = true
  try {
    const res = await withTimeout(getSettlementDetail({ id: row.id }))
    if (res && res.code === 10000 && res.data) {
      detail.value = { ...row, ...res.data }
    }
  } finally {
    loading.value = false
  }
}

function scrollToSection(key) {
  const el = document.getElementById(key)
  if (el && contentRef.value) {
    contentRef.value.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }
  activeMenu.value = key
}

function onContentScroll() {
  if (!contentRef.value) return
  const scrollTop = contentRef.value.scrollTop
  const sections = menuList.value.map((item) => document.getElementById(item.key))
  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i]
    if (section && section.offsetTop - 24 <= scrollTop) {
      activeMenu.value = menuList.value[i].key
      break
    }
  }
}

function onConfirm() {
  emit('confirm', detail.value.id ? detail.value : props.row)
}

function onReject() {
  emit('reject', detail.value.id ? detail.value : props.row)
}

onMounted(() => {
  detail.value = {}
  activeMenu.value = 'basic'
  fetchDetail()
  nextTick(() => {
    if (contentRef.value) contentRef.value.scrollTop = 0
  })
})
</script>

<style lang="scss" scoped>
.settlement-detail-page {
  display: flex;
  position: absolute;
  z-index: 10;
  flex-direction: column;
  box-sizing: border-box;
  background: var(--theme-bg)#f5f7fa;
  inset: 0;
}

.detail-topbar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  height: 56px;
  padding: 0 24px;
  border-bottom: 1px solid #e7edf6;
  background: var(--theme-card);
  gap: 4px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  padding-right: 14px;
  border-right: 1px solid #dcdee7;
  cursor: pointer;
  font-size: 16px;
  color: var(--theme-primary);
  gap: 4px;

  .el-icon {
    font-size: 20px;
  }

  &:hover {
    color: var(--theme-primary);
  }
}

.topbar-title {
  margin-left: 8px;
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
}

.detail-layout {
  display: flex;
  flex: 1;
  box-sizing: border-box;
  min-height: 0;
}

.detail-sidebar {
  flex-shrink: 0;
  box-sizing: border-box;
  width: 260px;
  margin: 16px 0 16px 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--theme-card);
}

.sidebar-title {
  margin-bottom: 12px;
  padding-left: 12px;
  font-weight: 500;
  font-size: 18px;
  color: var(--theme-text);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  color: var(--theme-text-2);
  transition: all 0.2s;
  gap: 8px;

  &:hover {
    background: var(--theme-bg)#f5f7fa;
    color: var(--theme-primary);
  }

  &.is-active {
    border-radius: 2px 2px 2px 2px;
    background: rgba(54, 112, 248, 0.05);
    font-weight: 500;
    color: var(--theme-primary);
  }
  i {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: rgba(4, 162, 115, 0.1);
    font-size: 10px;
    color: #04a273;
  }
}

.menu-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  line-height: 1;
  font-size: 16px;
}

.detail-content {
  display: flex;
  overflow-y: auto;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  background: var(--theme-bg)#f5f7fa;
}

.detail-card {
  box-sizing: border-box;
  padding: 24px;
  border-radius: 8px;
  background: var(--theme-card);

  & + .detail-card {
    margin-top: 16px;
  }

  &:last-child {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &:last-child .card-body {
    flex: 1;
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  position: relative;
  padding-left: 12px;
  font-weight: 500;
  font-size: 18px;
  color: var(--theme-text);

  &::before {
    position: absolute;
    left: 0;
    top: 50%;
    width: 3px;
    height: 19px;
    border-radius: 2px;
    background: var(--theme-primary);
    content: '';
    transform: translateY(-50%);
  }
}

.bill-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 1px solid #ededed;
}

.bill-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 74px;
  height: 74px;
  border-radius: 8px;
  background: var(--theme-primary-soft);
  i {
    font-size: 32px;
    color: var(--theme-primary);
  }
}

.bill-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bill-row {
  display: flex;
  align-items: center;
  gap: 12px;

  &.sub {
    .bill-label,
    .bill-value {
      font-size: 16px;
    }
  }
}

.bill-label {
  font-size: 16px;
  color: var(--theme-text);
}

.bill-value {
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
}

.status-tag {
  height: 32px;
  padding: 0 12px;
  border-radius: 2px;
  line-height: 32px;
  text-align: center;
  font-size: 16px;
}

.info-grid {
  display: grid;
  gap: 20px 16px;

  &.grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &.grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.info-item {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  line-height: 22px;
}

.info-label {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--theme-text);

  &::before {
    margin-right: 2px;
    color: #f56c6c;
    content: '*';
  }
}

.info-value {
  overflow: hidden;
  flex: 1;
  text-overflow: ellipsis;
  font-size: 16px;
  color: var(--theme-text-2);
  white-space: nowrap;
}

.detail-footer {
  display: flex;
  position: sticky;
  bottom: 0;
  z-index: 9;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 16px 24px;
  border-top: 1px solid #e7edf6;
  background: var(--theme-card);
  box-shadow: 0 -6px 16px rgba(31, 58, 105, 0.08);
  gap: 16px;
}

.footer-btn {
  height: 36px;
  padding: 0 24px;
  border-radius: 4px;
  font-size: 16px;
}

.footer-reject {
  border: 1px solid #ff3a3a !important;
  border-color: #ff3a3a;
  background-color: var(--theme-card) !important;
  color: #ff3a3a;
  &:hover {
    color: #ff3a3a;
  }
  &.is-disabled {
    border-color: rgba(255, 78, 78, 0.5) !important;
    background: var(--theme-card);
    color: rgba(255, 78, 78, 0.5) !important;
  }
}

.footer-confirm {
  border-color: var(--theme-primary);
  background: var(--theme-primary);

  &:not(.is-disabled):hover {
    border-color: #5b8dff;
    background: #5b8dff;
  }
}

/* 状态标签样式 */
.statusDot1 {
  border: 1px solid #95b4fa;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  color: var(--theme-primary);
}
.statusDot2 {
  border: 1px solid #e4e4e4;
  border-radius: 2px;
  background: var(--theme-primary-soft);
  color: var(--theme-text-2);
}
.statusDot3 {
  border: 1px solid #ffd997;
  border-radius: 2px;
  background: var(--theme-fill);
  color: #f59f0c;
}
.statusDot4 {
  border: 1px solid #7bceb6;
  border-radius: 2px;
  background: var(--theme-success-soft);
  color: #04a273;
}
.statusDot5 {
  border: 1px solid #ffa2a2;
  border-radius: 2px;
  background: var(--theme-danger-soft);
  color: #ff4e4e;
}
</style>
