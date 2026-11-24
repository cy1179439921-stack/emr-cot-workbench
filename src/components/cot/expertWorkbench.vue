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

      <section class="guideNotes warmCard">
        <h2 class="warmSectionTitle">准备好这些材料，一次就能过</h2>
        <ul class="noteList">
          <li v-for="item in prepareList" :key="item">
            <i class="iconfont icon-duihao1"></i>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>
    </div>

    <!-- ============ 已通过审核：正常首页 ============ -->
    <template v-else>
      <!-- 问候 + 概览 -->
      <section class="helloPanel warmCard">
        <div class="helloLeft">
          <p class="helloGreeting">{{ greeting }}，{{ displayName }}</p>
          <p class="helloSub">{{ helloSub }}</p>
          <div class="helloActions">
            <el-button type="primary" class="primaryBtn" :disabled="progressTotal == 0 || (progressDone === progressTotal)" @click="goAnnotation">
              继续标注
            </el-button>
            <el-button class="ghostBtn" @click="openTrainingPdf">查看标注手册</el-button>
          </div>
        </div>
        <div class="helloStats">
          <div class="statBlock">
            <span class="statNum">{{ progressToday }}</span>
            <span class="statName">今日已完成</span>
          </div>
          <div class="statDivider" />
          <div class="statBlock">
            <span class="statNum">{{ progressDone }}<em>/{{ progressTotal }}</em></span>
            <span class="statName">当前任务进度</span>
          </div>
          <div class="statDivider" />
          <div class="statBlock">
            <span class="statNum">{{ recordList.length }}</span>
            <span class="statName">待处理病历</span>
          </div>
        </div>
      </section>

      <!-- 培训横幅 -->
      <section class="trainingBar">
        <div class="trainingText">
          <i class="iconfont icon-xianshangxuexi"></i>
          <span class="trainingTitle">标注培训必看</span>
          <span class="trainingSub">快速掌握标注规范、操作流程与质量要求</span>
        </div>
        <el-button class="trainingBtn" @click="openTrainingPdf">点击查看</el-button>
      </section>

      <!-- 工作进度 -->
      <section class="panel warmCard">
        <div class="progressHeader">
          <h2 class="warmSectionTitle">工作进度</h2>
          <span class="progressTask">任务 ID：{{ progressTaskId || '-' }}</span>
        </div>
        <div class="progressBody">
          <div class="progressLeft">
            <div class="progressRow">
              <span class="progressLabel">当前专家标注任务的完成进度</span>
              <strong class="progressValue">{{ progressDone }}<span>/{{ progressTotal }}</span></strong>
            </div>
            <div class="progressTrack">
              <div class="progressBar" :style="{ width: progressPercent + '%' }" />
            </div>
            <p class="progressHint">{{ progressHint }}</p>
          </div>
          <div class="progressRight">
            <img :src="textImg" alt="" class="progressImg" />
          </div>
        </div>
      </section>

      <!-- 我的任务病历 -->
      <section class="panel warmCard">
        <div class="panelHead">
          <h2 class="warmSectionTitle">我的任务病历</h2>
          <span class="panelTip">共 {{ recordList.length }} 份，其中标注中 {{ proofingCount }} 份</span>
        </div>
        <CommonTable class="singleTable" :data="recordList">
          <el-table-column prop="id" label="文件 ID" min-width="200" />
          <el-table-column prop="documentId" label="文档编号" min-width="170" />
          <el-table-column prop="departmentName" label="科室" min-width="110" />
          <el-table-column label="文件状态" min-width="110">
            <template #default="{ row }">
              <span class="statusPill" :class="'is-' + row.proofreadStatus">
                {{ FILE_STATUS_LABEL[row.proofreadStatus] || '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="annotateCount" label="标注次数" min-width="100">
            <template #default="{ row }">
              <span class="countText">{{ row.annotateCount || 0 }} / 4</span>
            </template>
          </el-table-column>
          <el-table-column prop="updateTime" label="更新时间" min-width="170" />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button
                v-if="row.proofreadStatus === 1 || row.proofreadStatus === 2"
                type="primary"
                link
                @click="goRecord(row, true)">
                继续标注
              </el-button>
              <el-button v-else type="primary" link @click="goRecord(row, false)">查看</el-button>
            </template>
          </el-table-column>
        </CommonTable>
      </section>

      <!-- 历史任务 -->
      <section v-loading="loading" class="panel warmCard">
        <div class="panelHead">
          <h2 class="warmSectionTitle">历史任务</h2>
        </div>
        <EmptyState
          v-if="!isContractSigned && historyList.length === 0"
          class="empty-state--fullscreen"
          :type="2"
          desc="完成劳务签署后就可以开始标注了"
          @action="handleAction"
        />
        <template v-else-if="historyList.length > 0">
          <CommonTable class="singleTable" :data="historyList">
            <el-table-column prop="allocateId" label="任务 ID" min-width="200" />
            <el-table-column prop="totalCount" label="总病历数" min-width="100" />
            <el-table-column prop="completedCount" label="完成病历总数" min-width="110" />
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
import { FILE_STATUS_LABEL } from '@/mock/proofreadDemo'
import { WORKBENCH_PROGRESS, WORKBENCH_HISTORY, WORKBENCH_RECORDS, WORKBENCH_IN_PROGRESS } from '@/mock/demoModules'
import { onboardingState, ONBOARDING_STATUS, ONBOARDING_STATUS_TEXT } from '@/utils/onboarding'

const router = useRouter()
const userStore = useUserStore()

// 入驻审核状态
const onboardApproved = computed(() => onboardingState.status === ONBOARDING_STATUS.APPROVED)
const onboardingStatus = computed(() => onboardingState.status)
const displayName = computed(() => {
  const name = userStore.username
  return name && name !== '演示账号' ? name : DEMO_USER.userName
})

// 问候语按当前时间切换
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 11) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
const helloSub = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 22 || hour < 6) return '今天已经辛苦了，剩下的病历明天再继续也来得及'
  return '今天也请按自己的节奏来，标注过程中有疑问随时翻看培训手册'
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
const recordList = ref(WORKBENCH_RECORDS)
const proofingCount = computed(() => recordList.value.filter(item => item.proofreadStatus === 2).length)
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

const progressPercent = computed(() =>
  progressTotal.value ? Math.round((progressDone.value / progressTotal.value) * 100) : 0
)
const progressHint = computed(() => {
  if (!progressTotal.value) return '暂时还没有分配任务，有新任务会第一时间通知您'
  if (progressDone.value >= progressTotal.value) return '这一批病历已经标注完了，感谢您的耐心'
  return `还差 ${progressTotal.value - progressDone.value} 份就完成这一批了`
})

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
  margin-top: 16px;
  padding: 22px 24px;
  gap: 16px;
}

.panelHead {
  display: flex;
  align-items: baseline;
  gap: 12px;
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
</style>
