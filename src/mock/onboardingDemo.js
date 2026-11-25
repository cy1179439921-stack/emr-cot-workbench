// ===================== 入驻审核管理：演示数据 =====================
// 字段依据《COT 官网招募字段表》整理，用于后台审核列表与详情页演示。
import { onboardingState, ONBOARDING_STATUS, formatFileSize } from '@/utils/onboarding'
import { DEMO_USER } from '@/mock/demoUser'

// 生成一张浅色占位证明图（data URI，避免依赖外部图片文件）
const docImage = (title, sub) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">
    <rect width="320" height="200" rx="10" fill="#fdf6ee"/>
    <rect x="10" y="10" width="300" height="180" rx="8" fill="none" stroke="#e8cfae" stroke-dasharray="6 5"/>
    <text x="160" y="92" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="18" fill="#a9762f">${title}</text>
    <text x="160" y="122" text-anchor="middle" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="12" fill="#b9a08a">${sub}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

// 简历附件（演示环境仅展示文件信息）
const resumeFile = (name, size) => ({
  name,
  size,
  type: 'application/pdf',
  kind: 'pdf',
  url: ''
})

export const ONBOARDING_DEMO_LIST = [
  {
    id: 'ONB202611200001',
    name: '李文博',
    phone: '13800138001',
    titleLevel: '主任医师',
    hospitalName: '滕州市中心人民医院',
    department: '心内科',
    applyStatus: 'PENDING',
    submittedAt: '2026-11-21 09:24:00',
    reviewedAt: '',
    rejectReason: '',
    yearsOfPractice: '10 年以上',
    education: '博士',
    idCardNo: '370402197805124312',
    idCardFront: docImage('身份证 · 人像面', '演示占位图'),
    idCardBack: docImage('身份证 · 国徽面', '演示占位图'),
    doctorCertificate: docImage('医师执业证书', '演示占位图'),
    titleCertificate: docImage('职称等级证书', '主任医师'),
    qualificationNote: '长期从事冠心病介入治疗，主持省级课题 2 项，带教规培医师 30 余人。',
    qualificationAttachment: docImage('资质补充材料', '演示占位图'),
    resume: resumeFile('李文博-个人简历.pdf', 486 * 1024)
  },
  {
    id: 'ONB202611200002',
    name: '周敏',
    phone: '13900139002',
    titleLevel: '主治医师',
    hospitalName: '枣庄市立医院',
    department: '肾内科',
    applyStatus: 'PENDING',
    submittedAt: '2026-11-21 14:52:00',
    reviewedAt: '',
    rejectReason: '',
    yearsOfPractice: '5-10 年',
    education: '硕士',
    idCardNo: '370403198902187745',
    idCardFront: docImage('身份证 · 人像面', '演示占位图'),
    idCardBack: docImage('身份证 · 国徽面', '演示占位图'),
    doctorCertificate: docImage('医师执业证书', '演示占位图'),
    titleCertificate: docImage('职称等级证书', '主治医师'),
    qualificationNote: '熟悉慢性肾脏病一体化管理，参与多中心临床研究 3 项。',
    qualificationAttachment: null,
    resume: resumeFile('周敏-个人简历.docx', 132 * 1024)
  },
  {
    id: 'ONB202611180003',
    name: '陈立新',
    phone: '13700137003',
    titleLevel: '副主任医师',
    hospitalName: '枣庄矿业集团中心医院',
    department: '急诊科',
    applyStatus: 'APPROVED',
    submittedAt: '2026-11-18 10:08:00',
    reviewedAt: '2026-11-18 16:30:00',
    rejectReason: '',
    yearsOfPractice: '10 年以上',
    education: '本科',
    idCardNo: '370405198011052219',
    idCardFront: docImage('身份证 · 人像面', '演示占位图'),
    idCardBack: docImage('身份证 · 国徽面', '演示占位图'),
    doctorCertificate: docImage('医师执业证书', '演示占位图'),
    titleCertificate: docImage('职称等级证书', '副主任医师'),
    qualificationNote: '急诊 15 年，擅长危重症抢救流程梳理。',
    qualificationAttachment: null,
    resume: resumeFile('陈立新-个人简历.pdf', 620 * 1024)
  },
  {
    id: 'ONB202611160004',
    name: '王雅楠',
    phone: '13600136004',
    titleLevel: '初级医师',
    hospitalName: '滕州市中医医院',
    department: '儿科',
    applyStatus: 'REJECTED',
    submittedAt: '2026-11-16 08:41:00',
    reviewedAt: '2026-11-16 15:12:00',
    rejectReason: '医师执业证书照片模糊，姓名与证件编号看不清，请重新上传。',
    yearsOfPractice: '1-3 年',
    education: '本科',
    idCardNo: '370481199506301128',
    idCardFront: docImage('身份证 · 人像面', '演示占位图'),
    idCardBack: docImage('身份证 · 国徽面', '演示占位图'),
    doctorCertificate: docImage('医师执业证书', '演示占位图'),
    titleCertificate: docImage('职称等级证书', '初级医师'),
    qualificationNote: '儿科住院医师，熟悉儿童常见病诊疗。',
    qualificationAttachment: null,
    resume: null
  },
  {
    id: 'ONB202611140005',
    name: '孙浩',
    phone: '13500135005',
    titleLevel: '主治医师',
    hospitalName: '枣庄市妇幼保健院',
    department: '妇产科',
    applyStatus: 'APPROVED',
    submittedAt: '2026-11-14 11:20:00',
    reviewedAt: '2026-11-14 18:05:00',
    rejectReason: '',
    yearsOfPractice: '5-10 年',
    education: '硕士',
    idCardNo: '370402198706143316',
    idCardFront: docImage('身份证 · 人像面', '演示占位图'),
    idCardBack: docImage('身份证 · 国徽面', '演示占位图'),
    doctorCertificate: docImage('医师执业证书', '演示占位图'),
    titleCertificate: docImage('职称等级证书', '主治医师'),
    qualificationNote: '产科高危妊娠管理，年手术量 300 余台。',
    qualificationAttachment: null,
    resume: resumeFile('孙浩-个人简历.pdf', 358 * 1024)
  }
]

// ===================== 列表聚合 =====================
// 把「当前账号自己提交的申请」拼到演示数据最前面，
// 这样专家端提交后，后台入驻审核管理可以立刻看到并审核，形成闭环。
// 演示账号（admin）从未填过入驻表，这里用一份示例资料补位，避免详情页整页「-」
const SELF_FALLBACK = {
  ...ONBOARDING_DEMO_LIST[0],
  name: DEMO_USER.userName,
  phone: '13800136621',
  idCardNo: DEMO_USER.idCard,
  titleLevel: '主治医师',
  hospitalName: '滕州市中心人民医院',
  department: '心内科',
  yearsOfPractice: '5-10 年',
  education: '硕士',
  qualificationNote: '长期从事心内科临床工作，熟悉冠心病、高血压的规范化诊疗。',
  resume: { ...ONBOARDING_DEMO_LIST[0].resume, name: `${DEMO_USER.userName}-个人简历.pdf` }
}

const buildSelfApplication = () => {
  const f = onboardingState.form || {}
  const attachmentUrl = (file) => (file && file.url ? file.url : '')
  return {
    id: 'SELF',
    isSelf: true,
    name: f.name || SELF_FALLBACK.name,
    phone: f.phone || SELF_FALLBACK.phone,
    titleLevel: f.titleLevel || SELF_FALLBACK.titleLevel,
    hospitalName: f.hospitalName || SELF_FALLBACK.hospitalName,
    department: f.departmentCategory || SELF_FALLBACK.department,
    applyStatus: onboardingState.status,
    submittedAt: onboardingState.submittedAt || SELF_FALLBACK.submittedAt,
    reviewedAt: onboardingState.reviewedAt || '',
    rejectReason: onboardingState.rejectReason || '',
    yearsOfPractice: f.yearsOfPractice || SELF_FALLBACK.yearsOfPractice,
    education: f.education || SELF_FALLBACK.education,
    idCardNo: f.idCardNo || SELF_FALLBACK.idCardNo,
    idCardFront: attachmentUrl(f.idCardFront) || SELF_FALLBACK.idCardFront,
    idCardBack: attachmentUrl(f.idCardBack) || SELF_FALLBACK.idCardBack,
    doctorCertificate: attachmentUrl(f.doctorCertificate) || SELF_FALLBACK.doctorCertificate,
    titleCertificate: attachmentUrl(f.titleCertificate) || SELF_FALLBACK.titleCertificate,
    qualificationNote: f.qualificationNote || SELF_FALLBACK.qualificationNote,
    qualificationAttachment: f.qualificationAttachment || SELF_FALLBACK.qualificationAttachment,
    resume: f.resume || SELF_FALLBACK.resume
  }
}

// 后台审核列表：演示数据 + 当前账号的申请
export const getOnboardingList = () => {
  const list = [...ONBOARDING_DEMO_LIST]
  if (onboardingState.status !== ONBOARDING_STATUS.NOT_APPLIED) {
    list.unshift(buildSelfApplication())
  }
  return list
}

// 审核详情：按 id 取一条（SELF 表示当前账号提交的申请）
export const getOnboardingDetail = (id) => {
  const key = String(id || '')
  if (key === 'SELF') return buildSelfApplication()
  return ONBOARDING_DEMO_LIST.find(item => item.id === key) || null
}

// 简历附件展示文案
export const resumeText = (resume) => {
  if (!resume || !resume.name) return '未上传'
  return `${resume.name}${resume.size ? ' · ' + formatFileSize(resume.size) : ''}`
}
