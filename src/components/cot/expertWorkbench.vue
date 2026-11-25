<template>
  <div class="homePage warmTheme">
    <!-- ============ 入驻审核未通过：引导页 ============ -->
    <div v-if="!onboardApproved" class="guideWrap">
      <section class="guideHero warmCard">
        <div class="guideHeroText">
          <p class="guideHello">{{ greeting }}，{{ displayName }}</p>
          <h1 class="guideTitle">{{ guideTitle }}</h1>
          <p class="guideDesc">{{ guideDesc }}</p>
          <div class="guideActions">
            <el-button type="primary" class="guideBtn" @click="goApply">{{ guideBtnText }}</el-button>
            <span class="guideMeta">{{ guideMetaText }}</span>
          </div>
        </div>
        <div class="guideIllustration" aria-hidden="true">
          <div class="ring ring1" />
          <div class="ring ring2" />
          <div class="ring ring3" />
          <div class="badgeCard">
            <i class="iconfont icon-guanfangrenzheng"></i>
            <span>专家认证</span>
          </div>
        </div>
      </section>

      <section class="guideSteps">
        <div v-for="(item, index) in guideSteps" :key="item.title" class="stepCard warmCard">
          <span class="stepIndex">{{ String(index + 1).padStart(2, '0') }}</span>
          <h3 class="stepTitle">{{ item.title }}</h3>
          <p class="stepDesc">{{ item.desc }}</p>
        </div>
      </section>

      <div class="guideBottom">
        <section class="guideNotes warmCard">
          <h2 class="warmSectionTitle">准备好这些材料，一次就能过</h2>
          <ul class="noteList">
            <li v-for="item in prepareList" :key="item">
              <i class="iconfont icon-duihao1"></i>
              <span>{{ item }}</span>
            </li>
          </ul>
        </section>

        <section class="guideFaq warmCard">
          <h2 class="warmSectionTitle">常见问题</h2>
          <ul class="faqList">
            <li v-for="item in faqList" :key="item.q">
              <p class="faqQ">{{ item.q }}</p>
              <p class="faqA">{{ item.a }}</p>
            </li>
          </ul>
        </section>
      </div>

      <section class="guideAssure">
        <i class="iconfont icon-anquan1"></i>
        <span>资料仅用于资质审核，我们会逐项人工核对，不会外泄；审核期间可以随时回来补充材料。</span>
      </section>
    </div>

    <!-- ============ 已通过审核：正常首页 ============ -->
    <template v-else>
      <!-- 问候语：整行通栏，左右两栏从同一水平线开始，保证上下对齐 -->
      <div class="wbGreeting">
        <h2 class="wbGreetingTitle">{{ greeting }}，{{ displayName }}</h2>
        <p class="wbGreetingTip">{{ greetingTip }}</p>
      </div>

      <div class="wbLayout">
        <div class="wbMain">
          <!-- 待办工作：按清单展示，每项后面跟对应的操作入口 -->
          <section class="panel todoPanel">
            <header class="panelHead">
              <h2 class="warmSectionTitle">待办工作</h2>
              <span class="panelMeta">按清单逐项处理，状态会实时更新</span>
            </header>

            <ul class="todoList">
              <li v-for="item in todoList" :key="item.key" class="todoItem">
                <span class="todoIcon" :class="'is-' + item.type">
                  <i class="iconfont" :class="item.icon" />
                </span>
                <div class="todoText">
                  <p class="todoTitle">
                    <b>{{ item.count }}</b>{{ item.unit }}{{ item.label }}
                  </p>
                  <p class="todoSub">{{ item.desc }}</p>
                </div>
                <el-button
                  class="todoAction"
                  :class="'is-' + item.type"
                  :type="item.primary ? 'primary' : 'default'"
                  :disabled="item.count === 0"
                  @click="item.onClick">
                  {{ item.action }}
                </el-button>
              </li>
            </ul>
          </section>

          <!-- 当前任务 + 培训规范（规范收窄放右侧，当前任务不再占满整行） -->
          <div class="taskRow">
            <section class="panel taskCard">
              <header class="taskHead">
                <h2 class="warmSectionTitle">当前任务</h2>
                <span class="taskId">任务ID：{{ progressTaskId || '-' }}</span>
              </header>
              <div class="taskBody">
                <div class="taskProgress">
                  <div class="taskProgressTop">
                    <span class="taskProgressLabel">当前专家标注任务的完成进度</span>
                    <strong class="taskProgressNum">{{ progressDone }}<em>/{{ progressTotal }}</em></strong>
                  </div>
                  <div class="taskTrack">
                    <div class="taskFill" :style="{ width: progressPercent + '%' }" />
                  </div>
                  <div class="taskStats">
                    <div class="taskStat"><b>{{ progressTotal }}</b><span>总病例</span></div>
                    <div class="taskStat"><b class="isDone">{{ progressDone }}</b><span>已完成</span></div>
                    <div class="taskStat"><b class="isRest">{{ Math.max(progressTotal - progressDone, 0) }}</b><span>剩余</span></div>
                    <div class="taskStat taskStat--today"><b class="isToday">{{ progressToday }}</b><span>今日已完成</span></div>
                  </div>
                </div>
                <el-button
                  type="primary"
                  class="taskBtn"
                  :disabled="progressTotal === 0 || progressDone === progressTotal"
                  @click="goAnnotation">
                  继续标注
                </el-button>
              </div>
            </section>

            <section class="panel trainCard">
              <span class="bannerTag"><i class="iconfont icon-xianshangxuexi"></i>标注必看</span>
              <h2 class="trainTitle">标注培训与操作规范</h2>
              <p class="trainSub">先看规范再动手，能少走很多返工路。</p>
              <div class="trainMeta">
                <span><i class="iconfont icon-wenjian" />图文手册</span>
                <span><i class="iconfont icon-shijian" />约 5 分钟</span>
              </div>
              <el-button type="primary" class="trainBtn" @click="openTrainingPdf">立即查看</el-button>
              <img class="trainImg" :src="textImg" alt="" />
            </section>
          </div>

          <!-- 历史任务 -->
          <section v-loading="loading" class="panel historyPanel">
            <header class="historyHead">
              <h2 class="warmSectionTitle">历史任务</h2>
              <div class="statusTabs">
                <span
                  v-for="tab in statusTabs"
                  :key="tab.key"
                  class="statusTab"
                  :class="{ 'is-active': activeStatus === tab.key }"
                  @click="activeStatus = tab.key">
                  {{ tab.label }}<em v-if="tab.key === 'ALL'">({{ total }})</em>
                </span>
              </div>
            </header>

            <EmptyState
              v-if="!isContractSigned && historyList.length === 0"
              class="empty-state--fullscreen"
              :type="2"
              desc="完成劳务签署后就可以开始标注了"
              @action="handleAction"
            />
            <template v-else-if="historyList.length > 0">
              <CommonTable class="singleTable historyTable" :data="filteredHistory">
                <el-table-column prop="allocateId" label="任务 ID" min-width="190" />
                <el-table-column prop="totalCount" label="总病例数" min-width="90" />
                <el-table-column prop="completedCount" label="完成病例总数" min-width="100" />
                <el-table-column label="结算状态" min-width="110">
                  <template #default="{ row }">
                    <span class="status-dot" :style="{ backgroundColor: STATUS_DOT_COLOR[row.settlementStatus] }" />
                    <span class="status-text">{{ SETTLE_STATUSALL[row.settlementStatus] }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="结算时间" min-width="120">
                  <template #default="{ row }">
                    <span>{{ row.transferTime || '-' }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" min-width="90" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" @click="onAction(row)" v-if="getActionText(row.settlementStatus)">{{ getActionText(row.settlementStatus) }}</el-button>
                  </template>
                </el-table-column>
              </CommonTable>
              <div class="tabel_pagination">
                <el-pagination
                  v-model:current-page="currentPage"
                  :page-size="limit"
                  :total="total"
                  layout="slot, total, prev, pager, next, sizes, jumper"
                  @current-change="fetchHistory"
                  @size-change="fetchHistory"
                />
              </div>
            </template>
            <EmptyState v-else desc="暂时没有分配任务，有新任务会第一时间通知您" />
          </section>
        </div>

        <aside class="wbSide">
          <!-- 个人中心 -->
          <section class="panel profileCard">
            <h2 class="warmSectionTitle">个人中心</h2>
            <div class="profileRow">
              <el-avatar :size="46" class="profileAvatar">{{ displayName.slice(0, 1) }}</el-avatar>
              <div class="profileMeta">
                <div class="profileName">
                  {{ displayName }}
                  <span class="verifyTag"><i class="iconfont icon-guanfangrenzheng" />已认证</span>
                </div>
                <p class="profileSub">{{ profileSubText }}</p>
              </div>
            </div>
            <div class="profileStats">
              <div class="pStat">
                <span class="pStatLabel">历史累计病例</span>
                <strong class="pStatNum">{{ historyCaseTotal }}<em>例</em></strong>
              </div>
              <div class="pStat">
                <span class="pStatLabel">待结算</span>
                <strong class="pStatNum isWarn">{{ pendingCaseTotal }}<em>例</em></strong>
              </div>
            </div>
            <div class="settleBar">
              <i class="seg isPending" :style="{ flex: pendingRatio }" />
              <i class="seg isConfirm" :style="{ flex: confirmRatio }" />
              <i class="seg isDone" :style="{ flex: doneRatio }" />
            </div>
            <div class="settleLegend">
              <span><i class="dot isPending" />待结算</span>
              <span><i class="dot isConfirm" />待确认</span>
              <span><i class="dot isDone" />已结算</span>
            </div>
            <el-button class="settleLink" link type="primary" @click="goSettlement">去结算中心 →</el-button>
          </section>

          <!-- 消息列表 -->
          <section class="panel msgCard">
            <header class="sideHead">
              <h2 class="warmSectionTitle">消息列表</h2>
              <span class="sideMore" @click="openMessages">全部消息 →</span>
            </header>
            <ul class="msgList">
              <li v-for="item in messageList" :key="item.id" class="msgItem" @click="handleMessage(item)">
                <span class="msgIcon" :class="'is-' + item.type"><i class="iconfont" :class="item.icon" /></span>
                <div class="msgBody">
                  <p class="msgTitle">【{{ item.title }}】</p>
                  <p class="msgDesc">{{ item.desc }}</p>
                </div>
                <span class="msgTime">{{ item.time }}</span>
              </li>
            </ul>
          </section>
        </aside>
      </div>

    </template>

    <!-- 结算单详情（全屏视图） -->
    <SettlementDetailModal
      v-if="detailVisible"
      :row="detailRow"
      :show-footer="false"
      @back="closeDetailModal"
    />
  </div>
</template>

<script>
export default { name: 'ExpertWorkbench' }
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getExpertProgress, getExpertHistoryTasks } from '@/api/api_cot'
import { SETTLE_STATUSALL } from '@/utils/cotEnums'
import EmptyState from '@/components/common/emptyState.vue'
import SettlementDetailModal from '@/components/cot/settlementDetailModal.vue'
import { loadPendingRecords } from '@/api/api_cot.js'
import { captureShareCode } from '@/utils/shareCode'
import { useUserStore } from '@/store/user'
import { DEMO_USER } from '@/mock/demoUser'
import textImg from '@/assets/textImg.png'
import { WORKBENCH_PROGRESS, WORKBENCH_HISTORY, WORKBENCH_IN_PROGRESS } from '@/mock/demoModules'
import { onboardingState, ONBOARDING_STATUS, ONBOARDING_STATUS_TEXT } from '@/utils/onboarding'
import { getGreeting, getGreetingTip } from '@/utils/greeting'

const router = useRouter()
const userStore = useUserStore()

// 入驻审核状态
const onboardApproved = computed(() => onboardingState.status === ONBOARDING_STATUS.APPROVED)
const onboardingStatus = computed(() => onboardingState.status)
// 问候语按当前时段切换（首页横幅上方 / 未入驻引导页顶部共用）
const greeting = computed(() => getGreeting())
const greetingTip = computed(() => getGreetingTip())

const displayName = computed(() => {
  const name = userStore.username || ''
  // 演示登录写的是「演示账号 · 全模块」这类名字，展示时回落到演示专家姓名
  return name && !name.startsWith('演示账号') ? name : DEMO_USER.userName
})

// ============ 引导页文案（按申请状态区分） ============
const guideTitle = computed(() => {
  if (onboardingStatus.value === ONBOARDING_STATUS.PENDING) return '资料已提交，正在审核中'
  if (onboardingStatus.value === ONBOARDING_STATUS.REJECTED) return '这次没通过，补充材料后再试一次'
  return '先完成专家认证，就可以开始接任务了'
})
const guideDesc = computed(() => {
  if (onboardingStatus.value === ONBOARDING_STATUS.PENDING) {
    return `申请单号 ${onboardingState.applyNo}，${onboardingState.submittedAt} 提交。审核结果会通过消息通知您，通常 1-2 个工作日。`
  }
  if (onboardingStatus.value === ONBOARDING_STATUS.REJECTED) {
    return `驳回原因：${onboardingState.rejectReason || '管理员未填写驳回原因'}。按提示补齐材料后重新提交即可，之前的资料都还在。`
  }
  return '认证只需要填一份申请表，通过后即可查看并接取标注任务、参与劳务结算。资料我们逐项人工核对，不会外泄。'
})
const guideBtnText = computed(() => {
  if (onboardingStatus.value === ONBOARDING_STATUS.PENDING) return '查看已提交的资料'
  if (onboardingStatus.value === ONBOARDING_STATUS.REJECTED) return '补充材料并重新提交'
  return '开始填写入驻申请'
})
const guideMetaText = computed(() => `当前状态：${ONBOARDING_STATUS_TEXT[onboardingStatus.value] || '未提交'}`)

const guideSteps = [
  { title: '填写资料', desc: '身份信息、医师资质、简历，约 5 分钟填完，中途可以离开' },
  { title: '人工审核', desc: '审核老师会核对证件与资质，通常 1-2 个工作日给出结果' },
  { title: '开始接任务', desc: '通过后回到首页即可看到分配的病历，按 N1-N5 五步标注' }
]

const faqList = [
  { q: '审核大概要多久？', a: '通常 1-2 个工作日，结果会通过站内消息通知，不用一直刷新。' },
  { q: '材料暂时不齐怎么办？', a: '可以先「暂存」，下次进来接着填；补齐后再提交审核即可。' },
  { q: '必须有高级职称吗？', a: '不用。执业证书在有效期内即可，职称证书按实际等级上传。' }
]

const prepareList = [
  '身份证正反面照片，能看清姓名与证件号',
  '医师执业证书照片，正反面合并上传',
  '职称等级证书照片，无高职称可上传初级医师证',
  '一份个人简历，PDF 或 Word 都可以'
]

// ============ 工作台数据 ============
const progressTaskId = ref('')
const progressDone = ref(0)
const progressTotal = ref(0)
const progressToday = ref(0)
const historyList = ref([])

const currentPage = ref(1)
const limit = ref(20)
const total = ref(0)
const loading = ref(false)
const contractStatus = ref('')
const isContractSigned = computed(() => contractStatus.value === 'SIGNED')
const detailVisible = ref(false)
const detailRow = ref(null)

const STATUS_DOT_COLOR = {
  UNSETTLED: 'var(--theme-warning)',
  PENDING_CONFIRM: 'var(--theme-primary)',
  WAITING_EXPERT_CONFIRM: 'var(--theme-text-3)',
  WAITING_PAYMENT: 'var(--theme-text-3)',
  SETTLED: 'var(--theme-success)',
  ARCHIVED: 'var(--theme-success)',
  REJECTED: 'var(--theme-danger)'
}

// ============ 历史任务状态筛选 ============
const STATUS_TABS = [
  { key: 'ALL', label: '全部' },
  { key: 'UNSETTLED', label: '待申请' },
  { key: 'PENDING_CONFIRM', label: '已申请' },
  { key: 'WAITING_EXPERT_CONFIRM', label: '待确认' },
  { key: 'WAITING_PAYMENT', label: '待打款' },
  { key: 'SETTLED', label: '已结清' },
  { key: 'REJECTED', label: '已驳回' }
]
const activeStatus = ref('ALL')

// 已结清包含归档
const matchStatus = (row, key) => {
  if (key === 'ALL') return true
  if (key === 'SETTLED') return ['SETTLED', 'ARCHIVED'].includes(row.settlementStatus)
  return row.settlementStatus === key
}

const statusTabs = computed(() => STATUS_TABS.map((tab) => ({
  ...tab,
  count: tab.key === 'ALL' ? total.value : historyList.value.filter((row) => matchStatus(row, tab.key)).length
})))
const filteredHistory = computed(() => historyList.value.filter((row) => matchStatus(row, activeStatus.value)))

// ============ 待办工作：签署协议 → 完成标注 → 申请结算 ============
// 演示环境统一按 35 元/例估算任务金额，真实环境由结算单给出
const UNIT_PRICE = 35
const settleTasks = computed(() => historyList.value.filter((row) => row.settlementStatus === 'UNSETTLED'))
const settleAmountText = computed(() => {
  const total = settleTasks.value.reduce((sum, row) => sum + (Number(row.completedCount) || 0) * UNIT_PRICE, 0)
  return total.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

// 待办清单：病历待标注 / 任务待结算 / 结算单待确认
const pendingCaseCount = computed(() => Math.max(progressTotal.value - progressDone.value, 0))
const confirmTasks = computed(() => historyList.value.filter((row) => row.settlementStatus === 'WAITING_EXPERT_CONFIRM'))

const todoList = computed(() => [
  {
    key: 'annotate',
    type: 'task',
    icon: 'icon-renwujindu',
    count: pendingCaseCount.value,
    unit: ' 份',
    label: '病历待标注',
    desc: pendingCaseCount.value
      ? '当前批次还没标注完，完成后会自动进入复核'
      : '当前批次的病历已全部标注完成',
    action: '去标注',
    primary: true,
    onClick: goAnnotation
  },
  {
    key: 'settle',
    type: 'settle',
    icon: 'icon-jiesuan',
    count: settleTasks.value.length,
    unit: ' 个',
    label: '任务待结算',
    desc: settleTasks.value.length
      ? `已完成任务可申请结算，合计约 ¥${settleAmountText.value}，支持一次申请多个`
      : '暂无待申请结算的任务',
    action: '去结算',
    primary: false,
    onClick: goSettlement
  },
  {
    key: 'confirm',
    type: 'confirm',
    icon: 'icon-jiesuandan',
    count: confirmTasks.value.length,
    unit: ' 份',
    label: '结算单待确认',
    desc: confirmTasks.value.length
      ? '确认结算金额后进入打款流程'
      : '暂无待确认的结算单',
    action: '去确认',
    primary: false,
    onClick: goSettlement
  }
])

// ============ 个人中心 / 结算概览 ============
const pendingStatusList = ['UNSETTLED', 'PENDING_CONFIRM', 'WAITING_EXPERT_CONFIRM']
const sumCompleted = (list) => list.reduce((sum, row) => sum + (Number(row.completedCount) || 0), 0)
const historyCaseTotal = computed(() => sumCompleted(historyList.value))
const pendingCaseTotal = computed(() => sumCompleted(historyList.value.filter((row) => pendingStatusList.includes(row.settlementStatus))))
const confirmCaseTotal = computed(() => sumCompleted(historyList.value.filter((row) => row.settlementStatus === 'WAITING_PAYMENT')))
const doneCaseTotal = computed(() => sumCompleted(historyList.value.filter((row) => ['SETTLED', 'ARCHIVED'].includes(row.settlementStatus))))
const settleTotalCases = computed(() => pendingCaseTotal.value + confirmCaseTotal.value + doneCaseTotal.value)
// 分段条按占比给 flex，全为 0 时均分，避免出现空白条
const ratioOf = (value) => (settleTotalCases.value ? value / settleTotalCases.value : 1)
const pendingRatio = computed(() => ratioOf(pendingCaseTotal.value))
const confirmRatio = computed(() => ratioOf(confirmCaseTotal.value))
const doneRatio = computed(() => ratioOf(doneCaseTotal.value))

// 职称 / 科室 / 医院：优先取入驻申请里填的，演示环境回落到演示账号
const profileSubText = computed(() => [
  onboardingState.form?.titleLevel || '主治医师',
  onboardingState.form?.departmentCategory || DEMO_USER.department,
  onboardingState.form?.hospitalName || DEMO_USER.agencyName
].filter(Boolean).join(' · '))

// ============ 消息列表（演示数据） ============
const messageList = ref([
  { id: 'm1', type: 'task', icon: 'icon-renwujindu', title: '任务分配', desc: '有新的标注任务分配给您，请前往标注管理查看。', time: '10:24', routeName: 'medicalRecordPool' },
  { id: 'm2', type: 'settle', icon: 'icon-jiesuan', title: '结算提醒', desc: '有一笔结算单待您确认，确认后进入打款流程。', time: '昨天', routeName: 'laborSettlement' },
  { id: 'm3', type: 'sign', icon: 'icon-laowujiesuan', title: '签署通知', desc: '劳务协议已发起，请完成在线签署。', time: '昨天', routeName: 'laborSign' },
  { id: 'm4', type: 'task', icon: 'icon-tishi-wancheng', title: '审核结果', desc: '您提交的标注已通过审核，辛苦了。', time: '11-24', routeName: '' }
])

function goSettlement() {
  router.push({ name: 'laborSettlement' })
}

function openMessages() {
  ElMessage.info('消息中心正在建设中，后续会在这里汇总全部通知')
}

function handleMessage(item) {
  if (!item.routeName) {
    ElMessage.info('这条消息已处理，无更多操作')
    return
  }
  router.push({ name: item.routeName })
}

const progressPercent = computed(() =>
  progressTotal.value ? Math.round((progressDone.value / progressTotal.value) * 100) : 0
)

function handleAction() {
  router.push({ name: 'laborSign' })
}

function goApply() {
  router.push({ name: 'onboardingAudit' })
}

// 标注培训手册（PDF）：新开浏览器标签页预览
// 演示环境要求入口带 ?sharecode=，新窗口同样带上，避免被网关拦成「链接不完整」
const TRAINING_PDF = 'docs/annotation-training-manual.pdf'
function openTrainingPdf() {
  const shareCode = captureShareCode()
  const query = shareCode ? `?sharecode=${encodeURIComponent(shareCode)}` : ''
  const url = `${import.meta.env.BASE_URL}${TRAINING_PDF}${query}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

function getActionText(status) {
  if (status === 'UNSETTLED') return '去结算'
  if (status === 'WAITING_EXPERT_CONFIRM') return '去确认'
  if (['SETTLED', 'WAITING_PAYMENT', 'ARCHIVED'].includes(status)) return '查看'
  return ''
}

async function fetchProgress() {
  const res = await getExpertProgress({})
  const data = (res.code === 10000 && res.data) || WORKBENCH_PROGRESS
  contractStatus.value = data.contractStatus || ''
  progressTaskId.value = data?.latestBatchProgress?.allocateId || ''
  progressDone.value = data?.latestBatchProgress?.completedTaskCount || 0
  progressTotal.value = data?.latestBatchProgress?.totalTaskCount || 0
  progressToday.value = data.todayCompletedCount || 0
}

async function fetchHistory() {
  loading.value = true
  try {
    const res = await getExpertHistoryTasks({
      pageNum: currentPage.value,
      pageSize: limit.value
    })
    const items = res.code === 10000 ? res.data?.items : null
    if (items && items.length) {
      historyList.value = items
      total.value = res.data?.total || items.length
    } else {
      historyList.value = WORKBENCH_HISTORY
      total.value = WORKBENCH_HISTORY.length
    }
  } finally {
    loading.value = false
  }
}

function goRecord(row, annotate) {
  const query = { recordId: row.id, demo: '1', backTo: '/expertWorkbench' }
  if (!annotate) query.readonly = '1'
  router.push({ name: 'viewProofreadMedical', query })
}

async function goAnnotation() {
  const target = WORKBENCH_IN_PROGRESS
  if (target) {
    goRecord(target, true)
    return
  }
  const data = await loadPendingRecords()
  if (data.code === 10000 && data.data?.recordId && data.data?.userAllocateId) {
    router.push({ name: 'cotAnnotation1' })
  }
}

function openDetailModal(row) {
  detailRow.value = row
  detailVisible.value = true
}

function closeDetailModal() {
  detailVisible.value = false
}

function onAction(row) {
  if (['UNSETTLED', 'WAITING_EXPERT_CONFIRM'].includes(row.settlementStatus)) {
    router.push({ name: 'laborSettlement' })
  } else {
    openDetailModal(row)
  }
}

onMounted(() => {
  if (!onboardApproved.value) return
  fetchProgress()
  fetchHistory()
})
</script>

<style lang="scss" scoped>
.homePage {
  overflow-y: auto;
  box-sizing: border-box;
  height: 100%;
  padding: 20px 24px 36px;
}

/* ===================== 引导页 ===================== */
.guideBottom {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 16px;
}

.guideFaq {
  .faqList {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
  }

  li {
    padding: 12px 0;
    border-top: 1px solid var(--theme-border);

    &:first-child {
      padding-top: 0;
      border-top: none;
    }
  }

  .faqQ {
    margin: 0 0 4px;
    font-weight: 600;
    font-size: 14px;
    color: var(--theme-text);
  }

  .faqA {
    margin: 0;
    line-height: 20px;
    font-size: 13px;
    color: var(--theme-text-2);
  }
}

.guideAssure {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 1px dashed var(--theme-border);
  border-radius: 10px;
  background: var(--theme-fill);
  font-size: 12.5px;
  color: var(--theme-text-3);
  gap: 8px;

  .iconfont {
    flex: none;
    font-size: 14px;
    color: var(--theme-success);
  }
}

@media (max-width: 1180px) {
  .guideBottom {
    grid-template-columns: minmax(0, 1fr);
  }
}

.guideWrap {
  display: flex;
  flex-direction: column;
  max-width: 1180px;
  margin: 0 auto;
  gap: 16px;
}

.guideHero {
  display: flex;
  overflow: hidden;
  position: relative;
  justify-content: space-between;
  align-items: center;
  padding: 40px 44px;
  background: linear-gradient(120deg, var(--theme-card) 0%, var(--theme-primary-soft) 52%, var(--theme-card) 100%);
}

.guideHeroText {
  position: relative;
  z-index: 2;
  max-width: 660px;
}

.guideHello {
  margin: 0 0 10px;
  font-size: 15px;
  color: var(--theme-text-3);
}

.guideTitle {
  margin: 0 0 14px;
  line-height: 38px;
  font-weight: 700;
  font-size: 26px;
  color: var(--theme-text);
}

.guideDesc {
  margin: 0 0 24px;
  line-height: 27px;
  font-size: 15px;
  color: var(--theme-text-2);
}

.guideActions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.guideBtn {
  height: 44px;
  padding: 0 26px;
  font-size: 16px;
}

.guideMeta {
  font-size: 13px;
  color: var(--theme-text-3);
}

.guideIllustration {
  position: relative;
  flex: none;
  width: 240px;
  height: 200px;
}

.ring {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--theme-primary-rgb), 0.35) 0%, rgba(var(--theme-primary-rgb), 0) 70%);
}

.ring1 {
  right: -40px;
  top: -60px;
  width: 220px;
  height: 220px;
}

.ring2 {
  right: 30px;
  bottom: -70px;
  width: 180px;
  height: 180px;
}

.ring3 {
  right: 90px;
  top: 20px;
  width: 120px;
  height: 120px;
}

.badgeCard {
  display: flex;
  position: absolute;
  right: 40px;
  top: 56px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 132px;
  height: 132px;
  border: 1px solid var(--theme-primary-border);
  border-radius: 24px;
  background: var(--theme-card);
  box-shadow: 0 12px 28px var(--theme-shadow-hover);
  gap: 8px;

  i {
    font-size: 34px;
    color: var(--theme-primary);
  }

  span {
    font-weight: 600;
    font-size: 13px;
    color: var(--theme-text-2);
  }
}

.guideSteps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.stepCard {
  padding: 22px 24px;
}

.stepIndex {
  display: inline-block;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 26px;
  color: var(--theme-primary-border);
}

.stepTitle {
  margin: 0 0 8px;
  font-weight: 600;
  font-size: 17px;
  color: var(--theme-text);
}

.stepDesc {
  margin: 0;
  line-height: 24px;
  font-size: 14px;
  color: var(--theme-text-2);
}

.guideNotes {
  padding: 24px 26px;
}

.noteList {
  display: grid;
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px 24px;

  li {
    display: flex;
    align-items: flex-start;
    line-height: 24px;
    font-size: 14px;
    color: var(--theme-text-2);

    i {
      margin-right: 8px;
      font-size: 14px;
      color: var(--theme-success);
    }
  }
}

/* ===================== 问候面板 ===================== */
.helloPanel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 26px 30px;
  background: linear-gradient(120deg, var(--theme-card) 0%, var(--theme-card) 60%, var(--theme-card) 100%);
}

.helloGreeting {
  margin: 0 0 8px;
  font-weight: 700;
  font-size: 22px;
  color: var(--theme-text);
}

.helloSub {
  margin: 0 0 18px;
  line-height: 24px;
  font-size: 14px;
  color: var(--theme-text-2);
}

.helloActions {
  display: flex;
  gap: 12px;
}

.primaryBtn {
  height: 40px;
  padding: 0 22px;
  font-size: 15px;
}

.ghostBtn {
  height: 40px;
  padding: 0 20px;
  border-color: var(--theme-primary-border);
  background: var(--theme-card);
  font-size: 15px;
  color: var(--theme-text-2);
}

.helloStats {
  display: flex;
  align-items: center;
  flex: none;
  padding: 0 8px;
  gap: 22px;
}

.statBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 96px;
  gap: 6px;
}

.statNum {
  font-weight: 700;
  font-size: 30px;
  color: var(--theme-primary);

  em {
    font-style: normal;
    font-size: 16px;
    color: var(--theme-text-3);
  }
}

.statName {
  font-size: 13px;
  color: var(--theme-text-3);
}

.statDivider {
  width: 1px;
  height: 34px;
  background: var(--theme-primary-border);
}

/* ===================== 培训条 ===================== */
.trainingBar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 14px 22px;
  border: 1px dashed var(--theme-primary-border);
  border-radius: 14px;
  background: var(--theme-card);
}

.trainingText {
  display: flex;
  align-items: center;
  gap: 10px;

  i {
    font-size: 16px;
    color: var(--theme-primary);
  }
}

.trainingTitle {
  font-weight: 600;
  font-size: 15px;
  color: var(--theme-text);
}

.trainingSub {
  font-size: 13px;
  color: var(--theme-text-3);
}

.trainingBtn {
  height: 34px;
  padding: 0 18px;
  border-color: var(--theme-primary-border);
  font-size: 14px;
  color: var(--theme-primary);
}

/* ===================== 通用面板 ===================== */
.panel {
  display: flex;
  flex-direction: column;
  padding: 20px 22px;
  gap: 16px;
}

.panelHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 26px;
  gap: 12px;
}

.panelMeta {
  font-size: 12.5px;
  color: var(--theme-text-3);
}

.panelTip {
  font-size: 13px;
  color: var(--theme-text-3);
}

.progressHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progressTask {
  font-size: 14px;
  color: var(--theme-text-2);
}

.progressBody {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 14px;
  background: var(--theme-card);
  gap: 20px;
}

.progressLeft {
  flex: 1;
}

.progressRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progressLabel {
  font-size: 15px;
  color: var(--theme-text-2);
}

.progressValue {
  font-weight: 700;
  font-size: 28px;
  color: var(--theme-primary);

  span {
    font-size: 16px;
    color: var(--theme-text-3);
  }
}

.progressTrack {
  overflow: hidden;
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: var(--theme-primary-border);
}

.progressBar {
  height: 100%;
  border-radius: 5px;
  background: linear-gradient(90deg, var(--theme-primary-border), var(--theme-primary));
  transition: width 0.3s;
}

.progressHint {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--theme-text-3);
}

.progressRight {
  flex: none;
  width: 56px;
}

.progressImg {
  width: 100%;
}

.statusPill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 12px;
  background: var(--theme-border);
  font-size: 12px;
  color: var(--theme-text-2);

  &.is-1 {
    background: var(--theme-border);
    color: var(--theme-text-2);
  }

  &.is-2 {
    background: var(--theme-primary-soft);
    color: var(--theme-warning);
  }

  &.is-3 {
    background: var(--theme-success-soft);
    color: var(--theme-success);
  }
}

.countText {
  font-size: 13px;
  color: var(--theme-text-2);
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 8px;
  border-radius: 50%;
  vertical-align: middle;
}

.status-text {
  vertical-align: middle;
  color: var(--theme-text-2);
}

.empty-state--fullscreen {
  flex: 1;
  width: 100%;
}

.tabel_pagination {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  padding: 4px 0 0;
}

/* ===================== 工作台：新版三栏版式 ===================== */
.wbGreeting {
  margin: 0 0 16px;
  padding: 0;
}

.wbGreetingTitle {
  margin: 0;
  font-weight: 700;
  font-size: 20px;
  color: var(--theme-text);
}

.wbGreetingTip {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--theme-text-3);
}

.wbLayout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 16px;
}

.wbMain,
.wbSide {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 16px;
}

/* 待办工作：清单式 */
.todoPanel {
  border: 1px solid var(--theme-border);
  background: var(--theme-card);
}

.todoList {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.todoItem {
  display: flex;
  align-items: center;
  padding: 13px 0;
  border-top: 1px solid var(--theme-border);
  gap: 14px;

  &:first-child {
    padding-top: 0;
    border-top: none;
  }

  &:last-child {
    padding-bottom: 0;
  }
}

.todoIcon {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--theme-primary-soft);
  font-size: 17px;
  color: var(--theme-primary);

  &.is-settle {
    background: rgba(224, 138, 30, 0.12);
    color: var(--theme-warning);
  }

  &.is-confirm {
    background: var(--theme-success-soft);
    color: var(--theme-success);
  }
}

.todoText {
  flex: 1;
  min-width: 0;
}

.todoTitle {
  display: flex;
  align-items: baseline;
  margin: 0;
  font-size: 14px;
  color: var(--theme-text);
  gap: 3px;

  b {
    font-weight: 700;
    font-size: 20px;
    line-height: 1;
    color: var(--theme-primary);
    font-variant-numeric: tabular-nums;
  }
}

.todoSub {
  overflow: hidden;
  margin: 5px 0 0;
  text-overflow: ellipsis;
  font-size: 12.5px;
  color: var(--theme-text-3);
  white-space: nowrap;
}

.todoAction {
  flex: none;
  min-width: 92px;
  height: 34px;
  border-radius: 8px;
  font-size: 13px;

  &.is-settle:not(.el-button--primary) {
    border-color: rgba(224, 138, 30, 0.45);
    color: var(--theme-warning);
  }

  &.is-confirm:not(.el-button--primary) {
    border-color: rgba(4, 162, 115, 0.4);
    color: var(--theme-success);
  }
}

/* 标注培训与操作规范：收窄放右侧 */
.trainCard {
  position: relative;
  overflow: hidden;
  justify-content: flex-start;
  border: 1px solid var(--theme-border);
  background: linear-gradient(150deg, var(--theme-primary-soft) 0%, var(--theme-fill) 100%);
}

.bannerTag {
  display: inline-flex;
  position: absolute;
  top: 18px;
  right: 18px;
  align-items: center;
  height: 22px;
  padding: 0 9px;
  border-radius: 4px;
  background: #ffab2e;
  font-weight: 600;
  font-size: 11.5px;
  color: #fff;
  gap: 4px;

  .iconfont {
    font-size: 12px;
  }
}

.trainTitle {
  position: relative;
  z-index: 1;
  margin: 0;
  min-height: 26px;
  padding-right: 76px;
  font-weight: 700;
  font-size: 18px;
  color: var(--theme-primary);
}

.trainSub {
  position: relative;
  z-index: 1;
  margin: 0;
  line-height: 19px;
  font-size: 12.5px;
  color: var(--theme-text-2);
}

.trainMeta {
  display: flex;
  position: relative;
  z-index: 1;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--theme-text-3);
  gap: 12px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .iconfont {
    font-size: 12px;
  }
}

.trainBtn {
  position: relative;
  z-index: 1;
  align-self: flex-start;
  height: 30px;
  margin-top: 2px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
}

.trainImg {
  position: absolute;
  right: -8px;
  bottom: -12px;
  height: 96px;
  opacity: 0.22;
  pointer-events: none;
}

/* 当前任务 + 培训规范并排：当前任务收窄，规范占右侧窄列 */
.taskRow {
  display: grid;
  align-items: stretch;
  grid-template-columns: minmax(0, 1.85fr) minmax(210px, 1fr);
  gap: 16px;
}

// 每个区域给不同底色 + 描边，靠框架区分模块
.taskCard {
  border: 1px solid var(--theme-primary-border);
  background: var(--theme-primary-soft);
}

.historyPanel {
  border: 1px solid var(--theme-border);
  background: var(--theme-card);
}

.profileCard {
  border: 1px solid var(--theme-border);
  background: var(--theme-card);
}

.msgCard {
  border: 1px solid var(--theme-border);
  background: var(--theme-fill);
}

.taskHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 26px;
  gap: 12px;
}

.taskId {
  font-size: 12px;
  color: var(--theme-text-3);
}

.taskBody {
  display: flex;
  align-items: center;
  gap: 18px;
}

.taskProgress {
  flex: 1;
  min-width: 0;
}

.taskProgressTop {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.taskProgressLabel {
  font-size: 13px;
  color: var(--theme-text-2);
}

.taskProgressNum {
  font-weight: 700;
  font-size: 22px;
  color: var(--theme-text);

  em {
    margin-left: 2px;
    font-style: normal;
    font-size: 14px;
    color: var(--theme-text-3);
  }
}

.taskTrack {
  overflow: hidden;
  height: 8px;
  margin: 10px 0 16px;
  border-radius: 4px;
  background: var(--theme-primary-soft);
}

.taskFill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--theme-primary), var(--theme-primary-light));
  transition: width 0.3s;
}

.taskStats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 26px;
}

.taskStat {
  display: flex;
  flex-direction: column;
  gap: 2px;

  b {
    font-weight: 700;
    font-size: 20px;
    color: var(--theme-text);

    &.isDone {
      color: var(--theme-primary);
    }

    &.isRest {
      color: var(--theme-warning);
    }

    &.isToday {
      color: var(--theme-success);
    }
  }

  span {
    font-size: 12px;
    color: var(--theme-text-3);
  }
}

.taskBtn {
  flex: none;
  height: 36px;
  padding: 0 20px;
  border-radius: 6px;
}

/* 历史任务 */
.historyHead {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  min-height: 26px;
  gap: 12px;
}

.statusTabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.statusTab {
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--theme-text-2);
  transition: all 0.2s;

  em {
    margin-left: 2px;
    font-style: normal;
    font-size: 12px;
    color: var(--theme-text-3);
  }

  &:hover {
    background: var(--theme-fill);
  }

  &.is-active {
    background: var(--theme-primary);
    color: #fff;

    em {
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

/* 右侧：个人中心 */
.profileRow {
  display: flex;
  align-items: center;
  margin: 16px 0;
  gap: 10px;
}

.profileAvatar {
  flex: none;
  background: var(--theme-primary-soft);
  font-weight: 600;
  font-size: 18px;
  color: var(--theme-primary);
}

.profileName {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
  color: var(--theme-text);
  gap: 4px 6px;
}

.verifyTag {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 3px;
  background: var(--theme-success-soft);
  font-weight: 400;
  font-size: 11px;
  color: var(--theme-success);
  gap: 2px;

  .iconfont {
    font-size: 11px;
  }
}

.profileSub {
  margin: 5px 0 0;
  line-height: 18px;
  font-size: 12px;
  color: var(--theme-text-3);
}

.profileStats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.pStat {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: 10px;
  background: var(--theme-fill);
  gap: 6px;
}

.pStatLabel {
  font-size: 12px;
  color: var(--theme-text-3);
}

.pStatNum {
  font-weight: 700;
  font-size: 22px;
  color: var(--theme-text);

  em {
    margin-left: 2px;
    font-style: normal;
    font-size: 12px;
    color: var(--theme-text-3);
  }

  &.isWarn {
    color: var(--theme-warning);
  }
}

.settleBar {
  display: flex;
  overflow: hidden;
  height: 6px;
  margin: 14px 0 8px;
  border-radius: 3px;
  background: var(--theme-border);
  gap: 2px;

  .seg {
    display: block;
    min-width: 0;
  }

  .isPending {
    background: var(--theme-warning);
  }

  .isConfirm {
    background: var(--theme-primary);
  }

  .isDone {
    background: var(--theme-success);
  }
}

.settleLegend {
  display: flex;
  font-size: 11px;
  color: var(--theme-text-3);
  gap: 14px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &.isPending {
      background: var(--theme-warning);
    }

    &.isConfirm {
      background: var(--theme-primary);
    }

    &.isDone {
      background: var(--theme-success);
    }
  }
}

.settleLink {
  align-self: flex-start;
  margin-top: 10px;
  padding: 0;
  font-size: 13px;
}

/* 右侧：消息列表 */
.sideHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 26px;
  gap: 8px;
}

.sideMore {
  cursor: pointer;
  font-size: 12px;
  color: var(--theme-text-3);

  &:hover {
    color: var(--theme-primary);
  }
}

.msgList {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.msgItem {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;
  border-top: 1px solid var(--theme-border);
  cursor: pointer;
  gap: 10px;

  &:first-child {
    border-top: none;
  }

  &:hover .msgTitle {
    color: var(--theme-primary);
  }
}

.msgIcon {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--theme-primary-soft);
  color: var(--theme-primary);

  .iconfont {
    font-size: 15px;
  }

  &.is-settle {
    background: var(--theme-success-soft);
    color: var(--theme-success);
  }

  &.is-sign {
    background: var(--theme-primary-soft);
    color: var(--theme-primary);
  }
}

.msgBody {
  flex: 1;
  min-width: 0;
}

.msgTitle {
  margin: 0 0 3px;
  font-weight: 600;
  font-size: 13px;
  color: var(--theme-text);
  transition: color 0.2s;
}

.msgDesc {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  line-height: 18px;
  -webkit-line-clamp: 2;
  font-size: 12px;
  color: var(--theme-text-3);
  -webkit-box-orient: vertical;
}

.msgTime {
  flex: none;
  font-size: 11px;
  color: var(--theme-text-3);
}

/* 窄屏：引导页单列排布，避免内容被挤压看不清 */
@media (max-width: 900px) {
  .homePage {
    padding: 12px 12px 28px;
  }

  .guideHero {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 18px;
  }

  .guideIllustration {
    display: none;
  }

  .guideTitle {
    font-size: 20px;
  }

  .guideDesc {
    font-size: 13px;
  }

  .guideSteps,
  .guideBottom {
    grid-template-columns: minmax(0, 1fr);
  }

  .guideAssure {
    align-items: flex-start;
  }
}

@media (max-width: 1360px) {
  .wbLayout {
    grid-template-columns: minmax(0, 1fr);
  }

  .wbSide {
    flex-direction: row;
  }

  .wbSide > .panel {
    flex: 1;
  }
}

@media (max-width: 1180px) {
  .taskRow {
    grid-template-columns: minmax(0, 1fr);
  }

  .trainImg {
    height: 88px;
    opacity: 0.25;
  }
}

@media (max-width: 1080px) {
  .wbSide {
    flex-direction: column;
  }
}
</style>
