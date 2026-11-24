<template>
  <div class="labor-sign warmTheme">
    <!-- 顶部状态条：单独面板 -->
    <div class="status-bar">
      <div class="labor-status-head">
        <div class="status-item">
          <span class="status-label">签署状态：</span>
          <span class="status-value" :style="styleTag[agreementDisplayStatus]">{{ agreementDisplayStatus }}</span>
        </div>
        <div v-if="signatureTime" class="status-item status-time">
          <span class="status-label">签署时间：</span>
          <span class="status-value-text">{{ signatureTime }}</span>
        </div>
      </div>
    </div>

    <!-- 页面标题 + 两步流程：单独面板 -->
    <div class="panel stepper-card">
      <div class="stepperTitleBox">
        <h1 class="page-title">劳务签署</h1>
        <p class="page-sub">资料核对清楚，签一次就够 —— 后续的结算我们会在流程里跟进，你不用来回催。</p>
      </div>
      <div class="stepper" :class="{ 'is-agreement-phase': stepStatus >= 2 }">
        <button
          v-for="(step, index) in steps"
          :key="step.route"
          type="button"
          class="step-card"
          :class="getStepState(index)"
          @click="selectStep(step.route)"
        >
          <span class="step-number" :class="{ 'is-check': showCheckFor(index) }">
            <i v-if="showCheckFor(index)" class="iconfont icon-wancheng-11"></i>
            <template v-else>{{ String(index + 1).padStart(2, '0') }}</template>
          </span>
          <div class="step-text">
            <strong>{{ step.title }}</strong>
            <small>{{ step.desc }}</small>
          </div>
        </button>
      </div>
    </div>

    <!-- 初始化加载占位：请求未完成时在下方主内容区展示 loading，请求完成（成功/失败）后才展示实际内容 -->
    <div v-if="loading" class="labor-loading">
      <span class="loading-spinner"></span>
      <span class="loading-text">加载中…</span>
    </div>

    <!-- 页面主内容区：INITIATED/SIGNED/REJECTED/EXPIRED（待签署/已签署/已驳回/已过期）状态下步骤条可点击切换查看；其余状态沿用各步骤默认面板 -->
    <template v-if="!loading && displayTab === '资料填写'">
      <!-- 资料填写 + 操作栏：合并为一个连续面板 -->
      <div class="form-section">
        <!-- 资料填写面板 -->
        <div class="labor-form-panel">
          <div class="panel-header">
            <h2 class="panel-title">资料填写</h2>
          </div>

          <!-- 查看态 -->
          <template v-if="!isEditingMaterial">
            <section class="info-section">
              <h3 class="section-title">劳务签约基础</h3>
              <div class="info-section-body align--center">
                <div class="section-body">
                  <span class="info-label">身份证照片：</span>
                  <div class="id-photos">
                    <div class="id-photo-item">
                      <div class="id-photo">
                        <commonPreview :URL="record.idFrontFile" />
                      </div>
                      <span class="id-photo-name">人像面</span>
                    </div>
                    <div class="id-photo-item">
                      <div class="id-photo">
                        <commonPreview :URL="record.idBackFile" />
                      </div>
                      <span class="id-photo-name">国徽面</span>
                    </div>
                  </div>
                </div>
                <div class="info-row info-row-full">
                  <span class="info-label">身份证号：</span>
                  <span class="info-value">{{ record.idNumber || '-' }}</span>
                </div>
              </div>
            </section>

            <section class="info-section">
              <h3 class="section-title">劳务签约银行卡</h3>
              <div class="info-section-body">
                <div class="info-grid">
                  <div class="info-row">
                    <span class="info-label"><span class="required-star">*</span>开户人姓名：</span>
                    <span class="info-value">{{ record.accountName || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label"><span class="required-star">*</span>银行卡号：</span>
                    <span class="info-value">{{ record.bankCard || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label"><span class="required-star">*</span>开户支行：</span>
                    <span class="info-value">{{ record.bankBranch || '-' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label"><span class="required-star">*</span>预留手机号：</span>
                    <span class="info-value">{{ record.reservedPhone || '-' }}</span>
                  </div>
                </div>
              </div>
            </section>
          </template>

          <!-- 编辑态：身份证信息由接口回填，银行卡信息可编辑 -->
          <el-form v-else ref="materialFormRef" :model="materialForm" label-position="top" @submit.prevent="submitMaterial">
            <section class="info-section">
              <h3 class="section-title">劳务签约基础</h3>
              <div class="info-section-body">
                <el-form-item class="id-number-item" label="身份证号：" prop="idNumber">
                  <el-input v-model="materialForm.idNumber" disabled placeholder="身份证号" />
                </el-form-item>
                <div class="id-photo-title">身份证照片：</div>
                <div class="id-photos">
                  <div class="id-photo-item">
                    <div class="id-photo">
                      <commonPreview :URL="materialForm.idFrontFile" />
                    </div>
                    <span class="id-photo-name">人像面</span>
                  </div>
                  <div class="id-photo-item">
                    <div class="id-photo">
                      <commonPreview :URL="materialForm.idBackFile" />
                    </div>
                    <span class="id-photo-name">国徽面</span>
                  </div>
                </div>
              </div>
            </section>

            <section class="info-section">
              <h3 class="section-title">劳务签约银行卡信息</h3>
              <div class="info-section-body">
                <div class="info-grid">
                  <el-form-item prop="accountName" :rules="[{ required: true, message: '请填写开户人姓名', trigger: 'blur' }, { min: 2, message: '姓名至少 2 个字', trigger: 'blur' }]">
                    <template #label>开户人姓名：</template>
                    <el-input v-model="materialForm.accountName" placeholder="必须和身份证、注册姓名一致" />
                  </el-form-item>
                  <el-form-item prop="bankCard" :rules="[{ required: true, message: '请填写银行卡号', trigger: 'blur' }, { pattern: /^(\d{16}|\d{19})$/, message: '银行卡号应为 16 位或 19 位，请核对后填写', trigger: 'blur' }]">
                    <template #label>银行卡号：</template>
                    <el-input
                      :model-value="materialForm.bankCard"
                      maxlength="19"
                      inputmode="numeric"
                      placeholder="请填写内容"
                      @input="onCardInput"
                    />
                  </el-form-item>
                  <el-form-item prop="bankBranch" :rules="[{ required: true, message: '请填写开户支行', trigger: 'blur' }]">
                    <template #label>开户支行：</template>
                    <el-input v-model="materialForm.bankBranch" placeholder="请填写完整开户支行" />
                  </el-form-item>
                  <el-form-item prop="reservedPhone" :rules="[{ required: true, message: '请填写银行预留手机号', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号需为 11 位数字，请核对', trigger: 'blur' }]">
                    <template #label>银行预留手机号</template>
                    <el-input
                      :model-value="materialForm.reservedPhone"
                      maxlength="11"
                      inputmode="numeric"
                      placeholder="请填写内容"
                      @input="onPhoneInput"
                    />
                  </el-form-item>
                </div>
              </div>
            </section>
          </el-form>
        </div>

        <!-- 底部操作栏：紧贴资料填写面板底部，作为连续面板的一部分；仅可编辑状态或出现编辑态时展示 -->
        <div class="action-bar" v-if="canEdit || isEditingMaterial">
          <template v-if="!isEditingMaterial">
            <el-button type="primary" @click="startEdit" v-if="canEdit && (!needCheckPermission || hadPermissionList.includes('提交'))">资料填写</el-button>
          </template>
          <template v-else>
            <el-button @click="cancelEdit" :disabled="submitLoading">取消</el-button>
            <el-button type="primary" :loading="submitLoading" :disabled="submitLoading" @click="submitMaterial" v-if="!needCheckPermission || hadPermissionList.includes('提交')">提交进入下一步</el-button>
          </template>
        </div>
      </div>

    </template>

    <!-- 协议签署面板 -->
    <template v-else-if="!loading && !isPendingOrExpired">
      <div class="panel labor-contract-panel">
        <div class="panel-header">
          <h2 class="panel-title">协议签署</h2>
        </div>
        <div class="contract-card">
          <div class="contract-file">
            <img :src="pdfImg" alt="PDF" class="pdf-icon" />
            <div class="contract-info">
              <strong>{{ record.contractFile || '智脉COT专家劳务协议.pdf' }}</strong>
              <span>{{ contractStatusText }}</span>
            </div>
          </div>
          <div class="contract-actions">
            <template v-if="isAgreementSigned">
              <el-button class="view" @click="viewAgreement">
                <i class="iconfont icon-chakan"></i>
                查看
              </el-button>
              <!-- <el-button type="primary" @click="openSign">下载</el-button> -->
            </template>
            <template v-else-if="isContractRejected">
            </template>
            <template v-else>
              <el-button class="btn-sign" @click="openSign" v-if="!needCheckPermission || hadPermissionList.includes('提交')">
                <i class="iconfont icon-qianshu"></i>签署
              </el-button>
              <el-button class="btn-reject" @click="rejectVisible = true" v-if="!needCheckPermission || hadPermissionList.includes('驳回签署')">
                <i class="iconfont icon-bohui"></i>驳回
              </el-button>
            </template>
          </div>
        </div>
        <div class="contractHint">
          <i class="iconfont icon-tishi-yidongwenjianjia"></i>
          <span>签署前建议先完整读一遍协议，条款有疑问可以随时联系项目负责人，确认清楚再签。</span>
        </div>
      </div>
    </template>

    <!-- PENDING / EXPIRED：空状态覆盖协议签署区域 -->
    <template v-else-if="!loading">
      <EmptyState
        :desc="emptyStateDesc"
        class="labor-sign-empty"
      />
    </template>

    <!-- 驳回原因弹窗 -->
    <el-dialog
      v-model="rejectVisible"
      title="驳回原因"
      :width="pxToRem(480)"
      :close-on-click-modal="false"
    >
      <div class="reject-form">
        <div class="reject-label">
          <span class="required-star">*</span>
          <span>备注内容：</span>
        </div>
        <div class="reject-textarea-wrapper">
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="5"
            maxlength="500"
            resize="none"
            placeholder="请填写驳回原因，方便对方修改后重新提交"
            show-word-limit
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="primary" :loading="rejectLoading" @click="confirmReject">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default { name: 'LaborSign' }
</script>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import EmptyState from '@/components/common/emptyState.vue'
import commonPreview from '@/components/common/commonPreview.vue'
import pdfImg from '@/assets/pdfImg.png'
import {
  getLaborSignStatus,
  submitContractBankInfo,
  rejectLaborSign
} from '@/api/api_cot'
import { getPagePermission } from '@/hooks/permissionHooks'
import { LABOR_SIGN_RECORD } from '@/mock/demoModules'
import { withTimeout } from '@/utils/requestFallback'
const { needCheckPermission, hadPermissionList } = getPagePermission('/laborSign')

// 合同状态枚举（对接后端 contractStatus 字段）
const CONTRACT_STATUS = {
  NOT_APPLIED: 'NOT_APPLIED',
  PENDING: 'PENDING',
  EXPIRED: 'EXPIRED',
  INITIATED: 'INITIATED',
  SIGNED: 'SIGNED',
  REJECTED: 'REJECTED'
}

// 可查看状态：待签署(INITIATED)/已签署(SIGNED)/已驳回(REJECTED)/已过期(EXPIRED)
// 说明：本系统域枚举中 PENDING=待发起、INITIATED=已发起待签署（即"待签署"），
// 故"待签署"对应 INITIATED 而非 PENDING；PENDING(待发起) 仍按原要求用 EmptyState 覆盖、不作为可查看态。
// 此 4 个状态下步骤条可点击切换查看，且隐藏编辑按钮
const VIEW_STATUSES = [
  CONTRACT_STATUS.INITIATED,
  CONTRACT_STATUS.SIGNED,
  CONTRACT_STATUS.REJECTED,
  CONTRACT_STATUS.EXPIRED
]

// 流程步骤定义
const steps = [
  { title: '资料填写', desc: '身份证、银行账户信息', route: '资料填写' },
  { title: '协议签署', desc: '线上劳务协议确认', route: '协议签署' }
]

// 响应式状态（原始后端数据）
const rejectLoading = ref(false)
const submitLoading = ref(false) // 提交进入下一步按钮 loading：接口响应较慢，防止重复点击
const contractStatus = ref('') // 后端合同状态：NOT_APPLIED / PENDING / EXPIRED / INITIATED / SIGNED / REJECTED
const contractStatusDesc = ref('') // 顶部状态栏展示文案
const record = ref({}) // 后端返回的劳务签署记录
const isEditingMaterial = ref(false)
// 初始化加载态：进入页面即请求状态，请求完成（成功/失败）前在下方主内容区展示 loading 占位、隐藏实际内容；
// 初始化请求失败也保持「查看页」，不回退到编辑页
const loading = ref(true)

// 编辑态表单
const materialFormRef = ref(null)
const materialForm = reactive({
  idFrontFile: '',
  idBackFile: '',
  idNumber: '',
  accountName: '',
  bankCard: '',
  bankBranch: '',
  reservedPhone: ''
})

const styleTag = {
  未申请: { color: '#666666', background: '#F2F7FF', border: '1px solid #E4E4E4' },
  待签署: { color: 'var(--theme-primary)', background: '#F5F8FE', border: '1px solid #95B4FB' },
  已签署: { color: '#04a273', background: '#F2FAF8', border: '1px solid #7BCEB6' },
  已驳回: { color: '#FF4E4E', background: '#FFF6F6', border: '1px solid #FFA2A2' },
  已过期: { color: '#F59F0C', background: '#FEFAF3', border: '1px solid #FFD997' }
}

// 弹窗
const rejectVisible = ref(false)
const rejectReason = ref('')

// ---- 计算属性 ----
// PENDING / EXPIRED：隐藏主内容区，使用 EmptyState 覆盖
const isPendingOrExpired = computed(() =>
  contractStatus.value === CONTRACT_STATUS.PENDING ||
  contractStatus.value === CONTRACT_STATUS.EXPIRED
)

// 步骤总状态：0=未加载不聚焦；1=资料填写进行中；2=第1步完成对号、第2步聚焦未完成；3=两步均完成对号
// 说明：PENDING/EXPIRED 状态页面主内容区仍由 EmptyState 覆盖（见 isPendingOrExpired），
// 但顶部步骤条展示为「第1步对号完成、第2步聚焦未完成」
const stepStatus = computed(() => {
  switch (contractStatus.value) {
    case CONTRACT_STATUS.SIGNED:
    case CONTRACT_STATUS.REJECTED:
      return 3
    case CONTRACT_STATUS.INITIATED:
    case CONTRACT_STATUS.PENDING:
    case CONTRACT_STATUS.EXPIRED:
      return 2
    case CONTRACT_STATUS.NOT_APPLIED:
      return 1
    default:
      return 0 // 数据未加载前不聚焦任何步骤
  }
})

// 当前所处面板：步骤 1/0 显示资料填写，其余显示协议签署
const currentTab = computed(() => (stepStatus.value < 2 ? '资料填写' : '协议签署'))

// 是否处于「可查看」状态（INITIATED/SIGNED/REJECTED/EXPIRED）
const isViewState = computed(() => VIEW_STATUSES.includes(contractStatus.value))

// 当前展示面板：可查看状态下由用户点击步骤条切换（activeTab），其余状态沿用各步骤默认面板
const activeTab = ref('资料填写')
const displayTab = computed(() => (isViewState.value ? activeTab.value : currentTab.value))

// 是否允许编辑：4 个可查看状态下隐藏编辑按钮
const canEdit = computed(() => !isViewState.value)

// 点击步骤条切换展示面板（仅可查看状态生效；再次点击当前面板即保持本身）
function selectStep(route) {
  if (!isViewState.value) return
  activeTab.value = route
}

// 顶部状态栏：直接展示后端返回的 contractStatusDesc
const agreementDisplayStatus = computed(() => contractStatusDesc.value || '待签署')

// 协议是否已签署
const isAgreementSigned = computed(() => contractStatus.value === CONTRACT_STATUS.SIGNED)

// 协议是否被驳回
const isContractRejected = computed(() => contractStatus.value === CONTRACT_STATUS.REJECTED)

// 协议面板状态文案
const contractStatusText = computed(() => {
  if (isAgreementSigned.value) return '已签署 / 线上劳务协议文档'
  if (isContractRejected.value) return `已驳回 / ${record.value.rejectReason || '暂无驳回原因'}`
  return '待签署 / 线上劳务协议文档'
})

// 签署时间
const signatureTime = computed(() => {
  if (!isAgreementSigned.value) return ''
  return record.value.operationTime || record.value.operationDate || ''
})

// EmptyState 文案（PENDING/EXPIRED 时生效）
const emptyStateDesc = computed(() => {
  if (contractStatus.value === CONTRACT_STATUS.PENDING) return '协议还在准备中，管理员发放后会通知您'
  if (contractStatus.value === CONTRACT_STATUS.EXPIRED) return '劳务签署链接已过期，请联系管理员重新发起～'
  return ''
})

// ---- 接口调用时机 ----
// 进入页面（onMounted）即请求状态
// 浏览器标签页切换回前台时：若当前处于"待签署"状态，则自动重新拉取状态，
// 以便用户在外部签署链接完成签署、再切回本标签页时，状态能即时刷新
function handleVisibilityChange() {
  // 待签署状态：PENDING（管理员已发起，需去外部链接签署）或 INITIATED（协议签署进行中，可点击页面签署按钮）
  const pendingStatuses = [CONTRACT_STATUS.PENDING, CONTRACT_STATUS.INITIATED]
  if (document.visibilityState === 'visible' && pendingStatuses.includes(contractStatus.value)) {
    fetchStatus(false)
  }
}

onMounted(() => {
  fetchStatus()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// 把接口 / 演示数据映射成组件内部字段
function applyRecord(data) {
  contractStatus.value = data?.contractStatus || ''
  contractStatusDesc.value = data.contractStatusDesc || ''

  // 可查看状态默认停留在「协议签署」步骤（第2步），用户可点击步骤1回看资料填写
  activeTab.value = VIEW_STATUSES.includes(contractStatus.value) ? '协议签署' : '资料填写'

  // 字段映射：将后端新字段对齐到组件内部字段名
  const bankAccount = data.bankAccount || {}
  record.value = {
    idFrontFile: data.idCardFrontUrl || '',
    idBackFile: data.idCardBackUrl || '',
    idNumber: data.idCardNo || '',
    accountName: bankAccount.accountName || '',
    bankCard: bankAccount.bankNo || '',
    bankBranch: bankAccount.bankBranch || '',
    reservedPhone: bankAccount.bankPhone || '',
    signUrl: data.esignSignUrl || '',
    contractFile: data.contractFile || '',
    operationTime: data.operationTime || '',
    operationDate: data.operationDate || '',
    rejectReason: data.rejectReason || ''
  }

  // 预填编辑表单：以当前记录带入，银行预留手机号默认带出账户手机号作为可修改默认值
  Object.assign(materialForm, {
    idFrontFile: record.value.idFrontFile,
    idBackFile: record.value.idBackFile,
    idNumber: record.value.idNumber,
    accountName: record.value.accountName,
    bankCard: record.value.bankCard,
    bankBranch: record.value.bankBranch,
    reservedPhone: record.value.reservedPhone || data.phoneNo || ''
  })
}

async function fetchStatus(showLoading = true) {
  if (showLoading) loading.value = true
  try {
    const res = await withTimeout(getLaborSignStatus())
    // 接口拿不到数据（无后端 / 超时）：回落到演示记录，保持「查看页」
    const data = res && res.code === 10000 && res.data ? res.data : LABOR_SIGN_RECORD
    if (data) applyRecord(data)
  } catch {
    // 请求异常（网络/超时等）：用演示记录保持「查看页」，不回退编辑页
    if (LABOR_SIGN_RECORD) applyRecord(LABOR_SIGN_RECORD)
  } finally {
    loading.value = false
  }
}

// 银行卡号：仅允许数字，最长 19 位
function onCardInput(val) {
  materialForm.bankCard = (val || '').replace(/\D/g, '').slice(0, 19)
}

// 银行预留手机号：仅允许数字，最长 11 位
function onPhoneInput(val) {
  materialForm.reservedPhone = (val || '').replace(/\D/g, '').slice(0, 11)
}

// 步骤状态：index 0=资料填写, 1=协议签署
// stepStatus 0 -> 都不聚焦；1 -> 第1步 current；2 -> 第1步 done、第2步 current；3 -> 两步都 done
function getStepState(index) {
  if (stepStatus.value >= 3) return 'done'
  if (stepStatus.value === 2) return index === 0 ? 'done' : 'current'
  if (stepStatus.value === 1) return index === 0 ? 'current' : ''
  return '' // stepStatus === 0：都不聚焦
}

// 是否显示对勾：第1步在 stepStatus>=2 时显示，第2步在 stepStatus>=3 时显示（0/1 均无对勾）
function showCheckFor(index) {
  return index === 0 ? stepStatus.value >= 2 : stepStatus.value >= 3
}

// 编辑资料：用户信息已在初始化时拉取并预填至 materialForm，直接进入编辑态即可
function startEdit() {
  isEditingMaterial.value = true
}

// 取消编辑：退出编辑态，保留已带入的预填信息，无需重新请求
function cancelEdit() {
  isEditingMaterial.value = false
}

function resetForm() {
  Object.assign(materialForm, {
    idFrontFile: '',
    idBackFile: '',
    idNumber: '',
    accountName: '',
    bankCard: '',
    bankBranch: '',
    reservedPhone: ''
  })
}

async function submitMaterial() {
  if (submitLoading.value) return
  if (!materialFormRef.value) return
  try {
    await materialFormRef.value.validate()
  } catch {
    return
  }
  // 对接 /api/expert/contract/submit-initiate：仅提交银行卡信息
  const params = {
    accountName: materialForm.accountName,
    bankBranch: materialForm.bankBranch,
    bankNo: materialForm.bankCard,
    bankPhone: materialForm.reservedPhone
  }
  submitLoading.value = true
  try {
    const res = await submitContractBankInfo(params)
    if (res.code === 10000) {
      ElMessage.success('资料已提交，审核结果会通过消息通知您')
      isEditingMaterial.value = false
      resetForm()
      await fetchStatus() // 重新拉取状态，stepStatus 变化后自动跳转至协议签署步骤
    }
  } catch {
    // 接口异常（网络错误/超时等）：静默处理，恢复按钮可点击状态
  } finally {
    submitLoading.value = false
  }
}

// 查看按钮（SIGNED 状态）：跳转接口返回的签署文件链接 esignSignUrl
function viewAgreement() {
  const url = record.value.signUrl
  if (!url) {
    ElMessage.warning('签署链接还没生成，稍后再来看看')
    return
  }
  window.open(url, '_blank')
}

// 签署按钮：跳转外部签署链接（路由跳转处理）
function openSign() {
  const url = record.value.signUrl
  if (!url) {
    ElMessage.warning('签署链接暂时没取到，请稍后重试')
    return
  }
  window.open(url, '_blank')
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因，方便对方修改后重新提交')
    return
  }
  rejectLoading.value = true
  try {
    const res = await rejectLaborSign({ rejectReason: rejectReason.value })
    if (res.code === 10000) {
      ElMessage.success('已驳回')
      rejectVisible.value = false
      await fetchStatus()
    }
  } finally {
    rejectReason.value = ''
    rejectLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.labor-sign {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding-bottom: 16px;
  background: var(--theme-bg);
  gap: 16px;
}

.panel {
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius);
  background: var(--theme-card);
  box-shadow: 0 12px 30px rgba(160, 118, 68, .07);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.form-section {
  .panel-header {
    padding: 24px;
    border-bottom: 1px solid var(--theme-border);
  }
}
.panel-title {
  display: flex;
  align-items: center;
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: var(--theme-text);

  &::before {
    width: 4px;
    height: 16px;
    margin-right: 8px;
    border-radius: 2px;
    background: linear-gradient(180deg, var(--theme-primary) 0%, var(--theme-primary-light) 100%);
    content: '';
  }
}

/* 顶部状态条 */
.status-bar {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 58px;
  padding: 0 24px;
  border: 1px solid var(--theme-border);
  border-radius: 14px;
  background: linear-gradient(120deg, #fffdfa 0%, #fdf6ec 100%);
}

.labor-status-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 16px;
  color: var(--theme-text-3);
}

.status-value {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid rgba(201, 118, 47, .28);
  border-radius: 999px;
  background: var(--theme-primary-soft);
  font-size: 15px;
  color: var(--theme-primary);
}

.status-value-text {
  font-size: 15px;
  color: var(--theme-text-2);
}

.status-time {
  margin-left: auto;
}

/* 标题 + 步骤条面板 */
.stepper-card {
  flex-shrink: 0;
  box-sizing: border-box;
  height: 222px;
  margin: 0 16px;
  padding: 24px 0;
  background: linear-gradient(160deg, #fffdfa 0%, #fdf8f2 100%);
}

.stepperTitleBox {
  padding: 0 24px 20px;
  border-bottom: 1px solid var(--theme-border);
}

.page-title {
  margin: 0;
  font-weight: 700;
  font-size: 18px;
  color: var(--theme-text);
}

.page-sub {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--theme-text-3);
}

/* 步骤条：设计稿为圆点在标题上方，标题/描述纵向居中堆叠，两步左右分布 */
.stepper {
  display: flex;
  position: relative;
  justify-content: space-between;
  padding: 32px 10% 0;

  &::before {
    position: absolute;
    left: 50%;
    top: 44px;
    z-index: 0;
    width: 68%;
    height: 1px;
    background: var(--theme-border);
    content: '';
    transform: translate(-49.5%, 0);
  }

  &.is-agreement-phase::before {
    background: var(--theme-primary-light);
  }
}

.step-card {
  display: flex;
  position: relative;
  z-index: 1;
  flex-direction: column;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: center;
  gap: 8px;

  &:disabled {
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    opacity: .85;
  }
}

.step-number {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--theme-primary-soft);
  font-weight: 700;
  font-size: 15px;
  color: var(--theme-primary);

  &.is-check {
    border-radius: 8px;
    background: var(--theme-primary);

    .iconfont {
      font-size: 15px;
      color: #fff;
    }
  }
}

.step-card.done .step-number,
.step-card.current .step-number {
  border-radius: 50%;
  background: var(--theme-primary);
  color: #fff;
}

.step-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-card strong {
  font-size: 16px;
  color: var(--theme-text-3);
}

.step-card.current strong,
.step-card.done strong {
  color: var(--theme-primary);
}

.step-card small {
  font-size: 13px;
  color: var(--theme-text-3);
}

/* 资料填写 + 操作栏合并容器：作为单一连续面板 */
.form-section {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  min-height: 0;
  margin: 0 16px;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius);
  background: var(--theme-card);
  box-shadow: 0 12px 30px rgba(160, 118, 68, .07);
}

/* 资料填写面板：仅布局，无独立卡片样式 */
.labor-form-panel {
  display: flex;
  overflow: auto;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  // padding: 24px;
  gap: 24px;
}
.form-section {
  .info-section {
    box-sizing: border-box;
    padding: 0 24px;
  }
}
.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  :deep(.el-input__wrapper) {
    height: 40px;
  }
}

.section-title {
  margin: 0;
  padding-left: 9px;
  border-left: 3px solid var(--theme-primary);
  line-height: 18px;
  font-weight: 500;
  font-size: 16px;
  color: var(--theme-text);
}

/* 信息内容区：浅暖圆角背景，贴合设计稿（设计稿透明度 0.6） */
.info-section-body {
  padding: 24px;
  border-radius: 12px;
  background: rgba(253, 246, 236, .72);
  &.align--center {
    display: flex;
    align-items: flex-start;
    .section-body {
      margin-right: 153px;
    }
  }
  :deep(.el-form-item__label) {
    font-size: 15px;
    color: var(--theme-text-2);
  }
}
.el-form {
  .info-section-body {
    margin-bottom: 24px;
  }
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;

  &.info-row-full {
    width: 100%;
    margin-bottom: 12px;
  }
}

.info-label {
  flex: none;
  font-size: 15px;
  color: var(--theme-text);
}

.info-value {
  font-size: 15px;
  color: var(--theme-text-2);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 410px));
  gap: 36px;
}

.id-photos {
  display: flex;
  gap: 36px;
  margin-top: 22px;
}

.id-photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.id-photo-name {
  font-size: 15px;
  color: var(--theme-text-3);
}

.id-photo-title {
  font-weight: 500;
  font-size: 15px;
  color: var(--theme-text);
}

.id-photo {
  display: flex;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 200px;
  height: 125px;
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  background: #fdf1e3;

  img {
    max-width: 100%;
    max-height: 100%;
    border-radius: 10px;
    object-fit: contain;
  }
}

.id-photo-placeholder {
  font-size: 15px;
  color: var(--theme-text-3);
}

/* 必填标识：与 Element Plus 风格一致，红色星号 */
.required-star {
  margin-right: 4px;
  color: var(--theme-danger);
}

/* 身份证号输入框：设计稿为禁用灰底 */
.id-number-item {
  width: 410px;
}

/* 底部操作栏：固定底部不伸缩，区别于上方白色卡片形成可见分隔 */

/* 底部操作栏：合并容器内底部固定栏，用细分隔线区分 */
.action-bar {
  display: flex;
  position: sticky;
  bottom: 0;
  z-index: 9;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  padding: 16px 24px;
  border-top: 1px solid var(--theme-border);
  gap: 16px;
  background: var(--theme-fill);
  box-shadow: 0 -0.14286rem 0.71429rem 0 rgba(160, 118, 68, .06);
  .el-button {
    height: 44px;
    padding: 0 28px;
    font-size: 16px;
  }
}

/* 协议签署面板 */
.labor-contract-panel {
  display: flex;
  overflow: auto;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 12px;
  margin: 0 16px;
}

.contract-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  min-height: 92px;
  padding: 16px 20px;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-fill);
  gap: 16px;
}

.contract-file {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contract-info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  strong {
    font-weight: 500;
    font-size: 16px;
    color: var(--theme-text);
  }

  span {
    font-size: 14px;
    color: var(--theme-text-3);
  }
}

.contractHint {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(201, 118, 47, .08);
  line-height: 20px;
  font-size: 13px;
  color: var(--theme-text-2);
  gap: 8px;

  .iconfont {
    flex-shrink: 0;
    font-size: 14px;
    color: var(--theme-primary);
  }
}

.contract-actions {
  display: flex;
  flex: none;
  gap: 10px;

  .el-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 122px;
    height: 40px;
    border-radius: 40px;
    cursor: pointer;
    font-size: 15px;
    .iconfont {
      margin-right: 8px;
      font-size: 15px;
    }

    &.btn-sign {
      border-color: var(--theme-primary);
      background: var(--theme-card);
      color: var(--theme-primary);
    }

    &.btn-reject {
      border-color: var(--theme-danger);
      background: var(--theme-card);
      color: var(--theme-danger);
    }
    &.view {
      border-color: var(--theme-primary);
      background: var(--theme-card);
      color: var(--theme-primary);
    }
  }
}

/* 驳回弹窗表单 */
.reject-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reject-label {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: var(--theme-text);
}

.reject-textarea-wrapper {
  position: relative;
}

/* PENDING / EXPIRED 空状态：填充页面主内容区剩余高度 */
.labor-sign-empty {
  flex: 1;
  width: auto;
  min-height: 0;
  margin: 0 16px;
  border: 1px solid var(--theme-border);
  border-radius: var(--theme-radius);
  background: var(--theme-card);
  box-shadow: 0 12px 30px rgba(160, 118, 68, .07);
}

/* 输入占位符与禁用态配色，贴近设计稿 */
.labor-form-panel :deep(.el-input__inner) {
  &::placeholder {
    color: var(--theme-text-3);
  }
}

/* 初始化加载占位：请求未完成时展示在下方主内容区，避免内容先闪现 */
.labor-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 360px;
  color: var(--theme-text-3);
  gap: 12px;

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--theme-border);
    border-top-color: var(--theme-primary);
    border-radius: 50%;
    animation: labor-spin 0.8s linear infinite;
  }

  .loading-text {
    font-size: 13px;
  }
}

@keyframes labor-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
