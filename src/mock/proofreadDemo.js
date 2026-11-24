// ===================== 文件状态常量 =====================
// 标注管理统一为三个文件状态：待标注 / 标注中 / 标注完成
// 说明：底层仍沿用历史 proofreadStatus 数值，展示层统一收敛为三态，避免老数据迁移
export const FILE_STATUS_OPTIONS = [
  { label: '待标注', value: 1, dotClass: 'statusDot1' },
  { label: '标注中', value: 2, dotClass: 'statusDot2' },
  { label: '标注完成', value: 3, dotClass: 'statusDot3' }
]

export const FILE_STATUS_TAG = {
  1: 'info',
  2: 'primary',
  3: 'success',
  4: 'primary',
  5: 'success',
  7: 'success',
  8: 'success'
}

export const FILE_STATUS_LABEL = {
  1: '待标注',
  2: '标注中',
  3: '标注完成',
  4: '标注中',
  5: '标注完成',
  7: '标注完成',
  8: '标注完成'
}

// 标注次数上限：同一份病历最多标注 4 次
export const MAX_ANNOTATE_COUNT = 4

// ===================== 病历池/任务管理 文件状态显示映射 =====================
// 病历池与任务管理只展示三态：待标注(1) / 标注中(2) / 标注完成(3)
// 历史上待复核、复核中、待审核等中间态，在标注管理里统一收敛为"标注中"或"标注完成"
export const FILE_DISPLAY_STATUS_MAP = {
  1: 1, // 待校对 → 待标注
  2: 2, // 校对中 → 标注中
  3: 3, // 待复核 → 标注完成
  4: 2, // 复核中 → 标注中
  5: 3, // 待审核 → 标注完成
  7: 3, // 审核通过 → 标注完成
  8: 3 // 审核未通过 → 标注完成
}

// 病历池/任务管理 文件状态选项
export const FILE_DISPLAY_STATUS_OPTIONS = [
  { label: '待标注', value: 1, dotClass: 'statusDot1' },
  { label: '标注中', value: 2, dotClass: 'statusDot2' },
  { label: '标注完成', value: 3, dotClass: 'statusDot3' }
]

// 将 proofreadStatus 映射为病历池显示用的文件状态值
export const toFileDisplayStatus = (proofreadStatus) => FILE_DISPLAY_STATUS_MAP[proofreadStatus] ?? proofreadStatus

// ===================== 审核状态常量 =====================
// 审核状态独立于文件状态，表示审核流程的结果
// 0: "-"（未进入审核） 1: 待审核 2: 审核通过 3: 审核未通过
export const REVIEW_STATUS_OPTIONS = [
  { label: '-', value: 0 },
  { label: '待审核', value: 1 },
  { label: '审核通过', value: 2 },
  { label: '审核未通过', value: 3 }
]

export const REVIEW_STATUS_LABEL = REVIEW_STATUS_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label
  return acc
}, {})

// proofreadStatus → 审核状态映射（默认推导，可被病历数据的 reviewStatus 字段覆盖）
export const PROOFREAD_TO_REVIEW_STATUS = {
  1: 0, // 待校对 → -
  2: 0, // 校对中 → -
  3: 0, // 待复核 → -
  4: 0, // 复核中 → -
  5: 1, // 待审核 → 待审核
  7: 2, // 审核通过 → 审核通过
  8: 3 // 审核未通过 → 审核未通过
}

export const toReviewStatus = (proofreadStatus) => PROOFREAD_TO_REVIEW_STATUS[proofreadStatus] ?? 0

// ===================== COT 病历状态常量 =====================
// COT 标注模块使用的病历状态，与文件状态的映射关系：
// 未完成(0)     → 待校对(1)、待复核(3)
// 标注中(1)     → 校对中(2)、复核中(4)
// 待审核(2)     → 待审核(5)
// 审核通过(3)   → 审核通过(7)
// 审核未通过(4) → 审核未通过(8)
export const COT_RECORD_STATUS_OPTIONS = [
  { label: '未完成', value: 0, sort: 1 },
  { label: '标注中', value: 1, sort: 0 },
  { label: '待审核', value: 2, sort: 3 },
  { label: '审核通过', value: 3, sort: 4 },
  { label: '审核未通过', value: 4, sort: 2 }
]

// 文件状态 → COT 病历状态映射
const FILE_TO_COT_STATUS = {
  1: 0, // 待校对 → 未完成
  3: 0, // 待复核 → 未完成
  2: 1, // 校对中 → 标注中
  4: 1, // 复核中 → 标注中
  5: 2, // 待审核 → 待审核
  7: 3, // 审核通过 → 审核通过
  8: 4 // 审核未通过 → 审核未通过
}

export const COT_RECORD_STATUS_TAG = {
  0: 'info',
  1: 'primary',
  2: 'warning',
  3: 'success',
  4: 'danger'
}

export const COT_RECORD_STATUS_LABEL = COT_RECORD_STATUS_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label
  return acc
}, {})

// 列表排序权重：标注中 > 未完成 > 审核未通过 > 待审核 > 审核通过
export const COT_RECORD_STATUS_SORT = {
  1: 0, // 标注中
  0: 1, // 未完成
  4: 2, // 审核未通过
  2: 3, // 待审核
  3: 4 // 审核通过
}

// 将文件状态(proofreadStatus) 映射为 COT 病历状态
export const toCotRecordStatus = (proofreadStatus) => FILE_TO_COT_STATUS[proofreadStatus] ?? 0

const statusNames = {
  0: '进行中',
  1: '已完成',
  2: '待审核',
  3: '审核中'
}

// ===================== 任务状态计算逻辑 =====================
// 根据任务下所有病历的 proofreadStatus 计算任务状态：
// 进行中(0)：无审核通过/审核未通过病历，且非全部待审核
// 待审核(2)：所有病历状态为待审核(5)
// 审核中(3)：至少一份审核通过(7)或审核未通过(8)，其余待审核(5)
// 已完成(1)：所有病历审核通过(7)
export const computeTaskStatus = (records) => {
  const statuses = records.map(r => r.proofreadStatus)
  const hasReviewResult = statuses.some(s => s === 7 || s === 8)
  const allPassed = statuses.every(s => s === 7)
  const allPendingReview = statuses.every(s => s === 5)

  if (allPassed) return 1 // 已完成
  if (allPendingReview) return 2 // 待审核
  if (hasReviewResult) return 3 // 审核中
  return 0 // 进行中
}

// 生成稳定的18位数字任务ID
const generateTaskId = (status, index) => {
  const num = 100000000000000000 + (status * 5 + index) * 10293847561
  return String(num)
}

const buildRecords = (taskId, status, taskIndex = 0) => Array.from({ length: 5 }, (_, index) => {
  const serial = String(index + 1).padStart(2, '0')
  const recordId = `${taskId}-R${serial}`
  let proofreadStatus
  // 根据任务状态生成对应的病历状态，确保 computeTaskStatus 能反推出正确的任务状态
  if (status === 0) {
    // 进行中：无审核通过/审核未通过，非全部待审核 → 混合校对类状态
    proofreadStatus = [2, 3, 4, 1, 2][index]
  } else if (status === 1) {
    // 已完成：所有病历审核通过
    proofreadStatus = 7
  } else if (status === 2) {
    // 待审核：所有病历状态为待审核
    proofreadStatus = 5
  } else if (status === 3) {
    // 审核中：至少一份审核通过或未通过，其余待审核
    proofreadStatus = [7, 8, 5, 5, 5][index]
  }
  // 审核未通过(8)的病历携带拒绝原因，在病历详情状态后展示
  const rejectReasons = ['证据缺失', '循环结构不完整', '锚定时间错误', '诊断逻辑不清', '证据引用有误']
  const rejectReason = proofreadStatus === 8 ? rejectReasons[(taskIndex + index) % rejectReasons.length] : ''
  // 审核状态：默认从 proofreadStatus 推导
  let reviewStatus = toReviewStatus(proofreadStatus)
  // 演示：给进行中任务的第2条病历（待复核）设置审核状态为"审核通过"，以演示"待复核+审核通过可删除"
  if (status === 0 && index === 1) {
    reviewStatus = 2 // 审核通过
  }
  // ===== 标注次数与标注版本 =====
  // 待标注(1) 0 次；标注中(2) 1-3 次（最后一次未完成）；其余状态 2-4 次
  const versionCount = proofreadStatus === 1
    ? 0
    : (proofreadStatus === 2 ? 1 + (index % 3) : 2 + (index % 3))
  const annotators = ['王医生', '李医生', '赵医生', '孙医生']
  const annotateVersions = Array.from({ length: versionCount }, (_, vi) => {
    const isLast = vi === versionCount - 1
    const finished = !(proofreadStatus === 2 && isLast)
    return {
      version: `V${vi + 1}`,
      annotator: annotators[(taskIndex + index + vi) % annotators.length],
      finishedAt: finished
        ? `2026-08-${String(10 + vi * 2).padStart(2, '0')} 1${vi % 9}:30:00`
        : '',
      status: finished ? 'DONE' : 'PROGRESS'
    }
  })
  return {
    id: recordId,
    documentId: `EMR-${String(taskId).substring(0, 8)}-${serial}`,
    proofreadStatus,
    annotateCount: annotateVersions.length,
    annotateVersions,
    rejectReason,
    reviewStatus,
    proofreaders: index % 2 ? '李医生' : '王医生',
    proofreadStartTime: `2026-08-${String(index + 10).padStart(2, '0')} 09:2${index}:00`,
    reviewers: status === 1 || status === 3 || index > 2 ? '赵医生' : '-',
    reviewStartTime: status === 1 || status === 3 || index > 2 ? `2026-08-${String(index + 11).padStart(2, '0')} 14:0${index}:00` : '-',
    agencyName: '演示医院',
    departmentName: index % 2 ? '神经内科' : '心内科',
    createTime: `2026-08-${String(index + 8).padStart(2, '0')} 08:00:00`
  }
})

export const DEMO_TASKS = [0, 1, 2, 3].flatMap((status) => Array.from({ length: 5 }, (_, index) => {
  const id = generateTaskId(status, index)
  const records = buildRecords(id, status, index)
  return {
    id,
    taskStatus: computeTaskStatus(records),
    targetUserNames: [index % 2 ? '李医生' : '王医生'],
    operatorName: '管理员',
    createTime: `2026-08-${String(index + 1 + status * 5).padStart(2, '0')} 10:00:00`,
    totalCount: 5,
    statusName: statusNames[status],
    records
  }
}))

export const DEMO_USER_OPTIONS = [
  { label: '王医生', value: '王医生' },
  { label: '李医生', value: '李医生' },
  { label: '管理员', value: '管理员' }
]

export const getDemoTasks = (status) => DEMO_TASKS.filter(item => item.taskStatus === Number(status))
export const getDemoTask = (id) => DEMO_TASKS.find(item => item.id === String(id)) || DEMO_TASKS[0]
export const getDemoRecords = (id) => getDemoTask(id).records.map(item => ({ ...item }))

// 展平所有任务的病历记录，用于病历池列表展示
export const getDemoAllRecords = () => DEMO_TASKS.flatMap(task =>
  task.records.map(record => ({ ...record, taskId: task.id, taskStatus: task.taskStatus }))
)

export const getDemoRecord = (recordId) => {
  for (const task of DEMO_TASKS) {
    const record = task.records.find(item => item.id === String(recordId))
    if (record) return { ...record, taskId: task.id, taskStatus: task.taskStatus }
  }
  // 兜底：优先挑一条带多个标注版本的记录，方便演示标注版本的切换
  for (const task of DEMO_TASKS) {
    const record = task.records.find(item => (item.annotateVersions?.length || 0) >= 2)
    if (record) return { ...record, id: String(recordId || record.id), taskId: task.id, taskStatus: task.taskStatus }
  }
  return { ...DEMO_TASKS[0].records[0], id: String(recordId || DEMO_TASKS[0].records[0].id), taskId: DEMO_TASKS[0].id, taskStatus: DEMO_TASKS[0].taskStatus }
}

export const DEMO_COT_DATA = {
  node_temporal_anchor: { anchor_path: 'chief_complaint', anchor_timestamp: '2026-08-24 09:30:00' },
  template_type: 'ACUTE_OR_FIRST_DIAGNOSIS',
  n1_urgency_level: 'ROUTINE_DIAGNOSIS',
  n1_primary_impressions: [{ name: '演示性头晕' }],
  n1_differential_list: [{ name: '良性阵发性位置性眩晕' }],
  n1_diagnostic_logic_cot: '患者一般情况稳定，结合现病史与检查结果，形成演示用校对思路。',
  node_evidence_block: []
}
