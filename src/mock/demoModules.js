// 演示数据：我的工作台 / 劳务签署 / 劳务结算 / 数据统计
// mock 模式下接口统一返回 data:null，各页面用这里的数据兜底，保证演示时各模块都有内容且覆盖多种状态
import { DEMO_TASKS } from '@/mock/proofreadDemo'
import { DEMO_USER } from '@/mock/demoUser'

// ===================== 我的工作台 =====================
// 工作进度：当前批次 10 份，已完成 3 份（含 1 份校对中）
export const WORKBENCH_PROGRESS = {
  contractStatus: 'SIGNED',
  todayCompletedCount: 2,
  inProgressTaskCount: 1,
  pendingTaskCount: 2,
  allocateTime: '2026-11-06 09:00:00',
  latestBatchProgress: {
    allocateId: '10293847561029384756',
    completedTaskCount: 3,
    totalTaskCount: 10
  }
}

// 历史任务：覆盖待申请结算 / 待确认结算 / 待打款 / 已结清 / 已归档 / 已驳回
export const WORKBENCH_HISTORY = [
  { id: 'HS-1001', allocateId: '10293847561029380001', totalCount: 20, completedCount: 20, settlementStatus: 'UNSETTLED', transferTime: '' },
  { id: 'HS-1002', allocateId: '10293847561029380002', totalCount: 15, completedCount: 15, settlementStatus: 'WAITING_EXPERT_CONFIRM', transferTime: '' },
  { id: 'HS-1003', allocateId: '10293847561029380003', totalCount: 12, completedCount: 12, settlementStatus: 'WAITING_PAYMENT', transferTime: '' },
  { id: 'HS-1004', allocateId: '10293847561029380004', totalCount: 30, completedCount: 30, settlementStatus: 'SETTLED', transferTime: '2026-10-28 15:20:00' },
  { id: 'HS-1005', allocateId: '10293847561029380005', totalCount: 8, completedCount: 8, settlementStatus: 'ARCHIVED', transferTime: '2026-09-16 10:05:00' },
  { id: 'HS-1006', allocateId: '10293847561029380006', totalCount: 10, completedCount: 6, settlementStatus: 'REJECTED', transferTime: '' }
]

// 从病历池演示数据中按文件状态各取一条，构造「我的任务病历」
const pickRecordByStatus = (status) => {
  for (const task of DEMO_TASKS) {
    const record = task.records.find(item => item.proofreadStatus === status)
    if (record) return { ...record, taskId: task.id, taskStatus: task.taskStatus }
  }
  return null
}

// 覆盖：待校对 / 校对中 / 待复核 / 复核中 / 待审核 / 审核通过 / 审核未通过
export const WORKBENCH_RECORDS = [1, 2, 3, 4, 5, 7, 8]
  .map(pickRecordByStatus)
  .filter(Boolean)
  .map((record, index) => ({
    ...record,
    updateTime: record.proofreadStartTime || record.createTime,
    priority: index < 2 ? '高' : '普通'
  }))

// 校对中的那份病历：工作台「继续标注」直接进入它的标注详情页
export const WORKBENCH_IN_PROGRESS = WORKBENCH_RECORDS.find(item =>
  item.proofreadStatus === 2
) || WORKBENCH_RECORDS[0]

// ===================== 劳务签署 =====================
// 默认演示状态：待签署（INITIATED），资料已填写、协议待签署
export const LABOR_SIGN_RECORD = {
  contractStatus: 'INITIATED',
  contractStatusDesc: '待签署',
  idCardNo: DEMO_USER.idCard,
  idCardFrontUrl: '',
  idCardBackUrl: '',
  bankAccount: {
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行',
    bankPhone: DEMO_USER.phone
  },
  esignSignUrl: '',
  contractFile: '智脉COT专家劳务协议.pdf',
  operationTime: '',
  operationDate: '',
  rejectReason: ''
}

// ===================== 劳务结算 =====================
// 覆盖：待申请结算 / 已申请结算 / 待确认结算 / 待打款 / 已结清 / 已归档 / 已驳回
export const SETTLEMENT_LIST = [
  {
    id: 'ST-1001',
    settlementNo: 'JS202611060001',
    allocateId: '10293847561029380001',
    totalCount: 20,
    completedCount: 20,
    settlementStatus: 'UNSETTLED',
    settlementStatusDesc: '待申请结算',
    annotationCount: 20,
    unitPrice: 35,
    beforeTaxAmount: 700,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '心内科',
    createTime: '2026-11-06 18:20:00',
    creator: '系统',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  },
  {
    id: 'ST-1002',
    settlementNo: 'JS202610290002',
    allocateId: '10293847561029380002',
    totalCount: 15,
    completedCount: 15,
    settlementStatus: 'WAITING_EXPERT_CONFIRM',
    settlementStatusDesc: '待确认结算',
    annotationCount: 15,
    unitPrice: 35,
    beforeTaxAmount: 525,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '心内科',
    createTime: '2026-10-29 09:10:00',
    creator: '管理员',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  },
  {
    id: 'ST-1003',
    settlementNo: 'JS202610180003',
    allocateId: '10293847561029380003',
    totalCount: 12,
    completedCount: 12,
    settlementStatus: 'WAITING_PAYMENT',
    settlementStatusDesc: '待打款',
    annotationCount: 12,
    unitPrice: 35,
    beforeTaxAmount: 420,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '神经内科',
    createTime: '2026-10-18 16:40:00',
    creator: '管理员',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  },
  {
    id: 'ST-1004',
    settlementNo: 'JS202609280004',
    allocateId: '10293847561029380004',
    totalCount: 30,
    completedCount: 30,
    settlementStatus: 'SETTLED',
    settlementStatusDesc: '已结清',
    annotationCount: 30,
    unitPrice: 35,
    beforeTaxAmount: 1050,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '心内科',
    createTime: '2026-09-28 11:00:00',
    creator: '管理员',
    transferTime: '2026-10-08 14:30:00',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  },
  {
    id: 'ST-1005',
    settlementNo: 'JS202609160005',
    allocateId: '10293847561029380005',
    totalCount: 8,
    completedCount: 8,
    settlementStatus: 'ARCHIVED',
    settlementStatusDesc: '已归档',
    annotationCount: 8,
    unitPrice: 35,
    beforeTaxAmount: 280,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '呼吸内科',
    createTime: '2026-09-16 10:05:00',
    creator: '管理员',
    transferTime: '2026-09-20 09:15:00',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  },
  {
    id: 'ST-1006',
    settlementNo: 'JS202609050006',
    allocateId: '10293847561029380006',
    totalCount: 10,
    completedCount: 6,
    settlementStatus: 'REJECTED',
    settlementStatusDesc: '已驳回',
    annotationCount: 6,
    unitPrice: 35,
    beforeTaxAmount: 210,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '消化内科',
    createTime: '2026-09-05 15:00:00',
    creator: '管理员',
    rejectReason: '存在 4 份病历未完成复核，请补齐后重新发起结算',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  },
  {
    id: 'ST-1007',
    settlementNo: 'JS202610270007',
    allocateId: '10293847561029380007',
    totalCount: 12,
    completedCount: 12,
    settlementStatus: 'PENDING_CONFIRM',
    settlementStatusDesc: '已申请结算',
    annotationCount: 12,
    unitPrice: 35,
    beforeTaxAmount: 420,
    doctorName: DEMO_USER.userName,
    doctorTitle: '主治医师',
    deptName: '内分泌科',
    createTime: '2026-10-27 11:20:00',
    creator: '管理员',
    accountName: DEMO_USER.userName,
    bankNo: '6222020200112345678',
    bankBranch: '中国工商银行北京市中关村支行'
  }
]

// ===================== 结算单管理（后台列表） =====================
// 由专家端结算单演示数据派生：补充医院名称与结算金额字段
const INVOICE_HOSPITAL = '演示医院'
export const INVOICE_DEMO_LIST = SETTLEMENT_LIST.map((item) => ({
  ...item,
  hospitalName: INVOICE_HOSPITAL,
  settlementAmount: item.beforeTaxAmount
}))

// 已归档结算单：取已结清 / 已归档的单据
export const INVOICE_ARCHIVED_DEMO_LIST = SETTLEMENT_LIST
  .filter(item => ['SETTLED', 'ARCHIVED'].includes(item.settlementStatus))
  .map((item) => ({
    ...item,
    hospitalName: INVOICE_HOSPITAL,
    settlementAmount: item.beforeTaxAmount,
    archiveTime: item.transferTime || item.createTime
  }))

// ===================== 数据统计 =====================
export const BOARD_STATISTICS = {
  totalRecordCount: 1268,
  pendingProofreadCount: 186,
  proofingCount: 94,
  pendingReviewCount: 132,
  reviewingCount: 76,
  completedCount: 742,
  totalCompletedTimes: 1586,
  rejectedCount: 38,
  totalRejectionTimes: 57,
  participantCount: 12
}

export const BOARD_USER_ROWS = [
  { userName: '张慧敏', completedProofreadCount: 186, totalProofreadTimes: 214, completedReviewCount: 92, totalReviewTimes: 108, rejectedRecordCount: 4, totalRejectionTimes: 5, rejectionRate: '2.3%', firstActionTime: '2026-08-12 09:20:00', lastActionTime: '2026-11-09 10:12:00', averageTimePerRecordMinutes: 26 },
  { userName: '李明远', completedProofreadCount: 172, totalProofreadTimes: 198, completedReviewCount: 86, totalReviewTimes: 95, rejectedRecordCount: 7, totalRejectionTimes: 9, rejectionRate: '4.5%', firstActionTime: '2026-08-12 09:35:00', lastActionTime: '2026-11-08 17:40:00', averageTimePerRecordMinutes: 31 },
  { userName: '王雪梅', completedProofreadCount: 158, totalProofreadTimes: 180, completedReviewCount: 74, totalReviewTimes: 88, rejectedRecordCount: 3, totalRejectionTimes: 3, rejectionRate: '1.7%', firstActionTime: '2026-08-13 08:50:00', lastActionTime: '2026-11-09 09:05:00', averageTimePerRecordMinutes: 24 },
  { userName: '赵启明', completedProofreadCount: 131, totalProofreadTimes: 165, completedReviewCount: 68, totalReviewTimes: 79, rejectedRecordCount: 9, totalRejectionTimes: 12, rejectionRate: '7.3%', firstActionTime: '2026-08-15 10:00:00', lastActionTime: '2026-11-07 16:22:00', averageTimePerRecordMinutes: 35 },
  { userName: '陈思远', completedProofreadCount: 95, totalProofreadTimes: 112, completedReviewCount: 41, totalReviewTimes: 52, rejectedRecordCount: 2, totalRejectionTimes: 2, rejectionRate: '1.8%', firstActionTime: '2026-09-01 09:10:00', lastActionTime: '2026-11-06 15:48:00', averageTimePerRecordMinutes: 28 }
]

// ===================== 系统管理 =====================
// 医院下拉 / 医院树（科室、角色页共用）
export const SYSTEM_AGENCY_OPTIONS = [
  { id: 'A1', name: '演示医院' },
  { id: 'A2', name: '演示中医院' },
  { id: 'A3', name: '演示社区医院' }
]

export const SYSTEM_AGENCY_ROWS = [
  { id: 'A1', name: '演示医院', provinceName: '北京市', cityName: '北京市', provinceId: 'P1', cityId: 'C1' },
  { id: 'A2', name: '演示中医院', provinceName: '北京市', cityName: '北京市', provinceId: 'P1', cityId: 'C1' },
  { id: 'A3', name: '演示社区医院', provinceName: '山东省', cityName: '枣庄市', provinceId: 'P2', cityId: 'C2' }
]

// 科室列表：覆盖不同医院与人数
export const SYSTEM_DEPARTMENT_ROWS = [
  { id: 'D1', departmentName: '心内科', agencyName: '演示医院', agencyId: 'A1', departmentUserNum: 12, createTime: '2026-03-12 09:20:00' },
  { id: 'D2', departmentName: '神经内科', agencyName: '演示医院', agencyId: 'A1', departmentUserNum: 9, createTime: '2026-03-12 09:22:00' },
  { id: 'D3', departmentName: '消化内科', agencyName: '演示医院', agencyId: 'A1', departmentUserNum: 7, createTime: '2026-04-02 14:05:00' },
  { id: 'D4', departmentName: '呼吸内科', agencyName: '演示中医院', agencyId: 'A2', departmentUserNum: 5, createTime: '2026-05-18 10:40:00' },
  { id: 'D5', departmentName: '内分泌科', agencyName: '演示中医院', agencyId: 'A2', departmentUserNum: 6, createTime: '2026-06-09 16:30:00' },
  { id: 'D6', departmentName: '全科门诊', agencyName: '演示社区医院', agencyId: 'A3', departmentUserNum: 3, createTime: '2026-07-21 08:50:00' }
]

// 用户列表：覆盖启用/停用、科室负责人、不同角色
export const SYSTEM_USER_ROWS = [
  { id: 'U1', account: 'zhanghuimin', userName: '张慧敏', phone: '13800006621', userSourceDesc: '院内专家', agencyName: '演示医院', departmentName: '心内科', departmentManager: true, roleNames: '标注专家', enableStatus: 1 },
  { id: 'U2', account: 'limingyuan', userName: '李明远', phone: '13900001234', userSourceDesc: '院内专家', agencyName: '演示医院', departmentName: '神经内科', departmentManager: false, roleNames: '标注专家', enableStatus: 1 },
  { id: 'U3', account: 'wangxuemei', userName: '王雪梅', phone: '13700005678', userSourceDesc: '院内专家', agencyName: '演示中医院', departmentName: '消化内科', departmentManager: true, roleNames: '复核专家', enableStatus: 1 },
  { id: 'U4', account: 'zhaoqiming', userName: '赵启明', phone: '13600009876', userSourceDesc: '院内专家', agencyName: '演示中医院', departmentName: '呼吸内科', departmentManager: false, roleNames: '审核专家', enableStatus: 2 },
  { id: 'U5', account: 'chensiyuan', userName: '陈思远', phone: '13500004321', userSourceDesc: '外聘专家', agencyName: '演示社区医院', departmentName: '全科门诊', departmentManager: false, roleNames: '标注专家', enableStatus: 1 },
  { id: 'U6', account: 'admin', userName: '系统管理员', phone: '13000001111', userSourceDesc: '平台管理员', agencyName: '演示医院', departmentName: '-', departmentManager: false, roleNames: '系统管理员', enableStatus: 1 },
  { id: 'U7', account: 'sunli', userName: '孙丽', phone: '13100002222', userSourceDesc: '院内专家', agencyName: '演示医院', departmentName: '心内科', departmentManager: false, roleNames: '标注专家', enableStatus: 2 }
]

// 角色列表
export const SYSTEM_ROLE_ROWS = [
  { id: 'R1', name: '系统管理员' },
  { id: 'R2', name: '标注专家' },
  { id: 'R3', name: '复核专家' },
  { id: 'R4', name: '审核专家' }
]

// 功能权限树（扁平结构，父节点 parentId='0'）
export const SYSTEM_MENU_TREE_FLAT = [
  { id: 'M1', parentId: '0', name: 'COT标注', groupName: '基础模块', groupSort: 1, sort: 1 },
  { id: 'M1-1', parentId: 'M1', name: '查看病历', sort: 1 },
  { id: 'M1-2', parentId: 'M1', name: '开始校对', sort: 2 },
  { id: 'M1-3', parentId: 'M1', name: '暂存与提交', sort: 3 },
  { id: 'M2', parentId: '0', name: '标注管理', groupName: '基础模块', groupSort: 1, sort: 2 },
  { id: 'M2-1', parentId: 'M2', name: '病历池查看', sort: 1 },
  { id: 'M2-2', parentId: 'M2', name: '任务管理', sort: 2 },
  { id: 'M3', parentId: '0', name: '我的工作台', groupName: '基础模块', groupSort: 1, sort: 3 },
  { id: 'M3-1', parentId: 'M3', name: '继续标注', sort: 1 },
  { id: 'M3-2', parentId: 'M3', name: '历史任务查看', sort: 2 },
  { id: 'M4', parentId: '0', name: '劳务管理', groupName: '基础模块', groupSort: 1, sort: 4 },
  { id: 'M4-1', parentId: 'M4', name: '劳务签署', sort: 1 },
  { id: 'M4-2', parentId: 'M4', name: '劳务结算', sort: 2 },
  { id: 'M5', parentId: '0', name: '系统管理', groupName: '管理后台', groupSort: 9, sort: 5 },
  { id: 'M5-1', parentId: 'M5', name: '用户管理', sort: 1 },
  { id: 'M5-2', parentId: 'M5', name: '角色权限管理', sort: 2 }
]
