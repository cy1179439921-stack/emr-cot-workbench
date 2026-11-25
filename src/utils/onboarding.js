// ===================== 专家入驻申请：状态与表单数据 =====================
// 说明：当前为演示环境，申请单保存在浏览器本地（localStorage）。
// 接入真实后端时，只需把 load / save / submit / review 换成接口调用，页面无需改动。
import { reactive } from 'vue'

const STORAGE_KEY = 'cot-onboarding-apply'

// 申请状态枚举
// 演示账号（登录页提示条可一键填入）：
//   admin / 123456     全模块账号，登录时直接置为「已通过」
//   zhuanjia / 123456  专家账号，已通过入驻，但仅展示 5 个专家相关一级菜单
//   guest / 123456     新入驻账号，每次登录都回到「未提交」并先进入驻申请
export const ONBOARDING_STATUS = {
  NOT_APPLIED: 'NOT_APPLIED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
}

// 状态文案
export const ONBOARDING_STATUS_TEXT = {
  NOT_APPLIED: '未提交',
  PENDING: '审核中',
  APPROVED: '已通过',
  REJECTED: '已驳回'
}

// 职称等级（与招募字段表一致）
export const TITLE_LEVEL_OPTIONS = ['初级医师', '主治医师', '副主任医师', '主任医师']
// 执业科室大类
export const DEPARTMENT_CATEGORY_OPTIONS = [
  '内科', '外科', '妇产科', '儿科', '口腔科', '影像科', '急诊科', '肾内科', '其他临床科室'
]
// 执业年限
export const PRACTICE_YEARS_OPTIONS = ['1 年以内', '1-3 年', '3-5 年', '5-10 年', '10 年以上']
// 最高学历
export const EDUCATION_OPTIONS = ['大专', '本科', '硕士', '博士']

// 空表单
export const createEmptyApplication = () => ({
  name: '',
  phone: '',
  idCardFront: null,
  idCardBack: null,
  idCardNo: '',
  doctorCertificate: null,
  titleLevel: '',
  titleCertificate: null,
  hospitalName: '',
  departmentCategory: '',
  yearsOfPractice: '',
  education: '',
  qualificationNote: '',
  qualificationAttachment: null,
  // 本次新增：个人简历附件
  resume: null
})

const createEmptyState = () => ({
  status: ONBOARDING_STATUS.NOT_APPLIED,
  applyNo: '',
  submittedAt: '',
  reviewedAt: '',
  rejectReason: '',
  form: createEmptyApplication()
})

// 本地存储读取（脏数据回落到默认值）
const readStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyState()
    const saved = JSON.parse(raw)
    const base = createEmptyState()
    const status = Object.values(ONBOARDING_STATUS).includes(saved?.status)
      ? saved.status
      : base.status
    return {
      ...base,
      status,
      applyNo: saved?.applyNo || '',
      submittedAt: saved?.submittedAt || '',
      reviewedAt: saved?.reviewedAt || '',
      rejectReason: saved?.rejectReason || '',
      form: { ...base.form, ...(saved?.form || {}) }
    }
  } catch (e) {
    console.warn('[入驻申请] 本地数据解析失败，使用默认值', e)
    return createEmptyState()
  }
}

// 全局单例：菜单、首页引导、入驻申请页共用同一份状态
export const onboardingState = reactive(readStorage())

// 持久化
export const persistOnboarding = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingState))
    return true
  } catch (e) {
    console.warn('[入驻申请] 保存失败', e)
    return false
  }
}

// 重新从本地读取（跨标签页同步 / 重置演示数据后刷新）
export const reloadOnboarding = () => {
  const next = readStorage()
  onboardingState.status = next.status
  onboardingState.applyNo = next.applyNo
  onboardingState.submittedAt = next.submittedAt
  onboardingState.reviewedAt = next.reviewedAt
  onboardingState.rejectReason = next.rejectReason
  onboardingState.form = next.form
  return onboardingState
}

// 是否已完成入驻（通过审核才展示其他模块）
export const isOnboardingApproved = () => onboardingState.status === ONBOARDING_STATUS.APPROVED

// 时间格式化
const formatNow = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 申请单号：ONB + 年月日 + 4 位随机
const createApplyNo = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  return `ONB${date}${String(Math.floor(Math.random() * 9000) + 1000)}`
}

// 提交申请：未通过 / 已驳回后都可以重新提交
// 暂存：只把已填内容存到本地，不改变申请状态、不进入审核
export const saveDraft = (form) => {
  onboardingState.form = { ...createEmptyApplication(), ...form }
  onboardingState.draftSavedAt = formatNow()
  persistOnboarding()
  return onboardingState
}

export const submitApplication = (form) => {
  onboardingState.form = { ...createEmptyApplication(), ...form }
  onboardingState.status = ONBOARDING_STATUS.PENDING
  onboardingState.applyNo = onboardingState.applyNo || createApplyNo()
  onboardingState.submittedAt = formatNow()
  onboardingState.reviewedAt = ''
  onboardingState.rejectReason = ''
  persistOnboarding()
  return onboardingState
}

// 审核通过
export const approveApplication = () => {
  onboardingState.status = ONBOARDING_STATUS.APPROVED
  onboardingState.reviewedAt = formatNow()
  onboardingState.rejectReason = ''
  persistOnboarding()
  return onboardingState
}

// 审核驳回
export const rejectApplication = (reason) => {
  onboardingState.status = ONBOARDING_STATUS.REJECTED
  onboardingState.reviewedAt = formatNow()
  onboardingState.rejectReason = reason || ''
  persistOnboarding()
  return onboardingState
}

// 重置（演示用：回到未提交状态）
export const resetApplication = () => {
  const empty = createEmptyState()
  onboardingState.status = empty.status
  onboardingState.applyNo = ''
  onboardingState.submittedAt = ''
  onboardingState.reviewedAt = ''
  onboardingState.rejectReason = ''
  onboardingState.form = empty.form
  persistOnboarding()
  return onboardingState
}

// ===================== 附件处理 =====================
// 图片压缩为 dataURL 缩略图（避免本地存储被大图撑爆）；PDF / Word 只保留文件信息
export const IMAGE_MAX_SIDE = 1000
export const ATTACHMENT_MAX_MB = 10

const compressImage = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        // 透明 PNG 铺白底，避免转 JPEG 后出现黑块
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = () => resolve('')
      img.src = reader.result
    }
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })

// 读取附件：返回 { name, size, type, url, kind }
// url 仅在图片时写入压缩后的 dataURL，其余类型只保留文件信息（演示环境不落盘）
export const readAttachment = async (file) => {
  const isImage = /^image\//.test(file.type)
  const url = isImage ? await compressImage(file) : ''
  return {
    name: file.name,
    size: file.size,
    type: file.type || '',
    kind: isImage ? 'image' : (/pdf$/.test(file.name) ? 'pdf' : 'file'),
    url
  }
}

// 附件大小展示
export const formatFileSize = (size) => {
  const num = Number(size) || 0
  if (num <= 0) return '-'
  if (num < 1024) return `${num} B`
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(0)} KB`
  return `${(num / 1024 / 1024).toFixed(1)} MB`
}
